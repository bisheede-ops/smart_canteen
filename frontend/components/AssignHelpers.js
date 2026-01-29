// // components/AssignHelpers.js
// import { doc, updateDoc, increment } from "firebase/firestore";
// import Toast from "react-native-toast-message";
// import { db } from "../firebaseConfig"; 

// const MAX_ORDERS_PER_AGENT = 4;

// /* -------------------- DISTANCES & ZONES -------------------- */
// export const PLACES = [
//   { name: "Staff quarters near LH", distance: 0 },
//   { name: "Kabani Hostel", distance: 0.15 },
//   { name: "Nila Hostel", distance: 0.18 },
//   { name: "Staff quarters near administrative block", distance: 0.3 },
//   { name: "GECI", distance: 0.6 },
//   { name: "Painavu", distance: 2.6 },
//   { name: "Paremavu", distance: 5.3 },
//   { name: "Cheruthoni", distance: 7.3 },
// ];

// export const ZONES = {
//   "Staff quarters near LH": "ZONE 1",
//   "Kabani Hostel": "ZONE 1",
//   "Nila Hostel": "ZONE 1",
//   "Staff quarters near administrative block": "ZONE 1",
//   GECI: "ZONE 1",
//   Painavu: "ZONE 2",
//   Paremavu: "ZONE 2",
//   Cheruthoni: "ZONE 2",
// };

// /* -------------------- HELPERS -------------------- */
// export const getDistance = (place) =>
//   PLACES.find((p) => p.name === place)?.distance ?? Infinity;

// export const getZone = (place) => ZONES[place] ?? "OTHER";

// export const calculateAgentScore = (agent, orderPlace) => {
//   let score = 0;
//   const orderZone = getZone(orderPlace);
//   const orderDistance = getDistance(orderPlace);

//   const zones = Array.isArray(agent.zones) ? agent.zones : [];
//   const distances = Array.isArray(agent.distances) ? agent.distances : [];

//   if (zones.includes(orderZone)) score -= 200;

//   if (distances.length) {
//     const closest = Math.min(...distances.map((d) => Math.abs(d - orderDistance)));
//     score += Math.floor((closest * 1000) / 100) * 10;
//   } else {
//     score += Math.floor((orderDistance * 1000) / 100) * 10;
//   }

//   return score;
// };

// /* -------------------- ASSIGN/DEASSIGN -------------------- */
// export const assignAgent = async (orderId, agent) => {
//   await updateDoc(doc(db, "food_ordered", orderId), {
//     deliveryAgentId: agent.uid,
//     deliveryAgentName: agent.displayName,
//     delivery_status: "not picked up",
//     delivered: false,
//   });

//   await updateDoc(doc(db, "delivery_agents", agent.uid), {
//     total_order: increment(1),
//   });

//   Toast.show({ type: "success", text1: `Assigned to ${agent.displayName}` });
// };

// export const deassignAgent = async (order) => {
//   await updateDoc(doc(db, "food_ordered", order.id), {
//     deliveryAgentId: null,
//     deliveryAgentName: null,
//     delivery_status: null,
//     delivered: false,
//   });

//   if (order.deliveryAgentId) {
//     await updateDoc(doc(db, "delivery_agents", order.deliveryAgentId), {
//       total_order: increment(-1),
//     });
//   }

//   Toast.show({ type: "info", text1: "Order deassigned" });
// };

// /* -------------------- FIND BEST AGENT -------------------- */
// export const findBestAgent = (agents, place) => {
//   const eligible = agents.filter((a) => a.activeOrders < MAX_ORDERS_PER_AGENT);
//   if (!eligible.length) return null;

//   const orderDistanceFromCanteen = getDistance(place);

//   const scoredAgents = eligible.map((agent) => ({
//     ...agent,
//     score: calculateAgentScore(agent, place),
//   }));

//   scoredAgents.sort((a, b) => {
//     if (a.score !== b.score) return a.score - b.score;
//     return a.activeOrders - b.activeOrders;
//   });

//   const bestAgent = scoredAgents[0];
//   const closerAgent = scoredAgents.find(
//     (a) => a.score <= Math.floor((orderDistanceFromCanteen * 1000) / 100) * 10
//   );
//   return closerAgent || bestAgent;
// };

// /* -------------------- SMART ASSIGN -------------------- */
// export const smartAssignAll = async (orders, agents, fetchData) => {
//   const agentMap = {};
//   agents.forEach((a) => {
//     agentMap[a.uid] = {
//       ...a,
//       distances: [...(a.distances || [])],
//       zones: [...(a.zones || [])],
//     };
//   });

