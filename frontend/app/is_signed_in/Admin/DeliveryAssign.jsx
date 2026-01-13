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

/* 🔹 Date helpers */
const parseOrderDate = (createdAt) => {
  if (!createdAt) return null;
  return new Date(createdAt);
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
      const allOrders = ordersSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));

      setOrders(allOrders);

      const agentsSnap = await getDocs(
        query(
          collection(db, "delivery_agents"),
          where("status", "==", "active")
        )
      );

      setAgents(
        agentsSnap.docs.map(d => ({
          uid: d.id,
          ...d.data(),
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

  /* 🔹 Categorize + sort orders (latest first) */
  const listData = useMemo(() => {
    const sortedOrders = [...orders].sort((a, b) => {
      const d1 = parseOrderDate(b.createdAt);
      const d2 = parseOrderDate(a.createdAt);
      return (d1?.getTime() || 0) - (d2?.getTime() || 0);
    });

    const assign = sortedOrders.filter(
      o => o.toBeDelivered && !o.deliveryAgentId
    );
    const delivery = sortedOrders.filter(
      o => o.toBeDelivered && o.deliveryAgentId
    );
    const nonDelivery = sortedOrders.filter(o => !o.toBeDelivered);

    return [
      { type: "header", title: "Assign Orders" },
      ...(assign.length
        ? assign.map(o => ({ ...o, type: "order" }))
        : [{ type: "empty", text: "No assignable orders" }]),

      { type: "header", title: "Delivery Orders" },
      ...(delivery.length
        ? delivery.map(o => ({ ...o, type: "order" }))
        : [{ type: "empty", text: "No delivery orders" }]),

      { type: "header", title: "Non-Delivery Orders" },
      ...(nonDelivery.length
        ? nonDelivery.map(o => ({ ...o, type: "order" }))
        : [{ type: "empty", text: "No non-delivery orders" }]),
    ];
  }, [orders]);

  const assignAgent = async (orderId, agent) => {
    try {
      await updateDoc(doc(db, "food_ordered", orderId), {
        deliveryAgentId: agent.uid,
        deliveryAgentName: agent.name,
        deliveryBy: agent.username,
        delivered: false,
      });

      await updateDoc(doc(db, "delivery_agents", agent.uid), {
        total_order: increment(1),
      });

      Toast.show({
        type: "success",
        text1: "Assigned ✅",
        text2: `Assigned to ${agent.name}`,
      });

      fetchData();
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Assignment Failed",
      });
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
        <Text style={styles.orderText}>
          <Text style={styles.bold}>User:</Text> {item.username}
        </Text>

        <Text style={styles.orderText}>
          <Text style={styles.bold}>Food:</Text>{" "}
          {item.foodName} x {item.quantity}
        </Text>

        <Text style={styles.orderText}>
          <Text style={styles.bold}>Place:</Text>{" "}
          {item.place || "Takeaway"}
        </Text>

        <Text style={styles.orderText}>
          <Text style={styles.bold}>Ordered At:</Text>{" "}
          {formatOrderDate(item.createdAt)}
        </Text>

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
                  <Text style={styles.agentText}>
                    {agent.name} ({agent.username})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {item.deliveryAgentId && (
          <Text style={styles.assigned}>
            Assigned to: {item.deliveryAgentName}
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
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshing={loading}
        onRefresh={fetchData}
      />

      {/* 🔻 Bottom Navigation */}
      <View style={styles.navbar}>
        <NavItem
          icon="home"
          label="Home"
          onPress={() =>
            router.push("/is_signed_in/Admin/HomeScreen")
          }
        />
        <NavItem
          icon="bicycle-outline"
          label="Delivery"
          onPress={() =>
            router.push("/is_signed_in/Admin/AddDeliveryAgent")
          }
        />
        <NavItem icon="receipt-outline" label="Orders" active />
        <NavItem
          icon="person-outline"
          label="Profile"
          onPress={() =>
            router.push("/is_signed_in/Admin/ProfileScreen")
          }
        />
      </View>

      <Toast />
    </SafeAreaView>
  );
}

function NavItem({ icon, label, onPress, active }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Ionicons
        name={icon}
        size={24}
        color={active ? ORANGE : INACTIVE}
      />
      <Text style={[styles.navText, active && styles.active]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
