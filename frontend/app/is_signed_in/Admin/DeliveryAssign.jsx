
// import { useRouter } from "expo-router";
// import {
//   collection,
//   doc,
//   getDocs,
//   increment,
//   query,
//   updateDoc,
//   where,
// } from "firebase/firestore";
// import { useEffect, useMemo, useState } from "react";
// import {
//   FlatList,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import Toast from "react-native-toast-message";
// import { db } from "../../../firebaseConfig";

// import { DeliveryAssignStyles as styles } from "@/assets/src/styles/DeliveryAssignStyles";

// const INACTIVE = "#DDD";

// /* -------------------- Helpers -------------------- */

// const parseOrderDate = (createdAt) => {
//   if (!createdAt) return null;
//   if (createdAt?.seconds) return new Date(createdAt.seconds * 1000);
//   const d = new Date(createdAt);
//   return isNaN(d.getTime()) ? null : d;
// };

// const formatOrderDate = (createdAt) => {
//   const date = parseOrderDate(createdAt);
//   if (!date) return "Unknown time";

//   return date.toLocaleString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   });
// };

// /* -------------------- Component -------------------- */

// export default function DeliveryAssign() {
//   const router = useRouter();
//   const [orders, setOrders] = useState([]);
//   const [agents, setAgents] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   /* -------------------- Fetch Data -------------------- */

//   const fetchData = async () => {
//     try {
//       setLoading(true);

//       /* ---- Orders ---- */
//       const ordersSnap = await getDocs(collection(db, "food_ordered"));
//       const fetchedOrders = ordersSnap.docs.map(docSnap => ({
//         id: docSnap.id,
//         ...docSnap.data(),
//       }));
//       setOrders(fetchedOrders);

//       /* ---- Active Agents ---- */
//       const agentsSnap = await getDocs(
//         query(collection(db, "delivery_agents"), where("status", "==", "active"))
//       );

//       /* ---- Engagement Calculations ---- */
//       const agentOrderCount = {};     // non-delivered count
//       const agentEngagedMap = {};     // active delivery flag

//       fetchedOrders.forEach(o => {
//         if (o.deliveryAgentId && o.delivery_status !== "delivered") {

//           // Count non-delivered orders
//           agentOrderCount[o.deliveryAgentId] =
//             (agentOrderCount[o.deliveryAgentId] || 0) + 1;

//           // Actively delivering → engaged immediately
//           if (
//             ["picked up", "on my way", "reached near you"].includes(
//               o.delivery_status
//             )
//           ) {
//             agentEngagedMap[o.deliveryAgentId] = true;
//           }
//         }
//       });

//       /* ---- Final Agent Mapping ---- */
//       const agentsWithStatus = agentsSnap.docs.map(docSnap => {
//         const data = docSnap.data();
//         const activeOrders = agentOrderCount[docSnap.id] || 0;

//         const engaged =
//           activeOrders > 3 || agentEngagedMap[docSnap.id] === true;

//         return {
//           uid: docSnap.id,
//           ...data,
//           activeOrders,
//           engaged,
//           displayName: data.name,
//         };
//       });

//       setAgents(agentsWithStatus);

//     } catch (err) {
//       console.error(err);
//       Toast.show({
//         type: "error",
//         text1: "Fetch Failed",
//         text2: "Unable to fetch orders or agents",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* -------------------- List Data -------------------- */

//   const listData = useMemo(() => {
//     const sorted = [...orders].sort((a, b) => {
//       const d1 = parseOrderDate(b.createdAt);
//       const d2 = parseOrderDate(a.createdAt);
//       return (d2?.getTime() || 0) - (d1?.getTime() || 0);
//     });

//     const assign = sorted.filter(o => o.toBeDelivered && !o.deliveryAgentId);
//     const delivery = sorted.filter(o => o.toBeDelivered && o.deliveryAgentId && !o.delivered);
//     const completed = sorted.filter(o => o.delivered && o.deliveryAgentId);
//     const nonDelivery = sorted.filter(o => !o.toBeDelivered);

