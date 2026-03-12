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

const ORDER_STATUS_META = {
  confirmed: { color: "#3b82f6", bg: "#eff6ff", label: "Confirmed" },
  preparing: { color: "#f59e0b", bg: "#fffbeb", label: "Preparing" },
  ready:     { color: "#10b981", bg: "#ecfdf5", label: "Ready"     },
  picked_up: { color: "#6366f1", bg: "#eef2ff", label: "Picked Up" },
  delivered: { color: "#10b981", bg: "#ecfdf5", label: "Delivered" },
};

const DELIVERY_STATUS_META = {
  "not picked up":      { color: "#94A3B8", icon: "hourglass-outline",       label: "Waiting for agent" },
  "Picked up":          { color: "#3B82F6", icon: "bicycle-outline",         label: "Picked up"         },
  "On my way":          { color: "#8B5CF6", icon: "navigate-outline",        label: "On the way"        },
  "Near your location": { color: ORANGE,    icon: "location-outline",        label: "Almost there"      },
  "Delivered":          { color: "#10b981", icon: "checkmark-circle-outline",label: "Delivered"         },
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

function Row({ icon, label, value, orange }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={15} color="#bbb" />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, orange && { color: ORANGE }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function SectionHeader({ title, count, done }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionDot, done && styles.sectionDotDone]} />
      <Text style={[styles.sectionTitle, done && styles.sectionTitleDone]}>{title}</Text>
      {count > 0 && (
        <View style={[styles.sectionBadge, done && styles.sectionBadgeDone]}>
          <Text style={[styles.sectionBadgeText, done && styles.sectionBadgeTextDone]}>{count}</Text>
        </View>
      )}
    </View>
  );
}

