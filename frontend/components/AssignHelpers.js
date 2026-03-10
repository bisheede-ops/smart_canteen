// components/AssignHelpers.js
import { doc, updateDoc, increment } from "firebase/firestore";
import Toast from "react-native-toast-message";
import { db } from "../firebaseConfig";

export const MAX_ORDERS_PER_AGENT = 6;

/* -------------------- DISTANCES & ZONES -------------------- */
export const PLACES = [
  { name: "Staff quarters near LH", distance: 0 },
  { name: "Kabani Hostel", distance: 0.15 },
  { name: "Nila Hostel", distance: 0.18 },
  { name: "Staff quarters near administrative block", distance: 0.3 },
  { name: "GECI", distance: 0.6 },
  { name: "Painavu", distance: 2.6 },
  { name: "Paremavu", distance: 5.3 },
  { name: "Cheruthoni", distance: 7.3 },
];

export const ZONES = {
  "Staff quarters near LH": "ZONE1",
  "Kabani Hostel": "ZONE1",
  "Nila Hostel": "ZONE1",
  "Staff quarters near administrative block": "ZONE1",
  GECI: "ZONE1",
  Painavu: "ZONE2",
  Paremavu: "ZONE2",
  Cheruthoni: "ZONE2",
};

/* -------------------- HELPERS -------------------- */
export const getDistance = (place) =>
  PLACES.find((p) => p.name === place)?.distance ?? Infinity;

export const getZone = (place) => ZONES[place] ?? "OTHER";

/* -------------------- STATUS HELPERS -------------------- */
export const isAgentBusyByStatus = (agentOrders = []) => {
  return agentOrders.some((o) => {
    const status = o.delivery_status?.toLowerCase();
    return status && status !== "not picked up" && status !== "delivered";
  });
};

export const canDeassignOrder = (order) => {
  return order.delivery_status?.toLowerCase() === "not picked up";
};

/* -------------------- AGENT ENGAGED CHECK -------------------- */
export const isAgentEngaged = (agent) => {
  return (
    isAgentBusyByStatus(agent.orders || []) ||
    (agent.activeOrders || 0) >= MAX_ORDERS_PER_AGENT
  );
};

/* -------------------- AGENT SCORING (ZONE FIRST) -------------------- */
export const calculateAgentScore = (agent, orderPlace) => {
  const orderDistance = getDistance(orderPlace);
  const orderZone = getZone(orderPlace);
  const distances = agent.distances || [];
  const zones = agent.zones || [];

  let score = 0;

  if (zones.includes(orderZone)) score -= 1000;

  if (distances.length) {
    const minDist = Math.min(
      ...distances.map((d) => Math.abs(d - orderDistance))
    );
    score += minDist * 10;
  } else {
    score += orderDistance * 10;
  }

  score += agent.activeOrders * 5;

  return score;
};

/* -------------------- ASSIGN / DEASSIGN -------------------- */
export const assignAgent = async (orderId, agent) => {
  if (isAgentEngaged(agent)) {
    Toast.show({ type: "info", text1: `${agent.displayName} is busy` });
    return false;
  }

  // ✅ Updated: was "food_ordered", now "orders"
  await updateDoc(doc(db, "orders", orderId), {
    deliveryAgentId:   agent.uid,
    deliveryAgentName: agent.displayName,
    delivery_status:   "not picked up",
    delivered:         false,
  });

  await updateDoc(doc(db, "delivery_agents", agent.uid), {
    total_order: increment(1),
  });

  Toast.show({ type: "success", text1: `Assigned to ${agent.displayName}` });
  return true;
};

export const deassignAgent = async (order) => {
  if (!canDeassignOrder(order)) {
    Toast.show({ type: "info", text1: `Order status: ${order.delivery_status}` });
    return false;
  }

  // ✅ Updated: was "food_ordered", now "orders"
  await updateDoc(doc(db, "orders", order.id), {
    deliveryAgentId:   null,
    deliveryAgentName: null,
    delivery_status:   null,
    delivered:         false,
  });

  if (order.deliveryAgentId) {
    await updateDoc(doc(db, "delivery_agents", order.deliveryAgentId), {
      total_order: increment(-1),
    });
  }

  Toast.show({ type: "info", text1: "Order deassigned" });
  return true;
};

/* -------------------- FIND BEST AGENT -------------------- */
export const findBestAgent = (agents, place) => {
  const eligible = agents.filter((a) => !isAgentEngaged(a));
  if (!eligible.length) return null;

  eligible.forEach((agent) => {
    agent.score = calculateAgentScore(agent, place);
  });

  eligible.sort((a, b) => a.score - b.score);
  return eligible[0];
};

/* -------------------- SMART ASSIGN -------------------- */
export const smartAssignAll = async (orders, agents, fetchData) => {
  if (!orders?.length || !agents?.length) return;

  const agentMap = {};
  agents.forEach((a) => {
    agentMap[a.uid] = {
      ...a,
      distances:    [...(a.distances || [])],
      zones:        [...(a.zones || [])],
      activeOrders: a.activeOrders || 0,
      engaged:      isAgentEngaged(a),
      orders:       a.orders || [],
    };
  });

  const unassignedOrders = orders.filter((o) => o.toBeDelivered && !o.deliveryAgentId);
  const assignedOrders = new Set();

  for (const order of unassignedOrders) {
    if (assignedOrders.has(order.id)) continue;

    const eligibleAgents = Object.values(agentMap).filter((a) => !a.engaged);
    if (!eligibleAgents.length) break;

    eligibleAgents.forEach((agent) => {
      agent.score = calculateAgentScore(agent, order.place);
    });
    eligibleAgents.sort((a, b) => a.score - b.score);

    const agent = eligibleAgents[0];
    const assigned = await assignAgent(order.id, agent);
    if (!assigned) continue;

    assignedOrders.add(order.id);
    agent.activeOrders += 1;
    agent.distances.push(getDistance(order.place));
    agent.zones.push(getZone(order.place));
    if (agent.activeOrders >= MAX_ORDERS_PER_AGENT) agent.engaged = true;

    // Cluster same-place orders
    for (const o of unassignedOrders) {
      if (assignedOrders.has(o.id)) continue;
      if (o.place === order.place && !agent.engaged) {
        const clusterAssigned = await assignAgent(o.id, agent);
        if (!clusterAssigned) continue;

        assignedOrders.add(o.id);
        agent.activeOrders += 1;
        agent.distances.push(getDistance(o.place));
        agent.zones.push(getZone(o.place));
        if (agent.activeOrders >= MAX_ORDERS_PER_AGENT) agent.engaged = true;
      }
    }
  }

  fetchData();
};