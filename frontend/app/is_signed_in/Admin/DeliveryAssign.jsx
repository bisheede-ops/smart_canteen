import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, updateDoc, doc, query, where } from "firebase/firestore";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { db } from "../../../firebaseConfig";

const ORANGE = "#FF7A00";
const INACTIVE = "#888";

export default function AdminOrderPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch only orders where toBeDelivered is true
        const ordersQuery = query(collection(db, "food_ordered"), where("toBeDelivered", "==", true));
        const ordersSnap = await getDocs(ordersQuery);
        const ordersList = ordersSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setOrders(ordersList);

        // Fetch all delivery agents (document ID is the username)
        const agentsSnap = await getDocs(collection(db, "delivery_agents"));
        const agentsList = agentsSnap.docs.map((d) => d.id); // document ID as username
        setAgents(agentsList);
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
    fetchData();
  }, []);

  const assignAgent = async (orderId, agentUsername) => {
    if (!agentUsername || !orderId) return;

    try {
      const orderRef = doc(db, "food_ordered", orderId);
      await updateDoc(orderRef, { deliveryBy: agentUsername });

      Toast.show({
        type: "success",
        text1: "Assigned ✅",
        text2: `Order assigned to ${agentUsername}`,
        position: "top",
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, deliveryBy: agentUsername } : o))
      );
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Assignment Failed",
        text2: "Could not assign delivery agent",
        position: "top",
      });
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderText}>
        <Text style={{ fontWeight: "bold" }}>User:</Text> {item.username}
      </Text>
      <Text style={styles.orderText}>
        <Text style={{ fontWeight: "bold" }}>Food:</Text> {item.foodName} x {item.quantity}
      </Text>
      <Text style={styles.orderText}>
        <Text style={{ fontWeight: "bold" }}>Price:</Text> ₹{item.price}
      </Text>

      {item.deliveryBy ? (
        <Text style={{ fontWeight: "bold", marginTop: 5 }}>
          Assigned to: {item.deliveryBy}
        </Text>
      ) : (
        <>
          <Text style={{ marginTop: 5, fontWeight: "bold" }}>Assign Agent:</Text>
          <View style={styles.agentsRow}>
            {agents.map((agent, index) => (
              <TouchableOpacity
                key={`${agent}-${index}`}
                style={styles.agentButton}
                onPress={() => assignAgent(item.id, agent)}
              >
                <Text style={styles.agentText}>{agent}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Food Orders</Text>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 90 }}
      />

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
        <NavItem
          icon="receipt-outline"
          label="Orders"
          active
          onPress={() => router.push("/is_signed_in/Admin/OrderPage")}
        />
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
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={24} color={active ? ORANGE : INACTIVE} />
      <Text style={[styles.navText, active && { color: ORANGE, fontWeight: "bold" }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7ED", paddingTop: 10 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, paddingHorizontal: 20 },
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
  agentsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  agentButton: {
    backgroundColor: ORANGE,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 5,
  },
  agentText: { color: "#fff", fontWeight: "bold" },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 65,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#FFE0B2",
    position: "absolute",
    bottom: 0,
    width: "100%",
    zIndex: 999,
  },
  navItem: { alignItems: "center", justifyContent: "center" },
  navText: { fontSize: 11, color: "#888", marginTop: 2 },
});