//   const unassignedOrders = orders.filter((o) => o.toBeDelivered && !o.deliveryAgentId);

//   for (const order of unassignedOrders) {
//     const eligible = Object.values(agentMap).filter((a) => a.activeOrders < MAX_ORDERS_PER_AGENT);
//     if (!eligible.length) break;

//     eligible.sort((a, b) => {
//       const sa = calculateAgentScore(a, order.place);
//       const sb = calculateAgentScore(b, order.place);
//       if (sa !== sb) return sa - sb;
//       return a.activeOrders - b.activeOrders;
//     });

//     const agent = eligible[0];
//     if (!agent) continue;

//     await assignAgent(order.id, agent);

//     // update local copy
//     agent.activeOrders += 1;
//     agent.distances.push(getDistance(order.place));
//     agent.zones.push(getZone(order.place));

//     if (agent.activeOrders >= MAX_ORDERS_PER_AGENT) agent.engaged = true;
//   }

//   fetchData();
// };



























// // components/AssignHelpers.js
// import { doc, updateDoc, increment } from "firebase/firestore";
// import Toast from "react-native-toast-message";
// import { db } from "../firebaseConfig"; 

// const MAX_ORDERS_PER_AGENT = 4;

// /* -------------------- DISTANCES & ZONES -------------------- */
// export const PLACES = [
//   { name: "Staff quarters near LH", distance: 0 },
//   { name: "Kabani Hostel", distance: 0.15 },
//   { name: "Nila Hostel", distance: 0.18 },
//   { name: "Staff quarters near administrative block", distance: 0.3 },
//   { name: "GECI", distance: 0.6 },
//   { name: "Painavu", distance: 2.6 },
//   { name: "Paremavu", distance: 5.3 },
//   { name: "Cheruthoni", distance: 7.3 },
// ];

// export const ZONES = {
//   "Staff quarters near LH": "ZONE1",
//   "Kabani Hostel": "ZONE1",
//   "Nila Hostel": "ZONE1",
//   "Staff quarters near administrative block": "ZONE1",
//   GECI: "ZONE1",
//   Painavu: "ZONE2",
//   Paremavu: "ZONE2",
//   Cheruthoni: "ZONE2",
// };

// /* -------------------- HELPERS -------------------- */
// export const getDistance = (place) =>
//   PLACES.find((p) => p.name === place)?.distance ?? Infinity;

// export const getZone = (place) => ZONES[place] ?? "OTHER";

// /* -------------------- AGENT SCORING -------------------- */
// export const calculateAgentScore = (agent, orderPlace) => {
//   const orderDistance = getDistance(orderPlace);
//   const orderZone = getZone(orderPlace);
//   const distances = agent.distances || [];
//   const zones = agent.zones || [];

//   let score = 0;

//   // Prefer agents who already have orders in the same zone
//   if (zones.includes(orderZone)) score -= 100;

//   // Prefer agents closer to the order
//   if (distances.length) {
//     const minDist = Math.min(...distances.map((d) => Math.abs(d - orderDistance)));
//     score += minDist * 10;
//   } else {
//     score += orderDistance * 10;
//   }

//   return score;
// };

// /* -------------------- ASSIGN / DEASSIGN -------------------- */
// export const assignAgent = async (orderId, agent) => {
//   await updateDoc(doc(db, "food_ordered", orderId), {
//     deliveryAgentId: agent.uid,
//     deliveryAgentName: agent.displayName,
//     delivery_status: "not picked up",
//     delivered: false,
//   });

//   await updateDoc(doc(db, "delivery_agents", agent.uid), {
//     total_order: increment(1),
//   });

//   Toast.show({ type: "success", text1: `Assigned to ${agent.displayName}` });
// };

// export const deassignAgent = async (order) => {
//   await updateDoc(doc(db, "food_ordered", order.id), {
//     deliveryAgentId: null,
//     deliveryAgentName: null,
//     delivery_status: null,
//     delivered: false,
//   });

//   if (order.deliveryAgentId) {
//     await updateDoc(doc(db, "delivery_agents", order.deliveryAgentId), {
//       total_order: increment(-1),
//     });
//   }

//   Toast.show({ type: "info", text1: "Order deassigned" });
// };

// /* -------------------- FIND BEST AGENT -------------------- */
// export const findBestAgent = (agents, place) => {
//   // Filter eligible agents first
//   const eligible = agents.filter(a => a.activeOrders < MAX_ORDERS_PER_AGENT);
//   if (!eligible.length) return null;

//   // Score each agent
//   eligible.forEach(agent => {
//     agent.score = calculateAgentScore(agent, place);
//   });