function PickupCard({ item, onMarkPickedUp, done }) {
  const itemInfo    = item.items?.[0];
  const orderStatus = ORDER_STATUS_META[item.status] || ORDER_STATUS_META.confirmed;
  return (
    <View style={[styles.card, done && styles.cardDone]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderNumber}>{item.orderNumber || item.id}</Text>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: orderStatus.bg }]}>
          <Text style={[styles.badgeText, { color: orderStatus.color }]}>{orderStatus.label}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <Row icon="person-outline"    label="Customer"    value={item.userName || "Unknown"} />
      {item.phone ? <Row icon="call-outline" label="Phone" value={item.phone} /> : null}
      <Row icon="fast-food-outline" label="Item"        value={`${itemInfo?.name || "N/A"} × ${itemInfo?.quantity || 1}`} orange />
      <Row icon="cash-outline"      label="Amount Paid" value={`\u20B9${item.pricing?.total || 0}`} orange />
      {done ? (
        <View style={styles.completedBanner}>
          <Ionicons name="checkmark-circle" size={15} color="#10b981" />
          <Text style={styles.completedBannerText}>Picked up successfully</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={() => onMarkPickedUp(item)}>
          <Ionicons name="checkmark-circle-outline" size={17} color="#fff" />
          <Text style={styles.primaryBtnText}>Mark as Picked Up</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function DeliveryCard({ item, onMarkReady, done }) {
  const itemInfo       = item.items?.[0];
  const orderStatus    = ORDER_STATUS_META[item.status] || ORDER_STATUS_META.confirmed;
  const deliveryStatus = item.delivery_status ? DELIVERY_STATUS_META[item.delivery_status] : null;
  const isReady        = item.status === "ready";
  return (
    <View style={[styles.card, done && styles.cardDone]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderNumber}>{item.orderNumber || item.id}</Text>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: orderStatus.bg }]}>
          <Text style={[styles.badgeText, { color: orderStatus.color }]}>{orderStatus.label}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <Row icon="person-outline"    label="Customer"    value={item.userName || "Unknown"} />
      {item.phone ? <Row icon="call-outline" label="Phone" value={item.phone} /> : null}
      <Row icon="fast-food-outline" label="Item"        value={`${itemInfo?.name || "N/A"} × ${itemInfo?.quantity || 1}`} orange />
      <Row icon="cash-outline"      label="Amount Paid" value={`\u20B9${item.pricing?.total || 0}`} orange />
      <Row icon="location-outline"  label="Deliver to"  value={item.deliveryDetails?.place || "—"} />
      {item.deliveryAgentName
        ? <Row icon="bicycle-outline" label="Agent" value={item.deliveryAgentName} />
        : null}

      <View style={styles.deliveryStatusRow}>
        {deliveryStatus ? (
          <View style={styles.deliveryStatusPill}>
            <Ionicons name={deliveryStatus.icon} size={13} color={deliveryStatus.color} />
            <Text style={[styles.deliveryStatusText, { color: deliveryStatus.color }]}>
              {deliveryStatus.label}
            </Text>
          </View>
        ) : (
          <View style={[styles.deliveryStatusPill, { backgroundColor: "#f1f5f9" }]}>
            <Ionicons name="time-outline" size={13} color="#94A3B8" />
            <Text style={[styles.deliveryStatusText, { color: "#94A3B8" }]}>
              Awaiting agent assignment
            </Text>
          </View>
        )}
      </View>

      {done ? (
        <View style={styles.completedBanner}>
          <Ionicons name="checkmark-circle" size={15} color="#10b981" />
          <Text style={styles.completedBannerText}>Delivered successfully</Text>
        </View>
      ) : isReady ? (
        <View style={styles.readyBanner}>
          <Ionicons name="checkmark-circle" size={15} color="#10b981" />
          <Text style={styles.readyBannerText}>Ready for agent pickup</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.readyBtn} activeOpacity={0.85} onPress={() => onMarkReady(item)}>
          <Ionicons name="bag-check-outline" size={17} color="#fff" />
          <Text style={styles.readyBtnText}>Mark Ready for Agent</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function PickupOrders() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pickup");

  const [pickupOrders, setPickupOrders]       = useState([]);
  const [deliveryOrders, setDeliveryOrders]   = useState([]);
  const [pickedUpOrders, setPickedUpOrders]   = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [loading, setLoading]                 = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const [pickupSnap, deliverySnap, pickedUpSnap, deliveredSnap] = await Promise.all([
        getDocs(query(
          collection(db, "orders"),
          where("deliveryDetails.toBeDelivered", "==", false),
          where("status", "in", ["confirmed", "preparing", "ready"]),
          orderBy("createdAt", "desc")
        )),
        getDocs(query(
          collection(db, "orders"),
          where("deliveryDetails.toBeDelivered", "==", true),
          where("status", "in", ["confirmed", "preparing", "ready"]),
          orderBy("createdAt", "desc")
        )),
        getDocs(query(
          collection(db, "orders"),
          where("deliveryDetails.toBeDelivered", "==", false),
          where("status", "==", "picked_up"),
          orderBy("createdAt", "desc")
        )),
        getDocs(query(
          collection(db, "orders"),
          where("deliveryDetails.toBeDelivered", "==", true),
          where("delivered", "==", true),
          orderBy("createdAt", "desc")
        )),
      ]);
      setPickupOrders(pickupSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setDeliveryOrders(deliverySnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setPickedUpOrders(pickedUpSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setDeliveredOrders(deliveredSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("[PickupOrders] ERROR:", err);
      Toast.show({ type: "error", text1: "Failed to fetch orders" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, []);

  const confirmMarkPickedUp = (order) => {
    Alert.alert(
      "Mark as Picked Up",
      `Confirm "${order.items?.[0]?.name || "this order"}" was picked up by ${order.userName || "the customer"}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => markPickedUp(order) },
      ]
    );
  };

  const markPickedUp = async (order) => {
    try {
      await updateDoc(doc(db, "orders", order.id), { status: "picked_up" });
      Toast.show({ type: "success", text1: "Marked as Picked Up" });
      const updated = { ...order, status: "picked_up" };
      setPickupOrders(prev => prev.filter(o => o.id !== order.id));
      setPickedUpOrders(prev => [updated, ...prev]);
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to update order" });
    }
  };

  const confirmMarkReady = (order) => {
    Alert.alert(
      "Mark Ready for Agent",
      `Mark "${order.items?.[0]?.name || "this order"}" as ready for agent pickup?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => markReady(order) },
      ]
    );
  };

  const markReady = async (order) => {
    try {
      await updateDoc(doc(db, "orders", order.id), { status: "ready" });
      Toast.show({ type: "success", text1: "Order marked as Ready" });
      setDeliveryOrders(prev =>
        prev.map(o => o.id === order.id ? { ...o, status: "ready" } : o)
      );
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to update order" });
    }
  };

  const pickupListData = [
    { _type: "section", _key: "pu-s1", title: "Pending",   count: pickupOrders.length,   done: false },
    ...(pickupOrders.length
      ? pickupOrders.map(o => ({ ...o, _type: "pickup",   _key: `pu-p-${o.id}`, done: false }))
      : [{ _type: "empty", _key: "pu-e1", text: "No pending pickup orders" }]),
    { _type: "section", _key: "pu-s2", title: "Completed", count: pickedUpOrders.length, done: true },
    ...(pickedUpOrders.length
      ? pickedUpOrders.map(o => ({ ...o, _type: "pickup",   _key: `pu-d-${o.id}`, done: true }))
      : [{ _type: "empty", _key: "pu-e2", text: "No completed pickups yet" }]),
  ];

  const deliveryListData = [
    { _type: "section", _key: "dl-s1", title: "Pending",   count: deliveryOrders.length,   done: false },
    ...(deliveryOrders.length
      ? deliveryOrders.map(o => ({ ...o, _type: "delivery", _key: `dl-p-${o.id}`, done: false }))
      : [{ _type: "empty", _key: "dl-e1", text: "No pending delivery orders" }]),
    { _type: "section", _key: "dl-s2", title: "Completed", count: deliveredOrders.length, done: true },
    ...(deliveredOrders.length
      ? deliveredOrders.map(o => ({ ...o, _type: "delivery", _key: `dl-d-${o.id}`, done: true }))
      : [{ _type: "empty", _key: "dl-e2", text: "No completed deliveries yet" }]),
  ];

  const listData    = activeTab === "pickup" ? pickupListData : deliveryListData;
  const pendingCount = activeTab === "pickup" ? pickupOrders.length : deliveryOrders.length;

  const renderItem = ({ item }) => {
    if (item._type === "section") return <SectionHeader title={item.title} count={item.count} done={item.done} />;
    if (item._type === "empty")   return (
      <View style={styles.emptyRow}>
        <Ionicons name="ellipsis-horizontal-circle-outline" size={16} color="#ccc" />
        <Text style={styles.emptyRowText}>{item.text}</Text>
      </View>
    );
    if (item._type === "pickup")  return <PickupCard   item={item} onMarkPickedUp={confirmMarkPickedUp} done={item.done} />;
    return                               <DeliveryCard item={item} onMarkReady={confirmMarkReady}       done={item.done} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={ORANGE} />
        </TouchableOpacity>
        <Text style={styles.title}>Orders</Text>
        <TouchableOpacity onPress={fetchOrders}>
          <Ionicons name="refresh-outline" size={24} color={ORANGE} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "pickup" && styles.tabActive]}
          onPress={() => setActiveTab("pickup")}
        >
          <Ionicons name="walk-outline" size={15} color={activeTab === "pickup" ? "#fff" : ORANGE} />
          <Text style={[styles.tabText, activeTab === "pickup" && styles.tabTextActive]}>Self Pickup</Text>
          {pickupOrders.length > 0 && (
            <View style={[styles.tabBadge, activeTab === "pickup" && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === "pickup" && { color: ORANGE }]}>
                {pickupOrders.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "delivery" && styles.tabActive]}
          onPress={() => setActiveTab("delivery")}
        >
          <Ionicons name="bicycle-outline" size={15} color={activeTab === "delivery" ? "#fff" : ORANGE} />
          <Text style={[styles.tabText, activeTab === "delivery" && styles.tabTextActive]}>Delivery</Text>
          {deliveryOrders.length > 0 && (
            <View style={[styles.tabBadge, activeTab === "delivery" && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === "delivery" && { color: ORANGE }]}>
                {deliveryOrders.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {!loading && (
        <Text style={styles.countText}>
          {pendingCount} pending {pendingCount === 1 ? "order" : "orders"}
        </Text>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => item._key}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={fetchOrders}
          contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16, paddingTop: 6 }}
        />
      )}

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB" },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#1a1a1a" },

  tabs: { flexDirection: "row", marginHorizontal: 16, marginBottom: 6, gap: 10 },
  tab: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6,
    paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: ORANGE, backgroundColor: "#fff",
  },
  tabActive:     { backgroundColor: ORANGE, borderColor: ORANGE },
  tabText:       { fontSize: 14, fontWeight: "700", color: ORANGE },
  tabTextActive: { color: "#fff" },
  tabBadge: {
    backgroundColor: "#FFF0E0", borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 1, minWidth: 20, alignItems: "center",
  },
  tabBadgeActive:  { backgroundColor: "rgba(255,255,255,0.3)" },
  tabBadgeText:    { fontSize: 11, fontWeight: "700", color: ORANGE },

  countText: { fontSize: 12, color: "#bbb", marginLeft: 18, marginBottom: 4 },

  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16, marginBottom: 6 },
  sectionDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: ORANGE },
  sectionDotDone:{ backgroundColor: "#10b981" },
  sectionTitle:  { fontSize: 13, fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 },
  sectionTitleDone: { color: "#10b981" },
  sectionBadge:  { backgroundColor: "#FFF0E0", borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  sectionBadgeDone: { backgroundColor: "#ecfdf5" },
  sectionBadgeText: { fontSize: 11, fontWeight: "700", color: ORANGE },
  sectionBadgeTextDone: { color: "#10b981" },

  emptyRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 4 },
  emptyRowText: { fontSize: 13, color: "#ccc" },

  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16, marginVertical: 6,
    shadowColor: "#000", shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardDone: { opacity: 0.72 },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 10,
  },
  orderNumber: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
  orderDate:   { fontSize: 11, color: "#aaa", marginTop: 2 },
  badge:       { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText:   { fontSize: 12, fontWeight: "700" },
  divider:     { height: 1, backgroundColor: "#f5f5f5", marginBottom: 10 },

  infoRow:   { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  infoLabel: { flex: 1, fontSize: 13, color: "#94A3B8" },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#1a1a1a", maxWidth: "55%", textAlign: "right" },

  deliveryStatusRow: { marginTop: 2, marginBottom: 4 },
  deliveryStatusPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#f8f9fb", paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10,
  },
  deliveryStatusText: { fontSize: 12, fontWeight: "600" },

  primaryBtn: {
    marginTop: 10, backgroundColor: ORANGE,
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    paddingVertical: 12, borderRadius: 12,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  readyBtn: {
    marginTop: 10, backgroundColor: "#10b981",
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    paddingVertical: 12, borderRadius: 12,
  },
  readyBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  readyBanner: {
    marginTop: 10, flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#ecfdf5", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12,
  },
  readyBannerText: { fontSize: 13, fontWeight: "600", color: "#10b981" },

  completedBanner: {
    marginTop: 10, flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#ecfdf5", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12,
  },
  completedBannerText: { fontSize: 13, fontWeight: "600", color: "#10b981" },

  centered:    { alignItems: "center", justifyContent: "center", marginTop: 60 },
  loadingText: { color: "#aaa", marginTop: 10, fontSize: 13 },
});