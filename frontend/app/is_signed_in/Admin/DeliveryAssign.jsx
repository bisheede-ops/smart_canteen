
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
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { db } from "../../../firebaseConfig";

const ORANGE = "#FF7A00";
const INACTIVE = "#888";

export default function AdminOrderPage() {
  const router = useRouter();

  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [nonDeliveryOrders, setNonDeliveryOrders] = useState([]);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    fetchOrdersAndAgents();
  }, []);

  const fetchOrdersAndAgents = async () => {
    try {
      /* 🔹 Fetch ALL orders */
      const ordersSnap = await getDocs(query(collection(db, "food_ordered")));

      const allOrders = ordersSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setDeliveryOrders(allOrders.filter((o) => o.toBeDelivered === true));

      setNonDeliveryOrders(allOrders.filter((o) => o.toBeDelivered === false));

      /* 🔹 Fetch ACTIVE delivery agents */
      const agentsSnap = await getDocs(
        query(
          collection(db, "delivery_agents"),
          where("status", "==", "active")
        )
      );

      setAgents(
        agentsSnap.docs.map((d) => ({
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
        position: "top",
      });
    }
  };

  const assignAgent = async (orderId, agent) => {
    try {
      const orderRef = doc(db, "food_ordered", orderId);

      await updateDoc(orderRef, {
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
        position: "top",
      });

      fetchOrdersAndAgents();
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Assignment Failed",
        position: "top",
      });
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderText}>
        <Text style={styles.bold}>User:</Text> {item.username}
      </Text>
      <Text style={styles.orderText}>
        <Text style={styles.bold}>Food:</Text> {item.foodName} x {item.quantity}
      </Text>
      <Text style={styles.orderText}>
        <Text style={styles.bold}>Place:</Text> {item.place || "Takeaway"}
      </Text>

      {/* ASSIGN ONLY IF DELIVERY ORDER */}
      {item.toBeDelivered && !item.deliveryAgentId && (
        <>
          <Text style={styles.assignTitle}>Assign Agent:</Text>
          <View style={styles.agentsRow}>
            {agents.map((agent) => (
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Food Orders</Text>

      <FlatList
        data={deliveryOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <Text style={styles.sectionTitle}> Delivery Orders</Text>
            {deliveryOrders.length === 0 && (
              <Text style={styles.emptyText}>No delivery orders</Text>
            )}
          </>
        }
        ListFooterComponent={
          <>
            <Text style={styles.sectionTitle}> Non-Delivery Orders</Text>
            {nonDeliveryOrders.length === 0 && (
              <Text style={styles.emptyText}>No non-delivery orders</Text>
            )}
            {nonDeliveryOrders.map((item) => (
              <View key={item.id}>{renderOrder({ item })}</View>
            ))}
          </>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* 🔻 BOTTOM NAV */}
      <View style={styles.navbar}>
        <NavItem
          icon="home"
          label="Home"
          onPress={() => router.push("/is_signed_in/Admin/HomeScreen")}
        />
        <NavItem
          icon="bicycle-outline"
          label="Delivery"
          onPress={() => router.push("/is_signed_in/Admin/AddDeliveryAgent")}
        />
        <NavItem icon="receipt-outline" label="Orders" active />
        <NavItem
          icon="person-outline"
          label="Profile"
          onPress={() => router.push("/is_signed_in/Admin/ProfileScreen")}
        />
      </View>

      <Toast />
    </SafeAreaView>
  );
}

function NavItem({ icon, label, onPress, active }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Ionicons name={icon} size={24} color={active ? ORANGE : INACTIVE} />
      <Text style={[styles.navText, active && styles.active]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7ED" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginTop: 15,
  },
  emptyText: {
    marginHorizontal: 20,
    color: "#888",
    marginBottom: 10,
  },
  orderCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 20,
  },
  orderText: { fontSize: 14, marginBottom: 4 },
  bold: { fontWeight: "bold" },
  assigned: { fontWeight: "bold", marginTop: 5, color: "green" },
  assignTitle: { marginTop: 5, fontWeight: "bold" },
  agentsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  agentButton: {
    backgroundColor: ORANGE,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 5,
  },
  agentText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 65,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#FFE0B2",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  navItem: { alignItems: "center" },
  navText: { fontSize: 11, color: "#888", marginTop: 2 },
  active: { color: ORANGE, fontWeight: "bold" },
});
