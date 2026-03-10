import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../../firebaseConfig";
import Ionicons from "@expo/vector-icons/Ionicons";

const ORANGE = "#FF7A00";

const formatDate = (ts) => {
  if (!ts) return "Unknown";
  const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  if (isNaN(date)) return "Unknown";
  return date.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const agentUid = auth.currentUser?.uid;

  useEffect(() => {
    if (!agentUid) {
      Toast.show({ type: "error", text1: "Not signed in", text2: "Please login again" });
      setLoading(false);
      return;
    }
    fetchOrders();
  }, [agentUid]);

  const fetchOrders = async () => {
    setLoading(true);
    console.log(`[DeliveryOrderHistory] Fetching delivered orders for agent: ${agentUid}`);
    try {
      // ✅ Updated: was "food_ordered", now "orders"
      const q = query(
        collection(db, "orders"),
        where("deliveryAgentId", "==", agentUid),
        where("delivered", "==", true)
      );

      const snap = await getDocs(q);

      // Normalize nested orders structure to flat shape
      const list = snap.docs.map((docSnap) => {
        const data = docSnap.data();
        const firstItem = data.items?.[0] || {};
        return {
          id:              docSnap.id,
          username:        data.userName             || data.userEmail || "Unknown",
          foodName:        firstItem.name            || "Unknown",
          quantity:        firstItem.quantity        || 0,
          place:           data.deliveryDetails?.place || "",
          delivered:       data.delivered            ?? true,
          delivery_status: data.delivery_status      || "Delivered",
          orderNumber:     data.orderNumber          || docSnap.id,
          createdAt:       data.createdAt            || null,
          pricing:         data.pricing              || {},
        };
      });

      console.log(`[DeliveryOrderHistory] Fetched ${list.length} delivered order(s).`);
      setOrders(list);

      if (list.length === 0) {
        Toast.show({ type: "info", text1: "No Orders", text2: "No orders delivered yet" });
      }
    } catch (error) {
      console.error("[DeliveryOrderHistory] Firestore error:", error);
      Toast.show({ type: "error", text1: "Failed to fetch orders" });
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
      </View>

      <View style={styles.divider} />

      <Text><Text style={styles.bold}>Customer: </Text>{item.username}</Text>
      <Text><Text style={styles.bold}>Food: </Text>{item.foodName} × {item.quantity}</Text>

      {item.place ? (
        <Text><Text style={styles.bold}>Place: </Text>{item.place}</Text>
      ) : null}

      {item.pricing?.total ? (
        <Text><Text style={styles.bold}>Amount: </Text>₹{item.pricing.total}</Text>
      ) : null}

      <View style={styles.deliveredBadge}>
        <Ionicons name="checkmark-circle" size={16} color="#10b981" />
        <Text style={styles.deliveredText}>Delivered</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Delivered Orders</Text>

      {loading ? (
        <ActivityIndicator size="large" color={ORANGE} />
      ) : orders.length === 0 ? (
        <Text style={styles.emptyText}>No delivered orders yet</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={fetchOrders}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFF7ED",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderNumber: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  orderDate: {
    fontSize: 11,
    color: "#aaa",
  },
  divider: {
    height: 1,
    backgroundColor: "#f5f5f5",
    marginVertical: 4,
  },
  bold: {
    fontWeight: "bold",
  },
  deliveredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  deliveredText: {
    color: "#10b981",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#777",
  },
});