// components/AssignHelpers.js
import { doc, updateDoc, increment } from "firebase/firestore";
import Toast from "react-native-toast-message";
import { db } from "../firebaseConfig"; 

const MAX_ORDERS_PER_AGENT = 4;

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
  "Staff quarters near LH": "STAFF",
  "Kabani Hostel": "STAFF",
  "Nila Hostel": "STAFF",
  "Staff quarters near administrative block": "STAFF",
  GECI: "GECI",
  Painavu: "PAINAVU",
  Paremavu: "PAREMAVU",
  Cheruthoni: "CHERUTHONI",
};

/* -------------------- HELPERS -------------------- */
export const getDistance = (place) =>
  PLACES.find((p) => p.name === place)?.distance ?? Infinity;

export const getZone = (place) => ZONES[place] ?? "OTHER";

export const calculateAgentScore = (agent, orderPlace) => {
  let score = 0;
  const orderZone = getZone(orderPlace);
  const orderDistance = getDistance(orderPlace);

  const zones = Array.isArray(agent.zones) ? agent.zones : [];
  const distances = Array.isArray(agent.distances) ? agent.distances : [];

  if (zones.includes(orderZone)) score -= 50;

  if (distances.length) {
    const closest = Math.min(...distances.map((d) => Math.abs(d - orderDistance)));
    score += Math.floor((closest * 1000) / 100) * 10;
  } else {
    score += Math.floor((orderDistance * 1000) / 100) * 10;
  }

  return score;
};

/* -------------------- ASSIGN/DEASSIGN -------------------- */
export const assignAgent = async (orderId, agent) => {
  await updateDoc(doc(db, "food_ordered", orderId), {
    deliveryAgentId: agent.uid,
    deliveryAgentName: agent.displayName,
    delivery_status: "not picked up",
    delivered: false,
  });

  await updateDoc(doc(db, "delivery_agents", agent.uid), {
    total_order: increment(1),
  });

  Toast.show({ type: "success", text1: `Assigned to ${agent.displayName}` });
};

export const deassignAgent = async (order) => {
  await updateDoc(doc(db, "food_ordered", order.id), {
    deliveryAgentId: null,
    deliveryAgentName: null,
    delivery_status: null,
    delivered: false,
  });

  if (order.deliveryAgentId) {
    await updateDoc(doc(db, "delivery_agents", order.deliveryAgentId), {
      total_order: increment(-1),
    });
  }

  Toast.show({ type: "info", text1: "Order deassigned" });
};

/* -------------------- FIND BEST AGENT -------------------- */
export const findBestAgent = (agents, place) => {
  const eligible = agents.filter((a) => a.activeOrders < MAX_ORDERS_PER_AGENT);
  if (!eligible.length) return null;

  const orderDistanceFromCanteen = getDistance(place);

  const scoredAgents = eligible.map((agent) => ({
    ...agent,
    score: calculateAgentScore(agent, place),
  }));

  scoredAgents.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return a.activeOrders - b.activeOrders;
  });

  const bestAgent = scoredAgents[0];
  const closerAgent = scoredAgents.find(
    (a) => a.score <= Math.floor((orderDistanceFromCanteen * 1000) / 100) * 10
  );
  return closerAgent || bestAgent;
};

/* -------------------- SMART ASSIGN -------------------- */
export const smartAssignAll = async (orders, agents, fetchData) => {
  const agentMap = {};
  agents.forEach((a) => {
    agentMap[a.uid] = {
      ...a,
      distances: [...(a.distances || [])],
      zones: [...(a.zones || [])],
    };
  });

  const unassignedOrders = orders.filter((o) => o.toBeDelivered && !o.deliveryAgentId);

  for (const order of unassignedOrders) {
    const eligible = Object.values(agentMap).filter((a) => a.activeOrders < MAX_ORDERS_PER_AGENT);
    if (!eligible.length) break;

    eligible.sort((a, b) => {
      const sa = calculateAgentScore(a, order.place);
      const sb = calculateAgentScore(b, order.place);
      if (sa !== sb) return sa - sb;
      return a.activeOrders - b.activeOrders;
    });

    const agent = eligible[0];
    if (!agent) continue;

    await assignAgent(order.id, agent);

    // update local copy
    agent.activeOrders += 1;
    agent.distances.push(getDistance(order.place));
    agent.zones.push(getZone(order.place));

    if (agent.activeOrders >= MAX_ORDERS_PER_AGENT) agent.engaged = true;
  }

  fetchData();
};