//     return [
//       { type: "header", title: "Assign Orders" },
//       ...(assign.length ? assign.map(o => ({ ...o, type: "order" })) : [{ type: "empty", text: "No assignable orders" }]),
//       { type: "header", title: "Delivery Orders" },
//       ...(delivery.length ? delivery.map(o => ({ ...o, type: "order" })) : [{ type: "empty", text: "No delivery orders" }]),
//       { type: "header", title: "Delivered Orders" },
//       ...(completed.length ? completed.map(o => ({ ...o, type: "order" })) : [{ type: "empty", text: "No delivered orders" }]),
//       { type: "header", title: "Non-Delivery Orders" },
//       ...(nonDelivery.length ? nonDelivery.map(o => ({ ...o, type: "order" })) : [{ type: "empty", text: "No non-delivery orders" }]),
//     ];
//   }, [orders]);

//   /* -------------------- Actions -------------------- */

//   const assignAgent = async (orderId, agent) => {
//     try {
//       await updateDoc(doc(db, "food_ordered", orderId), {
//         deliveryAgentId: agent.uid,
//         deliveryAgentName: agent.name,
//         delivered: false,
//         delivery_status: "not picked up",
//       });

//       await updateDoc(doc(db, "delivery_agents", agent.uid), {
//         total_order: increment(1),
//       });

//       Toast.show({
//         type: "success",
//         text1: "Assigned",
//         text2: `Assigned to ${agent.name}`,
//       });

//       fetchData();
//     } catch (err) {
//       console.error(err);
//       Toast.show({ type: "error", text1: "Assignment Failed" });
//     }
//   };

//   const deassignAgent = async (order) => {
//     try {
//       await updateDoc(doc(db, "food_ordered", order.id), {
//         deliveryAgentId: null,
//         deliveryAgentName: null,
//         delivery_status: null,
//       });

//       await updateDoc(doc(db, "delivery_agents", order.deliveryAgentId), {
//         total_order: increment(-1),
//       });

//       Toast.show({
//         type: "success",
//         text1: "Deassigned",
//       });

//       fetchData();
//     } catch (err) {
//       console.error(err);
//       Toast.show({ type: "error", text1: "Deassignment Failed" });
//     }
//   };

//   /* -------------------- Render -------------------- */

//   const renderItem = ({ item }) => {
//     if (item.type === "header") return <Text style={styles.sectionTitle}>{item.title}</Text>;
//     if (item.type === "empty") return <Text style={styles.emptyText}>{item.text}</Text>;

//     return (
//       <View style={styles.orderCard}>
//         <Text style={styles.orderText}><Text style={styles.bold}>User:</Text> {item.username}</Text>
//         <Text style={styles.orderText}><Text style={styles.bold}>Food:</Text> {item.foodName} x {item.quantity}</Text>
//         <Text style={styles.orderText}><Text style={styles.bold}>Deliver to:</Text> {item.place || "Takeaway"}</Text>
//         <Text style={styles.orderText}><Text style={styles.bold}>Ordered At:</Text> {formatOrderDate(item.createdAt)}</Text>
//         <Text style={styles.orderText}><Text style={styles.bold}>Status:</Text> {item.delivery_status || "No"}</Text>

//         {item.toBeDelivered && !item.deliveryAgentId && (
//           <>
//             <Text style={styles.assignTitle}>Assign Agent:</Text>
//             <View style={styles.agentsRow}>
//               {agents.map(agent => (
//                 <TouchableOpacity
//                   key={agent.uid}
//                   style={[
//                     styles.agentButton,
//                     agent.engaged && { backgroundColor: INACTIVE },
//                   ]}
//                   disabled={agent.engaged}
//                   onPress={() => assignAgent(item.id, agent)}
//                 >
//                   <Text style={styles.agentText}>
//                     {agent.displayName}
//                     {agent.activeOrders > 0 ? ` (${agent.activeOrders})` : ""}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </>
//         )}

//         {item.deliveryAgentId && !item.delivered && (
//           <>
//             <Text style={styles.assigned}>
//               Assigned to: {item.deliveryAgentName}
//             </Text>
//             <TouchableOpacity
//               style={styles.deassignButton}
//               onPress={() => deassignAgent(item)}
//             >
//               <Text style={styles.deassignText}>Deassign Agent</Text>
//             </TouchableOpacity>
//           </>
//         )}

