// import { useRouter } from "expo-router";
// import { useEffect, useMemo, useState } from "react";
// import { FlatList, Text, TouchableOpacity, View, Alert } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import Toast from "react-native-toast-message";
// import { collection, getDocs, query, where } from "firebase/firestore";
// import { db } from "../../../firebaseConfig";

// import { DeliveryAssignStyles as styles, floatingButtonStyles } from "@/assets/src/styles/DeliveryAssignStyles";

// import {
//   assignAgent,
//   deassignAgent,
//   findBestAgent,
//   smartAssignAll,
//   getDistance,
//   getZone,
//   MAX_ORDERS_PER_AGENT,
//   isAgentEngaged
// } from "../../../components/AssignHelpers";

// const INACTIVE = "#DDD";

// export default function DeliveryAssign() {
//   const router = useRouter();
//   const [orders, setOrders] = useState([]);
//   const [agents, setAgents] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => { fetchData(); }, []);

//   const fetchData = async () => {
//     try {
//       setLoading(true);

//       const ordersSnap = await getDocs(collection(db, "food_ordered"));
//       const fetchedOrders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
//       setOrders(fetchedOrders);

//       const agentsSnap = await getDocs(
//         query(collection(db, "delivery_agents"), where("status", "==", "active"))
//       );

//       const orderCount = {};
//       const distMap = {};
//       const zoneMap = {};
//       const busyByStatus = {};

//       fetchedOrders.forEach((o) => {
//         if (!o.deliveryAgentId) return;
//         const status = o.delivery_status?.toLowerCase();
//         const delivered = o.delivered;

//         if (!delivered && status !== "delivered") {
//           orderCount[o.deliveryAgentId] = (orderCount[o.deliveryAgentId] || 0) + 1;
//           distMap[o.deliveryAgentId] ??= [];
//           zoneMap[o.deliveryAgentId] ??= [];
//           distMap[o.deliveryAgentId].push(getDistance(o.place));
//           zoneMap[o.deliveryAgentId].push(getZone(o.place));
//         }

//         if (status && status !== "not picked up" && status !== "delivered") {
//           busyByStatus[o.deliveryAgentId] = true;
//         }
//       });

