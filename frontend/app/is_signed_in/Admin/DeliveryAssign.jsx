import { Ionicons } from "@expo/vector-icons";
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

const ORANGE = "#FF7A00";
const INACTIVE = "#888";

const parseOrderDate = (createdAt) => {
  if (!createdAt) return null;
  if (typeof createdAt === "object" && createdAt.seconds) {
    return new Date(createdAt.seconds * 1000);
  }
  if (typeof createdAt === "string") {
    const d = new Date(createdAt);
    return isNaN(d) ? null : d;
  }
  return null;
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
      setOrders(
        ordersSnap.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
      );

      const agentsSnap = await getDocs(
        query(
          collection(db, "delivery_agents"),
          where("status", "==", "active")
        )
      );

      setAgents(
        agentsSnap.docs.map(docSnap => ({
          uid: docSnap.id,
          ...docSnap.data(),
        }))
      );
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

  const listData = useMemo(() => {
    const sorted = [...orders].sort((a, b) => {
      const d1 = parseOrderDate(b.createdAt);
      const d2 = parseOrderDate(a.createdAt);
      return (d1?.getTime() || 0) - (d2?.getTime() || 0);
    });

    const assign = sorted.filter(o => o.toBeDelivered && !o.deliveryAgentId);
    const delivery = sorted.filter(o => o.toBeDelivered && o.deliveryAgentId);
    const nonDelivery = sorted.filter(o => !o.toBeDelivered);

    return [
      { type: "header", title: "Assign Orders" },
      ...(assign.length ? assign.map(o => ({ ...o, type: "order" })) : [{ type: "empty", text: "No assignable orders" }]),
      { type: "header", title: "Delivery Orders" },
      ...(delivery.length ? delivery.map(o => ({ ...o, type: "order" })) : [{ type: "empty", text: "No delivery orders" }]),
      { type: "header", title: "Non-Delivery Orders" },
      ...(nonDelivery.length ? nonDelivery.map(o => ({ ...o, type: "order" })) : [{ type: "empty", text: "No non-delivery orders" }]),
    ];
  }, [orders]);

  const assignAgent = async (orderId, agent) => {
    try {
      await updateDoc(doc(db, "food_ordered", orderId), {
        deliveryAgentId: agent.uid,
        deliveryAgentName: agent.name,
        delivered: false,
      });

      await updateDoc(doc(db, "delivery_agents", agent.uid), {
        total_order: increment(1),
      });

      Toast.show({
        type: "success",
        text1: "Assigned successfully",
        text2: `Assigned to ${agent.name}`,
      });
      console.log("assigned successfully");
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
      });

      await updateDoc(doc(db, "delivery_agents", order.deliveryAgentId), {
        total_order: increment(-1),
      });

      Toast.show({
        type: "success",
        text1: "Deassigned successfully",
        text2: "Delivery agent removed",
      });
      console.log("deassigned successfully");
      fetchData();
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Deassignment Failed" });
    }
  };

  const renderItem = ({ item }) => {
    if (item.type === "header") {
      return <Text style={styles.sectionTitle}>{item.title}</Text>;
    }

    if (item.type === "empty") {
      return <Text style={styles.emptyText}>{item.text}</Text>;
    }

    return (
      <View style={styles.orderCard}>
        <Text style={styles.orderText}><Text style={styles.bold}>User:</Text> {item.username}</Text>
        <Text style={styles.orderText}><Text style={styles.bold}>Food:</Text> {item.foodName} x {item.quantity}</Text>
        <Text style={styles.orderText}><Text style={styles.bold}>Deliver to:</Text> {item.place || "Takeaway"}</Text>
        <Text style={styles.orderText}><Text style={styles.bold}>Ordered At:</Text> {formatOrderDate(item.createdAt)}</Text>
        <Text style={styles.orderText}><Text style={styles.bold}>Delivered:</Text> {item.delivery_status || "No"}</Text>

        {item.toBeDelivered && !item.deliveryAgentId && (
          <>
            <Text style={styles.assignTitle}>Assign Agent:</Text>
            <View style={styles.agentsRow}>
              {agents.map(agent => (
                <TouchableOpacity
                  key={agent.uid}
                  style={styles.agentButton}
                  onPress={() => assignAgent(item.id, agent)}
                >
                  <Text style={styles.agentText}>{agent.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {item.deliveryAgentId && (
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
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Food Orders</Text>

      <FlatList
        data={listData}
        keyExtractor={(item, index) => item.id ? item.id : `${item.type}-${index}`}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={fetchData}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <Toast />
    </SafeAreaView>
  );
}
