import { Ionicons } from "@expo/vector-icons";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../../firebaseConfig";
const ORANGE = "#FF7A00"

/* =========================
   STYLES (DEFINED FIRST)
========================= */
const localStyles = {
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: ORANGE,
    marginBottom: 10,
  },

  empty: {
    textAlign: "center",
    color: "#999",
    marginTop: 30,
    fontSize: 16,
  },

  card: {
    backgroundColor:  "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 10,
    borderLeftColor:  ORANGE,
    elevation: 0,
    shadowColor: ORANGE,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  foodName: {
    fontSize: 20,
    fontWeight: "bold",
    color: ORANGE,
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  label: {
    color: "#555",
    fontSize: 14,
  },

  value: {
    color: "#222",
    fontSize: 18,
    fontWeight: "500",
  },

  total: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 6,
  },

  date: {
    fontSize: 18,
    color: "#888",
    marginTop: 4,
  },

  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  deliveryText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#444",
  },
};

/* =========================
   COMPONENT
========================= */
export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "food_ordered"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        setOrders(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })));
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      <View style={{ padding: 16 }}>
        <Text style={localStyles.header}>Order History</Text>

        {loading && <ActivityIndicator size="large" color={ORANGE} />}

        {!loading && orders.length === 0 && (
          <Text style={localStyles.empty}>
            No orders placed yet 🍽️
          </Text>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
        {orders.map(order => (
          <View key={order.id} style={localStyles.card}>
            <Text style={localStyles.foodName}>{order.foodName}</Text>

            <View style={localStyles.row}>
              <Text style={localStyles.label}>Quantity</Text>
              <Text style={localStyles.value}>{order.quantity}</Text>
            </View>

            <View style={localStyles.row}>
              <Text style={localStyles.label}>Price</Text>
              <Text style={localStyles.value}>₹{order.price}</Text>
            </View>

            <Text style={localStyles.total}>
              Total: ₹{order.totalPrice}
            </Text>

            {order.createdAt && (
              <Text style={localStyles.date}>
                {order.createdAt.toDate().toLocaleString()}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
