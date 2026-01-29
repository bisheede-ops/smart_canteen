import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

import { DeliveryAssignStyles as styles,floatingButtonStyles } from "@/assets/src/styles/DeliveryAssignStyles";

import {
  assignAgent,
  deassignAgent,
  findBestAgent,
  smartAssignAll,
  getDistance,
  getZone,
  MAX_ORDERS_PER_AGENT,
} from "../../../components/AssignHelpers";
const INACTIVE = "#DDD";
export default function DeliveryAssign() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  try {
    setLoading(true);

    const ordersSnap = await getDocs(collection(db, "food_ordered"));
    const fetchedOrders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setOrders(fetchedOrders);

    const agentsSnap = await getDocs(
      query(collection(db, "delivery_agents"), where("status", "==", "active"))
    );

    const orderCount = {};
    const distMap = {};
    const zoneMap = {};
    const busyByStatus = {};

    fetchedOrders.forEach((o) => {
      if (!o.deliveryAgentId) return;

      // Count active orders
      if (!o.delivered) {
        orderCount[o.deliveryAgentId] = (orderCount[o.deliveryAgentId] || 0) + 1;
        distMap[o.deliveryAgentId] ??= [];
        zoneMap[o.deliveryAgentId] ??= [];
        distMap[o.deliveryAgentId].push(getDistance(o.place));
        zoneMap[o.deliveryAgentId].push(getZone(o.place));
      }

      // Check if agent should be busy by order status
      if (o.delivery_status && o.delivery_status !== "not picked up" && o.delivery_status !== "delivered") {
        busyByStatus[o.deliveryAgentId] = true;
      }
    });

    setAgents(
      agentsSnap.docs.map((d) => ({
        uid: d.id,
        displayName: d.data().name,
        activeOrders: orderCount[d.id] || 0,
        distances: distMap[d.id] || [],
        zones: zoneMap[d.id] || [],
        engaged:
          busyByStatus[d.id] || (orderCount[d.id] || 0) >= MAX_ORDERS_PER_AGENT,
      }))
    );
  } finally {
    setLoading(false);
  }
};

  const listData = useMemo(() => {
    const assign = orders.filter((o) => o.toBeDelivered && !o.deliveryAgentId);
    const active = orders.filter((o) => o.toBeDelivered && o.deliveryAgentId && !o.delivered);

    return [
      { type: "header", title: "Assign Orders" },
      ...(assign.length ? assign.map((o) => ({ ...o, type: "order" })) : [{ type: "empty", text: "No orders" }]),
      { type: "header", title: "Active Deliveries" },
      ...(active.length ? active.map((o) => ({ ...o, type: "order" })) : [{ type: "empty", text: "No deliveries" }]),
    ];
  }, [orders]);

  const renderItem = ({ item }) => {
    if (item.type === "header") return <Text style={styles.sectionTitle}>{item.title}</Text>;
    if (item.type === "empty") return <Text style={styles.emptyText}>{item.text}</Text>;

    const suggested = findBestAgent(agents, item.place);

    return (
      <View style={styles.orderCard}>
        <Text><Text style={styles.bold}>User:</Text> {item.username}</Text>
        <Text><Text style={styles.bold}>Food:</Text> {item.foodName} x {item.quantity}</Text>
        <Text><Text style={styles.bold}>Place:</Text> {item.place}</Text>

       {item.deliveryAgentId && !item.delivered && (
  <View>
    <Text><Text style={styles.bold}>Delivery by:</Text> {item.deliveryAgentName}</Text>

    {item.delivery_status === "not picked up" ? (
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

        {!item.deliveryAgentId && (
          <View style={styles.agentsRow}>
            {agents.map((agent) => (
              <TouchableOpacity
                key={agent.uid}
                disabled={agent.engaged}
                style={[
                  styles.agentButton,
                  agent.engaged && { backgroundColor: INACTIVE },
                  suggested?.uid === agent.uid && { borderWidth: 3, borderColor: "green" },
                ]}
                onPress={() => assignAgent(item.id, agent).then(fetchData)}
              >
                <Text>{agent.displayName} ({agent.activeOrders})</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

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

      <TouchableOpacity style={floatingButtonStyles.button} onPress={() => smartAssignAll(orders, agents, fetchData)}>
        <Text style={floatingButtonStyles.text}>Smart Assign</Text>
      </TouchableOpacity>

      <Toast />
    </SafeAreaView>
  );
}