//   // Sort alphabetically first, then by score & active orders
//   eligible.sort((a, b) => a.displayName.localeCompare(b.displayName));
//   eligible.sort((a, b) => a.score - b.score || a.activeOrders - b.activeOrders);

//   return eligible[0];
// };

// /* -------------------- SMART ASSIGN (Alphabetical Order of Place) -------------------- */
// export const smartAssignAll = async (orders, agents, fetchData) => {
//   if (!orders?.length || !agents?.length) return;

//   // Sort agents alphabetically by displayName
//   agents.sort((a, b) => a.displayName.localeCompare(b.displayName));

//   // Prepare local agent map
//   const agentMap = {};
//   agents.forEach(a => {
//     agentMap[a.uid] = {
//       ...a,
//       distances: [...(a.distances || [])],
//       zones: [...(a.zones || [])],
//       activeOrders: a.activeOrders || 0,
//       engaged: a.activeOrders >= MAX_ORDERS_PER_AGENT,
//     };
//   });

//   // Filter unassigned orders and sort them alphabetically by place
//   const unassignedOrders = orders
//     .filter(o => o.toBeDelivered && !o.deliveryAgentId)
//     .sort((a, b) => a.place.localeCompare(b.place));

//   // Track assignments
//   const assignedOrders = new Set();

//   // Main loop
//   for (const order of unassignedOrders) {
//     if (assignedOrders.has(order.id)) continue;

//     // Filter available agents
//     let eligibleAgents = Object.values(agentMap).filter(a => !a.engaged);
//     if (!eligibleAgents.length) break;

//     // Priority: agent with zero active orders
//     let agent = eligibleAgents.find(a => a.activeOrders === 0) || eligibleAgents[0];

//     // Assign the order
//     await assignAgent(order.id, agent);
//     assignedOrders.add(order.id);
//     agent.activeOrders += 1;
//     agent.distances.push(getDistance(order.place));
//     agent.zones.push(getZone(order.place));
//     if (agent.activeOrders >= MAX_ORDERS_PER_AGENT) agent.engaged = true;

//     // Cluster orders from same place
//     for (const o of unassignedOrders) {
//       if (assignedOrders.has(o.id)) continue;
//       if (o.place === order.place && !agent.engaged) {
//         await assignAgent(o.id, agent);
//         assignedOrders.add(o.id);
//         agent.activeOrders += 1;
//         agent.distances.push(getDistance(o.place));
//         agent.zones.push(getZone(o.place));
//         if (agent.activeOrders >= MAX_ORDERS_PER_AGENT) agent.engaged = true;
//       }
//     }

//     // Assign remaining orders based on distance from previous assigned orders
//     for (const o of unassignedOrders) {
//       if (assignedOrders.has(o.id)) continue;
//       if (agent.engaged) break;

//       const minDist = Math.min(...agent.distances);
//       const orderDist = getDistance(o.place);

//       if (orderDist >= minDist) {
//         await assignAgent(o.id, agent);
//         assignedOrders.add(o.id);
//         agent.activeOrders += 1;
//         agent.distances.push(orderDist);
//         agent.zones.push(getZone(o.place));
//         if (agent.activeOrders >= MAX_ORDERS_PER_AGENT) agent.engaged = true;

//         // Cluster more from same place
//         for (const s of unassignedOrders) {
//           if (assignedOrders.has(s.id)) continue;
//           if (s.place === o.place && !agent.engaged) {
//             await assignAgent(s.id, agent);
//             assignedOrders.add(s.id);
//             agent.activeOrders += 1;
//             agent.distances.push(getDistance(s.place));
//             agent.zones.push(getZone(s.place));
//             if (agent.activeOrders >= MAX_ORDERS_PER_AGENT) agent.engaged = true;
//           }
//         }
//       }
//     }
//   }

//   // Refresh UI
//   fetchData();
// };




// // components/AssignHelpers.js
// import { doc, updateDoc, increment } from "firebase/firestore";
// import Toast from "react-native-toast-message";
// import { db } from "../firebaseConfig";

// const MAX_ORDERS_PER_AGENT = 4;


// /* -------------------- DISTANCES & ZONES -------------------- */
// export const PLACES = [
//   { name: "Staff quarters near LH", distance: 0 },
//   { name: "Kabani Hostel", distance: 0.15 },
//   { name: "Nila Hostel", distance: 0.18 },
//   { name: "Staff quarters near administrative block", distance: 0.3 },
//   { name: "GECI", distance: 0.6 },
//   { name: "Painavu", distance: 2.6 },
//   { name: "Paremavu", distance: 5.3 },
//   { name: "Cheruthoni", distance: 7.3 },
// ];