//         {item.deliveryAgentId && item.delivered && (
//           <Text style={styles.assigned}>
//             Delivered by: {item.deliveryAgentName}
//           </Text>
//         )}
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>Food Orders</Text>

//       <FlatList
//         data={listData}
//         keyExtractor={(item, index) =>
//           item.id ? item.id : `${item.type}-${index}`
//         }
//         renderItem={renderItem}
//         refreshing={loading}
//         onRefresh={fetchData}
//         contentContainerStyle={{ paddingBottom: 120 }}
//       />

//       <Toast />
//     </SafeAreaView>
//   );
// }


import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDocs,
  increment,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { db } from "../../../firebaseConfig";

import { DeliveryAssignStyles as styles } from "@/assets/src/styles/DeliveryAssignStyles";

const INACTIVE = "#DDD";

/* -------------------- Helpers -------------------- */

const parseOrderDate = (createdAt) => {
  if (!createdAt) return null;
  if (createdAt?.seconds) return new Date(createdAt.seconds * 1000);
  const d = new Date(createdAt);
  return isNaN(d.getTime()) ? null : d;
};

const formatOrderDate = (createdAt) => {
  const date = parseOrderDate(createdAt);
  if (!date) return "Unknown time";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/* -------------------- Component -------------------- */

export default function DeliveryAssign() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  /* -------------------- Fetch Data -------------------- */

  const fetchData = async () => {
    try {
      setLoading(true);

      /* ---- Orders ---- */
      const ordersSnap = await getDocs(collection(db, "food_ordered"));
      const fetchedOrders = ordersSnap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setOrders(fetchedOrders);

      /* ---- Active Agents ---- */
      const agentsSnap = await getDocs(
        query(collection(db, "delivery_agents"), where("status", "==", "active"))
      );

      /* ---- Engagement Calculation ---- */
      const agentOrderCount = {};
      const agentEngagedMap = {};

      fetchedOrders.forEach(o => {
        if (!o.deliveryAgentId) return;

        // 🚫 Ignore delivered orders completely
        if (o.delivered === true) return;

        // ✅ Count all non-delivered orders
        agentOrderCount[o.deliveryAgentId] =
          (agentOrderCount[o.deliveryAgentId] || 0) + 1;

        // 🚨 Engage agent if actively delivering
        if (
          o.delivery_status &&
          o.delivery_status !== "not picked up"
        ) {
          agentEngagedMap[o.deliveryAgentId] = true;
        }
      });

      /* ---- Final Agent Map ---- */
      const agentsWithStatus = agentsSnap.docs.map(docSnap => {
        const data = docSnap.data();
        const activeOrders = agentOrderCount[docSnap.id] || 0;

        const engaged =
          activeOrders > 3 || agentEngagedMap[docSnap.id] === true;

        return {
          uid: docSnap.id,
          ...data,
          activeOrders,
          engaged,
          displayName: data.name,
        };
      });

      setAgents(agentsWithStatus);

    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Fetch Failed",
        text2: "Unable to fetch orders or agents",
      });
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- List Data -------------------- */

  const listData = useMemo(() => {
    const sorted = [...orders].sort((a, b) => {
      const d1 = parseOrderDate(b.createdAt);
      const d2 = parseOrderDate(a.createdAt);
      return (d2?.getTime() || 0) - (d1?.getTime() || 0);
    });

    const assign = sorted.filter(o => o.toBeDelivered && !o.deliveryAgentId);
    const delivery = sorted.filter(o => o.toBeDelivered && o.deliveryAgentId && !o.delivered);
    const completed = sorted.filter(o => o.delivered && o.deliveryAgentId);
    const nonDelivery = sorted.filter(o => !o.toBeDelivered);

    return [
      { type: "header", title: "Assign Orders" },
      ...(assign.length ? assign.map(o => ({ ...o, type: "order" })) : [{ type: "empty", text: "No assignable orders" }]),
      { type: "header", title: "Delivery Orders" },
      ...(delivery.length ? delivery.map(o => ({ ...o, type: "order" })) : [{ type: "empty", text: "No delivery orders" }]),
      { type: "header", title: "Delivered Orders" },
      ...(completed.length ? completed.map(o => ({ ...o, type: "order" })) : [{ type: "empty", text: "No delivered orders" }]),
      { type: "header", title: "Non-Delivery Orders" },
      ...(nonDelivery.length ? nonDelivery.map(o => ({ ...o, type: "order" })) : [{ type: "empty", text: "No non-delivery orders" }]),
    ];
  }, [orders]);

  /* -------------------- Actions -------------------- */

  const assignAgent = async (orderId, agent) => {
    try {
      await updateDoc(doc(db, "food_ordered", orderId), {
        deliveryAgentId: agent.uid,
        deliveryAgentName: agent.name,
        delivered: false,
        delivery_status: "not picked up",
      });

      await updateDoc(doc(db, "delivery_agents", agent.uid), {
        total_order: increment(1),
      });

      Toast.show({
        type: "success",
        text1: "Assigned",
        text2: `Assigned to ${agent.name}`,
      });

      fetchData();
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Assignment Failed" });
    }
  };

  const deassignAgent = async (order) => {
    try {
      await updateDoc(doc(db, "food_ordered", order.id), {
        deliveryAgentId: null,
        deliveryAgentName: null,
        delivery_status: null,
      });

      await updateDoc(doc(db, "delivery_agents", order.deliveryAgentId), {
        total_order: increment(-1),
      });

      Toast.show({
        type: "success",
        text1: "Deassigned",
      });

      fetchData();
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Deassignment Failed" });
    }
  };

  /* -------------------- Render -------------------- */

  const renderItem = ({ item }) => {
    if (item.type === "header") return <Text style={styles.sectionTitle}>{item.title}</Text>;
    if (item.type === "empty") return <Text style={styles.emptyText}>{item.text}</Text>;

    return (
      <View style={styles.orderCard}>
        <Text style={styles.orderText}><Text style={styles.bold}>User:</Text> {item.username}</Text>
        <Text style={styles.orderText}><Text style={styles.bold}>Food:</Text> {item.foodName} x {item.quantity}</Text>
        <Text style={styles.orderText}><Text style={styles.bold}>Deliver to:</Text> {item.place || "Takeaway"}</Text>
        <Text style={styles.orderText}><Text style={styles.bold}>Ordered At:</Text> {formatOrderDate(item.createdAt)}</Text>
        <Text style={styles.orderText}><Text style={styles.bold}>Status:</Text> {item.delivery_status || "No"}</Text>

        {item.toBeDelivered && !item.deliveryAgentId && (
          <>
            <Text style={styles.assignTitle}>Assign Agent:</Text>
            <View style={styles.agentsRow}>
              {agents.map(agent => (
                <TouchableOpacity
                  key={agent.uid}
                  style={[
                    styles.agentButton,
                    agent.engaged && { backgroundColor: INACTIVE },
                  ]}
                  disabled={agent.engaged}
                  onPress={() => assignAgent(item.id, agent)}
                >
                  <Text style={styles.agentText}>
                    {agent.displayName}
                    {agent.activeOrders > 0 ? ` (${agent.activeOrders})` : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {item.deliveryAgentId && !item.delivered && (
          <>
            <Text style={styles.assigned}>
              Assigned to: {item.deliveryAgentName}
            </Text>
            <TouchableOpacity
              style={styles.deassignButton}
              onPress={() => deassignAgent(item)}
            >
              <Text style={styles.deassignText}>Deassign Agent</Text>
            </TouchableOpacity>
          </>
        )}

        {item.deliveryAgentId && item.delivered && (
          <Text style={styles.assigned}>
            Delivered by: {item.deliveryAgentName}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Food Orders</Text>

      <FlatList
        data={listData}
        keyExtractor={(item, index) =>
          item.id ? item.id : `${item.type}-${index}`
        }
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={fetchData}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <Toast />
    </SafeAreaView>
  );
}
