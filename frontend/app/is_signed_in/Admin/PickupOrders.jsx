import { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator, FlatList, Text,
  View, StyleSheet, TouchableOpacity, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import {
  collection, query, where, orderBy,
  getDocs, updateDoc, doc,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { useRouter } from "expo-router";

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

export default function PickupOrders() {
  const router = useRouter();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    console.log("[PickupOrders] Fetching pending self-pickup orders...");
    try {
      const q = query(
        collection(db, "orders"),
        where("deliveryDetails.toBeDelivered", "==", false),
        where("status", "in", ["confirmed", "preparing", "ready"]),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log(`[PickupOrders] Fetched ${list.length} pending pickup order(s).`);
      setOrders(list);
    } catch (err) {
      console.error("[PickupOrders] ERROR fetching orders:", err);
      Toast.show({ type: "error", text1: "Failed to fetch pickup orders" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const confirmMarkPickedUp = (order) => {
    Alert.alert(
      "Mark as Picked Up",
      `Confirm that "${order.items?.[0]?.name || "this order"}" has been picked up by ${order.userName || "the customer"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => markPickedUp(order),
        },
      ]
    );
  };

  const markPickedUp = async (order) => {
    console.log(`[PickupOrders] Marking order ${order.id} as picked_up.`);
    try {
      await updateDoc(doc(db, "orders", order.id), {
        status: "picked_up",
      });
      Toast.show({ type: "success", text1: "Marked as Picked Up" });
      // Remove from local list immediately
      setOrders(prev => prev.filter(o => o.id !== order.id));
    } catch (err) {
      console.error("[PickupOrders] ERROR marking picked up:", err);
      Toast.show({ type: "error", text1: "Failed to update order" });
    }
  };

  const renderOrder = ({ item }) => {
    const itemInfo = item.items?.[0];

    return (
      <View style={styles.card}>

        {/* Order number + date */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNumber}>{item.orderNumber || item.id}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={styles.pickupBadge}>
            <Ionicons name="walk-outline" size={13} color={ORANGE} />
            <Text style={styles.pickupBadgeText}>Self Pickup</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Customer */}
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={15} color="#aaa" />
          <Text style={styles.infoLabel}>Customer</Text>
          <Text style={styles.infoValue}>{item.userName || "Unknown"}</Text>
        </View>

        {/* Phone */}
        {item.phone ? (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={15} color="#aaa" />
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{item.phone}</Text>
          </View>
        ) : null}

        {/* Item */}
        <View style={styles.infoRow}>
          <Ionicons name="fast-food-outline" size={15} color="#aaa" />
          <Text style={styles.infoLabel}>Item</Text>
          <Text style={styles.infoValue}>
            {itemInfo?.name || "N/A"} × {itemInfo?.quantity || 1}
          </Text>
        </View>

        {/* Amount */}
        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={15} color="#aaa" />
          <Text style={styles.infoLabel}>Amount Paid</Text>
          <Text style={[styles.infoValue, styles.amountText]}>
            ₹{item.pricing?.total || 0}
          </Text>
        </View>

        {/* Mark Picked Up button */}
        <TouchableOpacity
          style={styles.pickupBtn}
          activeOpacity={0.85}
          onPress={() => confirmMarkPickedUp(item)}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
          <Text style={styles.pickupBtnText}>Mark as Picked Up</Text>
        </TouchableOpacity>

      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={ORANGE} />
        </TouchableOpacity>
        <Text style={styles.title}>Pickup Orders</Text>
        <TouchableOpacity onPress={fetchOrders}>
          <Ionicons name="refresh-outline" size={24} color={ORANGE} />
        </TouchableOpacity>
      </View>

      {/* Count */}
      {!loading && (
        <Text style={styles.countText}>
          {orders.length} pending {orders.length === 1 ? "order" : "orders"}
        </Text>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderOrder}
          refreshing={loading}
          onRefresh={fetchOrders}
          contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16, paddingTop: 6 }}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="checkmark-done-circle-outline" size={60} color="#FFD2A6" />
              <Text style={styles.emptyTitle}>All clear!</Text>
              <Text style={styles.emptyText}>No pending pickup orders</Text>
            </View>
          }
        />
      )}

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: "#FFF6ED" },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
  },
  title:       { fontSize: 20, fontWeight: "700", color: ORANGE },
  countText:   { fontSize: 12, color: "#bbb", marginLeft: 18, marginBottom: 4 },

  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16, marginVertical: 8,
    shadowColor: "#000", shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 10,
  },
  orderNumber: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
  orderDate:   { fontSize: 11, color: "#aaa", marginTop: 2 },

  pickupBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#FFF3E0", paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: 20,
  },
  pickupBadgeText: { fontSize: 12, fontWeight: "700", color: ORANGE },

  divider: { height: 1, backgroundColor: "#f5f5f5", marginBottom: 10 },

  infoRow:   { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  infoLabel: { flex: 1, fontSize: 13, color: "#999" },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#1a1a1a", maxWidth: "55%", textAlign: "right" },
  amountText:{ color: ORANGE, fontWeight: "700" },

  pickupBtn: {
    marginTop: 8, backgroundColor: ORANGE,
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    paddingVertical: 13, borderRadius: 12,
  },
  pickupBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  centered:    { alignItems: "center", justifyContent: "center", marginTop: 60 },
  loadingText: { color: "#aaa", marginTop: 10, fontSize: 13 },
  emptyTitle:  { fontSize: 16, fontWeight: "700", color: "#ccc", marginTop: 12 },
  emptyText:   { color: "#bbb", marginTop: 4, fontSize: 13 },
});
