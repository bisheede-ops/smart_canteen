import { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator, FlatList, Text,
  View, StyleSheet, TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { auth, db } from "../../../firebaseConfig";
import { useRouter } from "expo-router";

const ORANGE = "#FF7A00";

const STATUS_CONFIG = {
  delivered:  { color: "#6366f1", bg: "#eef2ff", icon: "bicycle-outline",      label: "Delivered"  },
  picked_up:  { color: "#10b981", bg: "#ecfdf5", icon: "walk-outline",         label: "Picked Up"  },
  cancelled:  { color: "#ef4444", bg: "#fef2f2", icon: "close-circle-outline", label: "Cancelled"  },
};

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
  const router = useRouter();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      console.warn("[OrderHistory] No authenticated user.");
      return;
    }

    console.log(`[OrderHistory] Fetching completed orders for uid: ${uid}`);
    setLoading(true);

    try {
      // Fetch both completed statuses AND still-confirmed orders
      // (delivery orders stay "confirmed" in status but delivery_status becomes "Delivered")
      const [completedSnap, activeSnap] = await Promise.all([
        // Orders that are fully completed by status
        getDocs(query(
          collection(db, "orders"),
          where("userId", "==", uid),
          where("status", "in", ["delivered", "picked_up", "cancelled"]),
          orderBy("createdAt", "desc")
        )),
        // Orders still "confirmed/preparing/ready" but delivery_status is "Delivered"
        getDocs(query(
          collection(db, "orders"),
          where("userId", "==", uid),
          where("delivery_status", "==", "Delivered"),
          orderBy("createdAt", "desc")
        )),
      ]);

      const completedList = completedSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const deliveredList = activeSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Merge and deduplicate by id
      const merged = [...completedList];
      deliveredList.forEach(o => {
        if (!merged.find(m => m.id === o.id)) merged.push(o);
      });

      // Sort by createdAt descending
      merged.sort((a, b) => {
        const aTime = a.createdAt?.seconds ?? 0;
        const bTime = b.createdAt?.seconds ?? 0;
        return bTime - aTime;
      });

      console.log(`[OrderHistory] Total history orders: ${merged.length}`);
      setOrders(merged);
    } catch (err) {
      console.error("[OrderHistory] ERROR fetching order history:", err);
      Toast.show({ type: "error", text1: "Failed to fetch order history" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, []);

  // Resolve display status — delivery_status "Delivered" takes priority
  const resolveStatus = (item) => {
    if (item.delivery_status?.toLowerCase() === "delivered") {
      return STATUS_CONFIG.delivered;
    }
    return STATUS_CONFIG[item.status] || STATUS_CONFIG.delivered;
  };

  const resolveFooterText = (item) => {
    if (item.delivery_status?.toLowerCase() === "delivered") return "Delivered successfully";
    if (item.status === "delivered")  return "Delivered successfully";
    if (item.status === "picked_up")  return "Picked up from canteen";
    if (item.status === "cancelled")  return "Order was cancelled";
    return "Completed";
  };

  const renderOrder = ({ item }) => {
    const status     = resolveStatus(item);
    const itemInfo   = item.items?.[0];
    const isDelivery = item.deliveryDetails?.toBeDelivered;
    const isCancelled = item.status === "cancelled";

    return (
      <View style={[styles.card, isCancelled && styles.cardCancelled]}>

        {/* Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNumber}>{item.orderNumber || "Order"}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={13} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.divider} />

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

        {/* Delivery or Pickup */}
        <View style={styles.infoRow}>
          <Ionicons
            name={isDelivery ? "bicycle-outline" : "walk-outline"}
            size={15} color="#aaa"
          />
          <Text style={styles.infoLabel}>{isDelivery ? "Delivered to" : "Pickup"}</Text>
          <Text style={styles.infoValue}>
            {isDelivery ? item.deliveryDetails?.place : "Self Pickup"}
          </Text>
        </View>

        {/* Agent name if delivery */}
        {isDelivery && item.deliveryAgentName ? (
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={15} color="#aaa" />
            <Text style={styles.infoLabel}>Delivered by</Text>
            <Text style={styles.infoValue}>{item.deliveryAgentName}</Text>
          </View>
        ) : null}

        {/* Completion footer */}
        <View style={[
          styles.footerBanner,
          isCancelled ? styles.footerBannerCancelled : styles.footerBannerSuccess,
        ]}>
          <Ionicons
            name={isCancelled ? "close-circle-outline" : "checkmark-done-outline"}
            size={14}
            color={isCancelled ? "#ef4444" : "#10b981"}
          />
          <Text style={[
            styles.footerBannerText,
            isCancelled && { color: "#ef4444" },
          ]}>
            {resolveFooterText(item)}
          </Text>
        </View>

      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          console.log("[OrderHistory] User tapped back.");
          router.back();
        }}>
          <Ionicons name="arrow-back" size={24} color={ORANGE} />
        </TouchableOpacity>
        <Text style={styles.title}>Order History</Text>
        <TouchableOpacity onPress={() => {
          console.log("[OrderHistory] User triggered manual refresh.");
          fetchHistory();
        }}>
          <Ionicons name="refresh-outline" size={24} color={ORANGE} />
        </TouchableOpacity>
      </View>

      {/* Order count */}
      {!loading && (
        <Text style={styles.countText}>
          {orders.length} {orders.length === 1 ? "order" : "orders"} in history
        </Text>
      )}

      {/* List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderOrder}
          refreshing={loading}
          onRefresh={fetchHistory}
          contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16, paddingTop: 6 }}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="time-outline" size={60} color="#FFD2A6" />
              <Text style={styles.emptyTitle}>No history yet</Text>
              <Text style={styles.emptyText}>Completed orders will appear here</Text>
            </View>
          }
        />
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF9F2" },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
  },
  title: { fontSize: 20, fontWeight: "700", color: ORANGE },

  countText: { fontSize: 12, color: "#bbb", marginLeft: 18, marginBottom: 4 },

  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16, marginVertical: 8,
    shadowColor: "#000", shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardCancelled: { opacity: 0.75 },

  cardHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 10,
  },
  orderNumber: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
  orderDate:   { fontSize: 11, color: "#aaa", marginTop: 2 },

  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "700" },

  divider: { height: 1, backgroundColor: "#f5f5f5", marginBottom: 10 },

  infoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  infoLabel: { flex: 1, fontSize: 13, color: "#999" },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#1a1a1a", maxWidth: "55%", textAlign: "right" },
  amountText: { color: ORANGE, fontWeight: "700" },

  footerBanner: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, marginTop: 8,
  },
  footerBannerSuccess:   { backgroundColor: "#ecfdf5" },
  footerBannerCancelled: { backgroundColor: "#fef2f2" },
  footerBannerText: { fontSize: 12, color: "#10b981", fontWeight: "600" },

  centered: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  loadingText: { color: "#aaa", marginTop: 10, fontSize: 13 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#ccc", marginTop: 12 },
  emptyText:  { color: "#bbb", marginTop: 4, fontSize: 13 },
});