// export const ZONES = {
//   "Staff quarters near LH": "ZONE1",
//   "Kabani Hostel": "ZONE1",
//   "Nila Hostel": "ZONE1",
//   "Staff quarters near administrative block": "ZONE1",
//   GECI: "ZONE1",
//   Painavu: "ZONE2",
//   Paremavu: "ZONE2",
//   Cheruthoni: "ZONE2",
// };

// /* -------------------- HELPERS -------------------- */
// export const getDistance = (place) =>
//   PLACES.find((p) => p.name === place)?.distance ?? Infinity;

// export const getZone = (place) => ZONES[place] ?? "OTHER";

// /* -------------------- AGENT SCORING (ZONE FIRST) -------------------- */
// export const calculateAgentScore = (agent, orderPlace) => {
//   const orderDistance = getDistance(orderPlace);
//   const orderZone = getZone(orderPlace);
//   const distances = agent.distances || [];
//   const zones = agent.zones || [];

//   let score = 0;

//   // STRONG priority: same zone
//   if (zones.includes(orderZone)) score -= 1000;

//   // Distance penalty
//   if (distances.length) {
//     const minDist = Math.min(
//       ...distances.map((d) => Math.abs(d - orderDistance))
//     );
//     score += minDist * 10;
//   } else {
//     score += orderDistance * 10;
//   }

//   // Light load balancing
//   score += agent.activeOrders * 5;

//   return score;
// };

// /* -------------------- ASSIGN / DEASSIGN -------------------- */
// export const assignAgent = async (orderId, agent) => {
//   await updateDoc(doc(db, "food_ordered", orderId), {
//     deliveryAgentId: agent.uid,
//     deliveryAgentName: agent.displayName,
//     delivery_status: "not picked up",
//     delivered: false,
//   });

//   await updateDoc(doc(db, "delivery_agents", agent.uid), {
//     total_order: increment(1),
//   });

//   Toast.show({
//     type: "success",
//     text1: `Assigned to ${agent.displayName}`,
//   });
// };

// export const deassignAgent = async (order) => {
//   await updateDoc(doc(db, "food_ordered", order.id), {
//     deliveryAgentId: null,
//     deliveryAgentName: null,
//     delivery_status: null,
//     delivered: false,
//   });

//   if (order.deliveryAgentId) {
//     await updateDoc(doc(db, "delivery_agents", order.deliveryAgentId), {
//       total_order: increment(-1),
//     });
//   }

//   Toast.show({ type: "info", text1: "Order deassigned" });
// };

// /* -------------------- FIND BEST AGENT (ZONE PRIORITY) -------------------- */
// export const findBestAgent = (agents, place) => {
//   const eligible = agents.filter(
//     (a) => a.activeOrders < MAX_ORDERS_PER_AGENT
//   );
//   if (!eligible.length) return null;

//   eligible.forEach((agent) => {
//     agent.score = calculateAgentScore(agent, place);
//   });

//   eligible.sort((a, b) => a.score - b.score);

//   return eligible[0];
// };

// /* -------------------- SMART ASSIGN (ZONE-FIRST, NO SORTING) -------------------- */
// export const smartAssignAll = async (orders, agents, fetchData) => {
//   if (!orders?.length || !agents?.length) return;

//   const agentMap = {};
//   agents.forEach((a) => {
//     agentMap[a.uid] = {
//       ...a,
//       distances: [...(a.distances || [])],
//       zones: [...(a.zones || [])],
//       activeOrders: a.activeOrders || 0,
//       engaged: a.activeOrders >= MAX_ORDERS_PER_AGENT,
//     };
//   });

//   const unassignedOrders = orders.filter(
//     (o) => o.toBeDelivered && !o.deliveryAgentId
//   );

//   const assignedOrders = new Set();

//   for (const order of unassignedOrders) {
//     if (assignedOrders.has(order.id)) continue;

//     const eligibleAgents = Object.values(agentMap).filter(
//       (a) => !a.engaged
//     );
//     if (!eligibleAgents.length) break;

//     eligibleAgents.forEach((agent) => {
//       agent.score = calculateAgentScore(agent, order.place);
//     });

//     eligibleAgents.sort((a, b) => a.score - b.score);

//     const agent = eligibleAgents[0];

//     await assignAgent(order.id, agent);
//     assignedOrders.add(order.id);

//     agent.activeOrders += 1;
//     agent.distances.push(getDistance(order.place));
//     agent.zones.push(getZone(order.place));
//     if (agent.activeOrders >= MAX_ORDERS_PER_AGENT) agent.engaged = true;

