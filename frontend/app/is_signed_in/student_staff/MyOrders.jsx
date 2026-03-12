import { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator, FlatList, Text,
  View, StyleSheet, TouchableOpacity, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { auth, db } from "../../../firebaseConfig";
import { useRouter } from "expo-router";

const ORANGE = "#FF7A00";

const STATUS_CONFIG = {
  confirmed: { color: "#3b82f6", bg: "#eff6ff", icon: "checkmark-circle-outline", label: "Confirmed" },
  preparing: { color: "#f59e0b", bg: "#fffbeb", icon: "restaurant-outline",        label: "Preparing" },
  ready:     { color: "#10b981", bg: "#ecfdf5", icon: "bag-check-outline",         label: "Ready"     },
};

const DELIVERY_STATUS_CONFIG = {
  "not picked up":      { color: "#f59e0b", bg: "#fffbeb", icon: "time-outline",          label: "Waiting for agent"   },
  "Picked up":          { color: "#3b82f6", bg: "#eff6ff", icon: "bicycle-outline",       label: "Picked up"           },
  "On my way":          { color: "#8b5cf6", bg: "#f5f3ff", icon: "navigate-outline",      label: "On the way"          },
  "Near your location": { color: "#f97316", bg: "#fff7ed", icon: "location-outline",      label: "Almost there!"       },
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

export default function MyOrders() {
  const router = useRouter();
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  // Map of menu item name (lowercase) → image URL
  const [menuImages, setMenuImages] = useState({});
  const [imageLoading, setImageLoading] = useState({});

  // Fetch menu once to get image URLs
  const fetchMenuImages = useCallback(async () => {
    console.log("[MyOrders] Fetching menu images...");
    try {
      const snap = await getDocs(collection(db, "menu"));
      const map = {};
      snap.docs.forEach(d => {
        const data = d.data();
        if (data.name && data.image) {
          map[data.name.toLowerCase()] = data.image;
        }
      });
      console.log(`[MyOrders] Loaded images for ${Object.keys(map).length} menu items.`);
      setMenuImages(map);
    } catch (err) {
      console.error("[MyOrders] ERROR fetching menu images:", err);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      console.warn("[MyOrders] No authenticated user.");
      return;
    }

    console.log(`[MyOrders] Fetching active orders for uid: ${uid}`);
    setLoading(true);

    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", uid),
        where("status", "in", ["confirmed", "preparing", "ready"]),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const all  = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const active = all.filter(o => {
        const deliveryDone = o.delivery_status?.toLowerCase() === "delivered";
        const pickedUp     = o.status === "picked_up";
        return !deliveryDone && !pickedUp;
      });

      console.log(`[MyOrders] Fetched ${all.length} orders, ${active.length} still active.`);
      setOrders(active);
    } catch (err) {
      console.error("[MyOrders] ERROR fetching orders:", err);
      Toast.show({ type: "error", text1: "Failed to fetch orders" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuImages();
    fetchOrders();
  }, []);

  const renderOrder = ({ item }) => {
    const status     = STATUS_CONFIG[item.status] || STATUS_CONFIG.confirmed;
    const itemInfo   = item.items?.[0];
    const isDelivery = item.deliveryDetails?.toBeDelivered;

    const deliveryStatus     = item.delivery_status;
    const deliveryStatusConf = deliveryStatus
      ? DELIVERY_STATUS_CONFIG[deliveryStatus]
      : null;

    // Look up image from menu map using item name
    const imageUrl = itemInfo?.name
      ? menuImages[itemInfo.name.toLowerCase()]
      : null;

    const imgKey = item.id;

    return (
      <View style={styles.card}>

        {/* ── Food image banner ── */}
        <View style={styles.imageBanner}>
          {imageUrl ? (
            <>
              <Image
                source={{ uri: imageUrl }}
                style={styles.foodImage}
                onLoadStart={() =>
                  setImageLoading(prev => ({ ...prev, [imgKey]: true }))
                }
                onLoadEnd={() =>
                  setImageLoading(prev => ({ ...prev, [imgKey]: false }))
                }
                onError={() =>
                  setImageLoading(prev => ({ ...prev, [imgKey]: false }))
                }
              />
              {imageLoading[imgKey] && (
                <ActivityIndicator
                  size="small"
                  color={ORANGE}
                  style={StyleSheet.absoluteFill}
                />
              )}
              {/* Gradient overlay for text legibility */}
              <View style={styles.imageOverlay} />
            </>
          ) : (
            <View style={styles.noImageBox}>
              <Ionicons name="fast-food-outline" size={40} color="#FFD2A6" />
            </View>
          )}

          {/* Status badge floated on image */}
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={13} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNumber}>{item.orderNumber || "Order"}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
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
          <Text style={styles.infoLabel}>{isDelivery ? "Deliver to" : "Pickup"}</Text>
          <Text style={styles.infoValue}>
            {isDelivery ? item.deliveryDetails?.place : "Self Pickup"}
          </Text>
        </View>

        {/* Delivery agent if assigned */}
        {isDelivery && item.deliveryAgentName ? (
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={15} color="#aaa" />
            <Text style={styles.infoLabel}>Agent</Text>
            <Text style={styles.infoValue}>{item.deliveryAgentName}</Text>
          </View>
        ) : null}

        {/* Delivery status tracker */}
        {isDelivery && (
          <View style={styles.deliveryTracker}>
            <Text style={styles.deliveryTrackerTitle}>Delivery Status</Text>

            {deliveryStatusConf ? (
              <View style={[styles.deliveryStatusRow, { backgroundColor: deliveryStatusConf.bg }]}>
                <Ionicons name={deliveryStatusConf.icon} size={16} color={deliveryStatusConf.color} />
                <Text style={[styles.deliveryStatusText, { color: deliveryStatusConf.color }]}>
                  {deliveryStatusConf.label}
                </Text>
              </View>
            ) : (
              <View style={[styles.deliveryStatusRow, { backgroundColor: "#f5f5f5" }]}>
                <Ionicons name="hourglass-outline" size={16} color="#aaa" />
                <Text style={[styles.deliveryStatusText, { color: "#aaa" }]}>
                  Waiting for assignment
                </Text>
              </View>
            )}

            {/* Step indicators */}
            <View style={styles.stepsRow}>
              {["not picked up", "Picked up", "On my way", "Near your location"].map((step, i) => {
                const steps      = ["not picked up", "Picked up", "On my way", "Near your location"];
                const currentIdx = steps.indexOf(deliveryStatus);
                const done       = currentIdx >= i;
                return (
                  <View key={step} style={styles.stepItem}>
                    <View style={[styles.stepDot, done && styles.stepDotDone]} />
                    {i < steps.length - 1 && (
                      <View style={[styles.stepLine, done && i < currentIdx && styles.stepLineDone]} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Ready banner for pickup orders */}
        {item.status === "ready" && !isDelivery && (
          <View style={styles.readyBanner}>
            <Ionicons name="notifications-outline" size={15} color="#10b981" />
            <Text style={styles.readyBannerText}>Ready for pickup at canteen!</Text>
          </View>
        )}

      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          console.log("[MyOrders] User tapped back.");
          router.back();
        }}>
          <Ionicons name="arrow-back" size={24} color={ORANGE} />
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
        <TouchableOpacity onPress={() => {
          console.log("[MyOrders] User triggered manual refresh.");
          fetchOrders();
        }}>
          <Ionicons name="refresh-outline" size={24} color={ORANGE} />
        </TouchableOpacity>
      </View>

      {/* Order History link */}
      <TouchableOpacity
        style={styles.historyLink}
        onPress={() => {
          console.log("[MyOrders] Navigating to OrderHistory.");
          router.push("/is_signed_in/student_staff/OrderHistory");
        }}
      >
        <Ionicons name="time-outline" size={15} color={ORANGE} />
        <Text style={styles.historyLinkText}>View Order History</Text>
        <Ionicons name="chevron-forward" size={15} color={ORANGE} />
      </TouchableOpacity>

      {/* Order count */}
      {!loading && (
        <Text style={styles.countText}>
          {orders.length} active {orders.length === 1 ? "order" : "orders"}
        </Text>
      )}

      {/* List */}
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
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptyText}>No active orders right now</Text>
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

  historyLink: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: "#fff8f2", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: "#FFE1C2",
  },
  historyLinkText: { flex: 1, fontSize: 13, color: ORANGE, fontWeight: "600" },

  countText: { fontSize: 12, color: "#bbb", marginLeft: 18, marginBottom: 4 },

  card: {
    backgroundColor: "#fff", borderRadius: 16, marginVertical: 8,
    shadowColor: "#000", shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    overflow: "hidden",
  },

  // ── Image banner ──────────────────────────────────────────────
  imageBanner: {
    height: 140, width: "100%",
    backgroundColor: "#FFF1E4",
    justifyContent: "center", alignItems: "center",
  },
  foodImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  noImageBox: {
    flex: 1, justifyContent: "center", alignItems: "center",
  },
  statusBadge: {
    position: "absolute", top: 10, right: 10,
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "700" },

  // ── Card body ─────────────────────────────────────────────────
  cardHeader: {
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6,
  },
  orderNumber: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
  orderDate:   { fontSize: 11, color: "#aaa", marginTop: 2 },

  divider: { height: 1, backgroundColor: "#f5f5f5", marginHorizontal: 16, marginBottom: 10 },

  infoRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginBottom: 8, paddingHorizontal: 16,
  },
  infoLabel: { flex: 1, fontSize: 13, color: "#999" },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#1a1a1a", maxWidth: "55%", textAlign: "right" },
  amountText: { color: ORANGE, fontWeight: "700" },

  // ── Delivery tracker ──────────────────────────────────────────
  deliveryTracker: {
    marginHorizontal: 16, marginTop: 4, marginBottom: 12, padding: 12,
    backgroundColor: "#fafafa", borderRadius: 12,
    borderWidth: 1, borderColor: "#f0f0f0",
  },
  deliveryTrackerTitle: {
    fontSize: 11, fontWeight: "700", color: "#bbb",
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8,
  },
  deliveryStatusRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, marginBottom: 10,
  },
  deliveryStatusText: { fontSize: 13, fontWeight: "700" },

  stepsRow: { flexDirection: "row", alignItems: "center" },
  stepItem: { flexDirection: "row", alignItems: "center", flex: 1 },
  stepDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: "#e5e7eb", borderWidth: 2, borderColor: "#d1d5db",
  },
  stepDotDone: { backgroundColor: ORANGE, borderColor: ORANGE },
  stepLine: { flex: 1, height: 2, backgroundColor: "#e5e7eb" },
  stepLineDone: { backgroundColor: ORANGE },

  readyBanner: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#ecfdf5", borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 7,
    marginHorizontal: 16, marginBottom: 12, marginTop: 4,
  },
  readyBannerText: { fontSize: 12, color: "#10b981", fontWeight: "600" },

  centered: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  loadingText: { color: "#aaa", marginTop: 10, fontSize: 13 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#ccc", marginTop: 12 },
  emptyText:  { color: "#bbb", marginTop: 4, fontSize: 13 },
});