//       setAgents(
//         agentsSnap.docs.map((d) => ({
//           uid: d.id,
//           displayName: d.data().name,
//           activeOrders: orderCount[d.id] || 0,
//           distances: distMap[d.id] || [],
//           zones: zoneMap[d.id] || [],
//           engaged: busyByStatus[d.id] || (orderCount[d.id] || 0) >= MAX_ORDERS_PER_AGENT,
//           orders: fetchedOrders.filter(o => o.deliveryAgentId === d.id)
//         }))
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const listData = useMemo(() => {
//     const assign = orders.filter((o) => o.toBeDelivered && !o.deliveryAgentId);
//     const active = orders.filter((o) => o.toBeDelivered && o.deliveryAgentId && !o.delivered);

//     return [
//       { type: "header", title: "Assign Orders" },
//       ...(assign.length ? assign.map((o) => ({ ...o, type: "order" })) : [{ type: "empty", text: "No orders" }]),
//       { type: "header", title: "Active Deliveries" },
//       ...(active.length ? active.map((o) => ({ ...o, type: "order" })) : [{ type: "empty", text: "No deliveries" }]),
//     ];
//   }, [orders]);

//   /* =========================
//     CONFIRM POPUPS
//   ========================= */
//   const confirmAssignAgent = (order, agent) => {
//     Alert.alert(
//       "Confirm Assignment",
//       `Assign ${agent.displayName} to deliver "${order.foodName}"?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Assign",
//           onPress: () =>
//             assignAgent(order.id, agent).then(() => {
//               fetchData();
//               Toast.show({
//                 type: "success",
//                 text1: "Agent Assigned",
//               });
//             }),
//         },
//       ]
//     );
//   };

//   const confirmSmartAssign = () => {
//     Alert.alert(
//       "Smart Assign",
//       "Automatically assign delivery agents to all pending orders?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Proceed",
//           onPress: () =>
//             smartAssignAll(orders, agents, fetchData).then(() => {
//               Toast.show({
//                 type: "success",
//                 text1: "Smart Assign Completed",
//               });
//             }),
//         },
//       ]
//     );
//   };

//   const renderItem = ({ item }) => {
//     if (item.type === "header") return <Text style={styles.sectionTitle}>{item.title}</Text>;
//     if (item.type === "empty") return <Text style={styles.emptyText}>{item.text}</Text>;

//     const suggested = findBestAgent(agents, item.place);

//     return (
//       <View style={styles.orderCard}>
//         <Text><Text style={styles.bold}>User:</Text> {item.username}</Text>
//         <Text><Text style={styles.bold}>Food:</Text> {item.foodName} x {item.quantity}</Text>
//         <Text><Text style={styles.bold}>Place:</Text> {item.place}</Text>

//         {item.deliveryAgentId && !item.delivered && (
//           <View>
//             <Text><Text style={styles.bold}>Delivery by:</Text> {item.deliveryAgentName}</Text>
//             {item.delivery_status?.toLowerCase() === "not picked up" ? (
//               <TouchableOpacity
//                 style={styles.deassignButton}
//                 onPress={() => deassignAgent(item).then(fetchData)}
//               >
//                 <Text style={styles.deassignText}>Deassign</Text>
//               </TouchableOpacity>
//             ) : (
//               <View style={styles.statusContainer}>
//                 <Text style={styles.statusText}>Status: {item.delivery_status}</Text>
//               </View>
//             )}
//           </View>
//         )}

//         {!item.deliveryAgentId && (
//           <View style={styles.agentsRow}>
//             {agents.map((agent) => (
//               <TouchableOpacity
//                 key={agent.uid}
//                 disabled={isAgentEngaged(agent)}
//                 style={[
//                   styles.agentButton,
//                   isAgentEngaged(agent) && { backgroundColor: INACTIVE },
//                   suggested?.uid === agent.uid && { borderWidth: 3, borderColor: "green" },
//                 ]}
//                 onPress={() => assignAgent(item, agent).then(fetchData)}
//               >
//                 <Text>{agent.displayName} ({agent.activeOrders})</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>Food Orders</Text>

//       <FlatList
//         data={listData}
//         renderItem={renderItem}
//         keyExtractor={(item, i) => item.id ?? `${item.type}-${i}`}
//         refreshing={loading}
//         onRefresh={fetchData}
//         contentContainerStyle={{ paddingBottom: 120 }}
//       />

//       <TouchableOpacity style={floatingButtonStyles.button} onPress= {confirmSmartAssign}>
//         <Text style={floatingButtonStyles.text}>Smart Assign</Text>
//       </TouchableOpacity>

//       <Toast />
//     </SafeAreaView>
//   );
// }

import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

import { DeliveryAssignStyles as styles, floatingButtonStyles } from "@/assets/src/styles/DeliveryAssignStyles";

import {
  assignAgent,
  deassignAgent,
  findBestAgent,
  smartAssignAll,
  getDistance,
  getZone,
  MAX_ORDERS_PER_AGENT,
  isAgentEngaged,
} from "../../../components/AssignHelpers";

const INACTIVE = "#DDD";

export default function DeliveryAssign() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // ── Fetch orders from "orders" collection ──────────────────────
      // Only fetch paid orders that are meant for delivery
      const ordersSnap = await getDocs(
        query(
          collection(db, "orders"),
          where("payment.status", "==", "paid"),
          where("deliveryDetails.toBeDelivered", "==", true)
        )
      );

      // Normalize each order to a flat shape used by the rest of the UI
      const fetchedOrders = ordersSnap.docs.map((d) => {
        const data = d.data();
        const firstItem = data.items?.[0] || {};
        return {
          id:              d.id,
          // ── user ──────────────────────────────────────────────────
          username:        data.userName       || data.userEmail || "Unknown",
          userId:          data.userId         || "",
          // ── item ─────────────────────────────────────────────────
          foodName:        firstItem.name      || "Unknown Item",
          quantity:        firstItem.quantity  || 1,
          // ── delivery ─────────────────────────────────────────────
          place:           data.deliveryDetails?.place         || "",
          toBeDelivered:   data.deliveryDetails?.toBeDelivered ?? true,
          // ── assignment (written back by assignAgent) ──────────────
          deliveryAgentId:   data.deliveryAgentId   || null,
          deliveryAgentName: data.deliveryAgentName || null,
          delivery_status:   data.delivery_status   || "not picked up",
          delivered:         data.delivered          || false,
          // ── meta ─────────────────────────────────────────────────
          orderNumber:     data.orderNumber    || d.id,
          status:          data.status         || "confirmed",
          createdAt:       data.createdAt      || null,
        };
      });

      console.log(`[DeliveryAssign] Fetched ${fetchedOrders.length} delivery order(s).`);
      setOrders(fetchedOrders);

      // ── Fetch active delivery agents ───────────────────────────────
      const agentsSnap = await getDocs(
        query(collection(db, "delivery_agents"), where("status", "==", "active"))
      );

      const orderCount  = {};
      const distMap     = {};
      const zoneMap     = {};
      const busyByStatus = {};

      fetchedOrders.forEach((o) => {
        if (!o.deliveryAgentId) return;
        const status    = o.delivery_status?.toLowerCase();
        const delivered = o.delivered;

        if (!delivered && status !== "delivered") {
          orderCount[o.deliveryAgentId] = (orderCount[o.deliveryAgentId] || 0) + 1;
          distMap[o.deliveryAgentId]  ??= [];
          zoneMap[o.deliveryAgentId]  ??= [];
          distMap[o.deliveryAgentId].push(getDistance(o.place));
          zoneMap[o.deliveryAgentId].push(getZone(o.place));
        }

        if (status && status !== "not picked up" && status !== "delivered") {
          busyByStatus[o.deliveryAgentId] = true;
        }
      });

      setAgents(
        agentsSnap.docs.map((d) => ({
          uid:          d.id,
          displayName:  d.data().name,
          activeOrders: orderCount[d.id] || 0,
          distances:    distMap[d.id]    || [],
          zones:        zoneMap[d.id]    || [],
          engaged:
            busyByStatus[d.id] ||
            (orderCount[d.id] || 0) >= MAX_ORDERS_PER_AGENT,
          orders: fetchedOrders.filter((o) => o.deliveryAgentId === d.id),
        }))
      );
    } catch (e) {
      console.error("[DeliveryAssign] ERROR in fetchData:", e);
      Toast.show({ type: "error", text1: "Failed to load orders" });
    } finally {
      setLoading(false);
    }
  };

  // ── List sections ────────────────────────────────────────────────
  const listData = useMemo(() => {
    const toAssign = orders.filter((o) => !o.deliveryAgentId);
    const active   = orders.filter((o) => o.deliveryAgentId && !o.delivered);

    return [
      { type: "header", title: "Assign Orders" },
      ...(toAssign.length
        ? toAssign.map((o) => ({ ...o, type: "order" }))
        : [{ type: "empty", text: "No pending orders" }]),

      { type: "header", title: "Active Deliveries" },
      ...(active.length
        ? active.map((o) => ({ ...o, type: "order" }))
        : [{ type: "empty", text: "No active deliveries" }]),
    ];
  }, [orders]);

  /* =========================
    CONFIRM POPUPS
  ========================= */
  const confirmAssignAgent = (order, agent) => {
    Alert.alert(
      "Confirm Assignment",
      `Assign ${agent.displayName} to deliver "${order.foodName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Assign",
          onPress: () =>
            assignAgent(order.id, agent).then(() => {
              fetchData();
              Toast.show({ type: "success", text1: "Agent Assigned" });
            }),
        },
      ]
    );
  };

  const confirmSmartAssign = () => {
    Alert.alert(
      "Smart Assign",
      "Automatically assign delivery agents to all pending orders?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Proceed",
          onPress: () =>
            smartAssignAll(orders, agents, fetchData).then(() => {
              Toast.show({ type: "success", text1: "Smart Assign Completed" });
            }),
        },
      ]
    );
  };

  /* =========================
    RENDER ITEM
  ========================= */
  const renderItem = ({ item }) => {
    if (item.type === "header")
      return <Text style={styles.sectionTitle}>{item.title}</Text>;
    if (item.type === "empty")
      return <Text style={styles.emptyText}>{item.text}</Text>;

    const suggested = findBestAgent(agents, item.place);

    return (
      <View style={styles.orderCard}>
        {/* Order number */}
        <Text style={styles.orderNumber}>#{item.orderNumber}</Text>

        <Text><Text style={styles.bold}>User:  </Text>{item.username}</Text>
        <Text><Text style={styles.bold}>Food:  </Text>{item.foodName} × {item.quantity}</Text>
        <Text><Text style={styles.bold}>Place: </Text>{item.place}</Text>

        {/* Already assigned */}
        {item.deliveryAgentId && !item.delivered && (
          <View>
            <Text>
              <Text style={styles.bold}>Delivery by: </Text>
              {item.deliveryAgentName}
            </Text>

            {item.delivery_status?.toLowerCase() === "not picked up" ? (
              <TouchableOpacity
                style={styles.deassignButton}
                onPress={() => deassignAgent(item).then(fetchData)}
              >
                <Text style={styles.deassignText}>Deassign</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                  Status: {item.delivery_status}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Not yet assigned — show agent buttons */}
        {!item.deliveryAgentId && (
          <View style={styles.agentsRow}>
            {agents.map((agent) => (
              <TouchableOpacity
                key={agent.uid}
                disabled={isAgentEngaged(agent)}
                style={[
                  styles.agentButton,
                  isAgentEngaged(agent) && { backgroundColor: INACTIVE },
                  suggested?.uid === agent.uid && {
                    borderWidth: 3,
                    borderColor: "green",
                  },
                ]}
                onPress={() => confirmAssignAgent(item, agent)}
              >
                <Text>
                  {agent.displayName} ({agent.activeOrders})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  /* =========================
    RENDER
  ========================= */
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Food Orders</Text>

      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item, i) => item.id ?? `${item.type}-${i}`}
        refreshing={loading}
        onRefresh={fetchData}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <TouchableOpacity
        style={floatingButtonStyles.button}
        onPress={confirmSmartAssign}
      >
        <Text style={floatingButtonStyles.text}>Smart Assign</Text>
      </TouchableOpacity>

      <Toast />
    </SafeAreaView>
  );
}