//     // Cluster same-place orders
//     for (const o of unassignedOrders) {
//       if (assignedOrders.has(o.id)) continue;
//       if (o.place === order.place && !agent.engaged) {
//         await assignAgent(o.id, agent);
//         assignedOrders.add(o.id);

//         agent.activeOrders += 1;
//         agent.distances.push(getDistance(o.place));
//         agent.zones.push(getZone(o.place));
//         if (agent.activeOrders >= MAX_ORDERS_PER_AGENT)
//           agent.engaged = true;
//       }
//     }
//   }

//   fetchData();
// };






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
  return agentOrders.some(
    (o) =>
      o.delivery_status &&
      o.delivery_status !== "not picked up" &&
      o.delivery_status !== "delivered"
  );
};

export const canDeassignOrder = (order) => {
  return order.delivery_status === "not picked up";
};

/* -------------------- AGENT SCORING (ZONE FIRST) -------------------- */
export const calculateAgentScore = (agent, orderPlace) => {
  const orderDistance = getDistance(orderPlace);
  const orderZone = getZone(orderPlace);
  const distances = agent.distances || [];
  const zones = agent.zones || [];

  let score = 0;

  // Strong priority: same zone
  if (zones.includes(orderZone)) score -= 1000;

  // Distance penalty
  if (distances.length) {
    const minDist = Math.min(
      ...distances.map((d) => Math.abs(d - orderDistance))
    );
    score += minDist * 10;
  } else {
    score += orderDistance * 10;
  }

  // Load balancing
  score += agent.activeOrders * 5;

  return score;
};

/* -------------------- ASSIGN / DEASSIGN -------------------- */
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

  Toast.show({
    type: "success",
    text1: `Assigned to ${agent.displayName}`,
  });
};

export const deassignAgent = async (order) => {
  if (!canDeassignOrder(order)) {
    Toast.show({
      type: "info",
      text1: `Order status: ${order.delivery_status}`,
    });
    return false; // UI can use this to disable button
  }

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
  return true;
};

/* -------------------- FIND BEST AGENT -------------------- */
export const findBestAgent = (agents, place) => {
  const eligible = agents.filter(
    (a) => !a.engaged && a.activeOrders < MAX_ORDERS_PER_AGENT
  );
  if (!eligible.length) return null;

  eligible.forEach((agent) => {
    agent.score = calculateAgentScore(agent, place);
  });

  eligible.sort((a, b) => a.score - b.score);

  return eligible[0];
};

/* -------------------- SMART ASSIGN (STATUS-AWARE) -------------------- */
export const smartAssignAll = async (orders, agents, fetchData) => {
  if (!orders?.length || !agents?.length) return;

  const agentMap = {};

  agents.forEach((a) => {
    const busyByStatus = isAgentBusyByStatus(a.orders || []);

    agentMap[a.uid] = {
      ...a,
      distances: [...(a.distances || [])],
      zones: [...(a.zones || [])],
      activeOrders: a.activeOrders || 0,
      engaged:
        busyByStatus || a.activeOrders >= MAX_ORDERS_PER_AGENT,
    };
  });

  const unassignedOrders = orders.filter(
    (o) => o.toBeDelivered && !o.deliveryAgentId
  );

  const assignedOrders = new Set();

  for (const order of unassignedOrders) {
    if (assignedOrders.has(order.id)) continue;

    const eligibleAgents = Object.values(agentMap).filter(
      (a) => !a.engaged
    );
    if (!eligibleAgents.length) break;

    eligibleAgents.forEach((agent) => {
      agent.score = calculateAgentScore(agent, order.place);
    });

    eligibleAgents.sort((a, b) => a.score - b.score);
    const agent = eligibleAgents[0];

    await assignAgent(order.id, agent);
    assignedOrders.add(order.id);

    agent.activeOrders += 1;
    agent.distances.push(getDistance(order.place));
    agent.zones.push(getZone(order.place));

    if (agent.activeOrders >= MAX_ORDERS_PER_AGENT) {
      agent.engaged = true;
    }

    // Cluster same-place orders
    for (const o of unassignedOrders) {
      if (assignedOrders.has(o.id)) continue;
      if (o.place === order.place && !agent.engaged) {
        await assignAgent(o.id, agent);
        assignedOrders.add(o.id);

        agent.activeOrders += 1;
        agent.distances.push(getDistance(o.place));
        agent.zones.push(getZone(o.place));

        if (agent.activeOrders >= MAX_ORDERS_PER_AGENT) {
          agent.engaged = true;
        }
      }
    }
  }

  fetchData();
};
