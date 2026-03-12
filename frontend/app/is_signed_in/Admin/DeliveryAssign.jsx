import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator, FlatList, Text,
  TouchableOpacity, View, StyleSheet, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import {
  assignAgent, deassignAgent, findBestAgent,
  smartAssignAll, getDistance, getZone,
  MAX_ORDERS_PER_AGENT, isAgentEngaged,
} from "../../../components/AssignHelpers";

const ORANGE = "#FF7A00";

const STATUS_META = {
  confirmed: { label: "Confirmed", color: "#3b82f6", bg: "#eff6ff" },
  preparing: { label: "Preparing", color: "#f59e0b", bg: "#fffbeb" },
  ready:     { label: "Ready",     color: "#10b981", bg: "#ecfdf5" },
};

const DELIVERY_META = {
  "not picked up":      { label: "Waiting",      color: "#94A3B8" },
  "Picked up":          { label: "Picked up",    color: "#3B82F6" },
  "On my way":          { label: "On the way",   color: "#8B5CF6" },
  "Near your location": { label: "Almost there", color: ORANGE    },
};

const formatTime = (ts) => {
  if (!ts) return "—";
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  if (isNaN(d)) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

export default function DeliveryAssign() {
  const [orders, setOrders]   = useState([]);
  const [agents, setAgents]   = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const ordersSnap = await getDocs(query(
        collection(db, "orders"),
        where("payment.status", "==", "paid"),
        where("deliveryDetails.toBeDelivered", "==", true)
      ));

      const fetchedOrders = ordersSnap.docs.map((d) => {
        const data = d.data();
        return {
          id:                d.id,
          username:          data.userName         || data.userEmail || "Unknown",
          phone:             data.phoneNumber       || null,
          items:             data.items             || [],
          total:             data.pricing?.total    || 0,
          place:             data.deliveryDetails?.place || "",
          deliveryAgentId:   data.deliveryAgentId   || null,
          deliveryAgentName: data.deliveryAgentName || null,
          delivery_status:   data.delivery_status   || "not picked up",
          delivered:         data.delivered         || false,
          orderNumber:       data.orderNumber       || d.id,
          status:            data.status            || "confirmed",
          createdAt:         data.createdAt         || null,
        };
      });

      setOrders(fetchedOrders);

      const agentsSnap = await getDocs(
        query(collection(db, "delivery_agents"), where("status", "==", "active"))
      );

      const orderCount = {}, distMap = {}, zoneMap = {}, busyByStatus = {};
      fetchedOrders.forEach((o) => {
        if (!o.deliveryAgentId) return;
        const status = o.delivery_status?.toLowerCase();
        if (!o.delivered && status !== "delivered") {
          orderCount[o.deliveryAgentId] = (orderCount[o.deliveryAgentId] || 0) + 1;
          distMap[o.deliveryAgentId] ??= [];
          zoneMap[o.deliveryAgentId] ??= [];
          distMap[o.deliveryAgentId].push(getDistance(o.place));
          zoneMap[o.deliveryAgentId].push(getZone(o.place));
        }
        if (status && status !== "not picked up" && status !== "delivered")
          busyByStatus[o.deliveryAgentId] = true;
      });

      setAgents(agentsSnap.docs.map((d) => ({
        uid:          d.id,
        displayName:  d.data().name,
        activeOrders: orderCount[d.id] || 0,
        distances:    distMap[d.id]    || [],
        zones:        zoneMap[d.id]    || [],
        engaged: busyByStatus[d.id] || (orderCount[d.id] || 0) >= MAX_ORDERS_PER_AGENT,
        orders: fetchedOrders.filter((o) => o.deliveryAgentId === d.id),
      })));
    } catch (e) {
      Toast.show({ type: "error", text1: "Failed to load orders" });
    } finally {
      setLoading(false);
    }
  };

  const { unassigned, active } = useMemo(() => ({
    unassigned: orders.filter((o) => !o.deliveryAgentId),
    active:     orders.filter((o) => o.deliveryAgentId && !o.delivered),
  }), [orders]);

  const confirmAssign = (order, agent) => {
    Alert.alert(
      "Assign Agent",
      `Assign ${agent.displayName} to deliver order #${order.orderNumber}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Assign", onPress: () =>
          assignAgent(order.id, agent).then(() => {
            fetchData();
            Toast.show({ type: "success", text1: "Agent assigned" });
          })
        },
      ]
    );
  };

  const confirmRemove = (item) => {
    Alert.alert(
      "Remove Agent",
      `Remove ${item.deliveryAgentName} from order #${item.orderNumber}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => deassignAgent(item).then(fetchData) },
      ]
    );
  };

  const confirmSmartAssign = () => {
    const readyOrders = unassigned.filter(o => o.status === "ready");
    if (readyOrders.length === 0) {
      Toast.show({ type: "info", text1: "No ready orders to assign" });
      return;
    }
    Alert.alert(
      "Smart Assign",
      `Auto-assign agents to ${readyOrders.length} ready order${readyOrders.length > 1 ? "s" : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Proceed", onPress: () =>
          smartAssignAll(readyOrders, agents, fetchData).then(() =>
            Toast.show({ type: "success", text1: "Smart assign done" })
          )
        },
      ]
    );
  };

  const renderOrder = ({ item }) => {
    const suggested      = findBestAgent(agents, item.place);
    const isAssigned     = !!item.deliveryAgentId && !item.delivered;
    const canRemove      = item.delivery_status?.toLowerCase() === "not picked up";
    const isReady        = item.status === "ready";
    const statusMeta     = STATUS_META[item.status] || STATUS_META.confirmed;
    const deliveryMeta   = DELIVERY_META[item.delivery_status];
    const itemSummary    = item.items.map(i => `${i.name} × ${i.quantity}`).join(", ");

    return (
      <View style={styles.card}>
        {/* Header row */}
        <View style={styles.cardTop}>
          <View style={styles.cardTopLeft}>
            <Text style={styles.orderNum}>#{item.orderNumber}</Text>
            <Text style={styles.orderTime}>{formatTime(item.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusMeta.color }]}>
              {statusMeta.label}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Order details */}
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={13} color="#94A3B8" />
          <Text style={styles.detailLabel}>Customer</Text>
          <Text style={styles.detailValue}>{item.username}</Text>
        </View>
        {item.phone ? (
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={13} color="#94A3B8" />
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>{item.phone}</Text>
          </View>
        ) : null}
        <View style={styles.detailRow}>
          <Ionicons name="fast-food-outline" size={13} color="#94A3B8" />
          <Text style={styles.detailLabel}>Items</Text>
          <Text style={[styles.detailValue, styles.detailValueOrange]} numberOfLines={2}>
            {itemSummary || "—"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={13} color="#94A3B8" />
          <Text style={styles.detailLabel}>Total</Text>
          <Text style={[styles.detailValue, styles.detailValueOrange]}>₹{item.total}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={13} color="#94A3B8" />
          <Text style={styles.detailLabel}>Deliver to</Text>
          <Text style={styles.detailValue}>{item.place || "—"}</Text>
        </View>

        {/* Assigned agent row */}
        {isAssigned && (
          <View style={styles.agentAssignedRow}>
            <View style={styles.agentAssignedLeft}>
              <Ionicons name="bicycle-outline" size={14} color="#10b981" />
              <Text style={styles.agentAssignedName}>{item.deliveryAgentName}</Text>
              {deliveryMeta && (
                <View style={[styles.deliveryPill, { borderColor: deliveryMeta.color }]}>
                  <Text style={[styles.deliveryPillText, { color: deliveryMeta.color }]}>
                    {deliveryMeta.label}
                  </Text>
                </View>
              )}
            </View>
            {canRemove && (
              <TouchableOpacity onPress={() => confirmRemove(item)} style={styles.removeBtn}>
                <Ionicons name="close" size={13} color="#ef4444" />
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Agent assignment — only for unassigned + ready orders */}
        {!item.deliveryAgentId && (
          isReady ? (
            <View style={styles.agentsSection}>
              <Text style={styles.agentsSectionLabel}>Assign Agent</Text>
              <View style={styles.agentsRow}>
                {agents.map((agent) => {
                  const engaged     = isAgentEngaged(agent);
                  const isSuggested = suggested?.uid === agent.uid;
                  return (
                    <TouchableOpacity
                      key={agent.uid}
                      disabled={engaged}
                      style={[
                        styles.agentChip,
                        engaged     && styles.agentChipOff,
                        isSuggested && styles.agentChipBest,
                      ]}
                      onPress={() => confirmAssign(item, agent)}
                    >
                      <Ionicons
                        name="bicycle-outline"
                        size={12}
                        color={engaged ? "#ccc" : isSuggested ? "#fff" : ORANGE}
                      />
                      <Text style={[
                        styles.agentChipText,
                        engaged     && styles.agentChipTextOff,
                        isSuggested && styles.agentChipTextBest,
                      ]}>
                        {agent.displayName}
                      </Text>
                      <Text style={[
                        styles.agentChipCount,
                        engaged     && { color: "#ccc" },
                        isSuggested && { color: "rgba(255,255,255,0.75)" },
                      ]}>
                        {agent.activeOrders}/{MAX_ORDERS_PER_AGENT}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {suggested && (
                <Text style={styles.suggestedHint}>
                  ★ {suggested.displayName} recommended for this location
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.notReadyBanner}>
              <Ionicons name="time-outline" size={14} color="#f59e0b" />
              <Text style={styles.notReadyText}>
                Waiting for canteen to mark as ready
              </Text>
            </View>
          )
        )}
      </View>
    );
  };

  const flatData = [
    { _key: "h1", _section: true, title: "Unassigned", count: unassigned.length },
    ...(unassigned.length
      ? unassigned.map(o => ({ _key: `u-${o.id}`, _order: true, ...o }))
      : [{ _key: "u-empty", _empty: true, text: "No pending orders" }]),
    { _key: "h2", _section: true, title: "Active Deliveries", count: active.length },
    ...(active.length
      ? active.map(o => ({ _key: `a-${o.id}`, _order: true, ...o }))
      : [{ _key: "a-empty", _empty: true, text: "No active deliveries" }]),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Delivery Assign</Text>
        <TouchableOpacity onPress={fetchData} style={styles.refreshBtn}>
          <Ionicons name="refresh-outline" size={20} color={ORANGE} />
        </TouchableOpacity>
      </View>

      {loading && orders.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ORANGE} />
        </View>
      ) : (
        <FlatList
          data={flatData}
          keyExtractor={item => item._key}
          refreshing={loading}
          onRefresh={fetchData}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110 }}
          renderItem={({ item }) => {
            if (item._section) return (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{item.title}</Text>
                {item.count > 0 && (
                  <Text style={styles.sectionCount}>{item.count}</Text>
                )}
              </View>
            );
            if (item._empty) return (
              <Text style={styles.emptyText}>{item.text}</Text>
            );
            return renderOrder({ item });
          }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={confirmSmartAssign}>
        <Ionicons name="flash-outline" size={17} color="#fff" />
        <Text style={styles.fabText}>Smart Assign</Text>
      </TouchableOpacity>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB" },

  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
  },
  title: { fontSize: 18, fontWeight: "700", color: "#1a1a1a" },
  refreshBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#FFF0E0", justifyContent: "center", alignItems: "center",
  },

  section: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginTop: 20, marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: "700", color: "#94A3B8",
    textTransform: "uppercase", letterSpacing: 0.8,
  },
  sectionCount: {
    fontSize: 11, fontWeight: "700", color: ORANGE,
    backgroundColor: "#FFF0E0", paddingHorizontal: 6,
    paddingVertical: 1, borderRadius: 8,
  },
  emptyText: { fontSize: 13, color: "#ccc", marginBottom: 4 },

  // Card
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 14,
    marginBottom: 10, elevation: 1,
    shadowColor: "#000", shadowOpacity: 0.05,
    shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
  },
  cardTop: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 10,
  },
  cardTopLeft:  { gap: 2 },
  orderNum:     { fontSize: 13, fontWeight: "700", color: "#1a1a1a" },
  orderTime:    { fontSize: 11, color: "#94A3B8" },
  statusBadge:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusBadgeText: { fontSize: 12, fontWeight: "700" },
  divider:      { height: 1, backgroundColor: "#f1f5f9", marginBottom: 10 },

  // Detail rows
  detailRow: {
    flexDirection: "row", alignItems: "center",
    gap: 8, marginBottom: 7,
  },
  detailLabel: { fontSize: 13, color: "#94A3B8", width: 72 },
  detailValue: { flex: 1, fontSize: 13, fontWeight: "600", color: "#1a1a1a", textAlign: "right" },
  detailValueOrange: { color: ORANGE },

  // Assigned agent
  agentAssignedRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#f0fdf4", borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8, marginTop: 6,
  },
  agentAssignedLeft: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  agentAssignedName: { fontSize: 13, fontWeight: "700", color: "#10b981" },
  deliveryPill: {
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  deliveryPillText: { fontSize: 11, fontWeight: "600" },
  removeBtn: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "#fef2f2", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8,
  },
  removeBtnText: { fontSize: 12, fontWeight: "600", color: "#ef4444" },

  // Not ready banner
  notReadyBanner: {
    flexDirection: "row", alignItems: "center", gap: 7,
    backgroundColor: "#fffbeb", paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: 10, marginTop: 8,
  },
  notReadyText: { fontSize: 12, fontWeight: "600", color: "#f59e0b" },

  // Agent chips
  agentsSection: { marginTop: 10 },
  agentsSectionLabel: {
    fontSize: 11, fontWeight: "700", color: "#94A3B8",
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8,
  },
  agentsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  agentChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8,
    backgroundColor: "#FFF0E0", borderWidth: 1, borderColor: ORANGE,
  },
  agentChipOff:  { backgroundColor: "#f8f9fb", borderColor: "#E2E8F0" },
  agentChipBest: { backgroundColor: ORANGE, borderColor: ORANGE },
  agentChipText:     { fontSize: 12, fontWeight: "600", color: ORANGE },
  agentChipTextOff:  { color: "#bbb" },
  agentChipTextBest: { color: "#fff" },
  agentChipCount:    { fontSize: 10, color: "#94A3B8" },
  suggestedHint:     { fontSize: 11, color: "#10b981", marginTop: 6 },

  fab: {
    position: "absolute", bottom: 24, alignSelf: "center",
    flexDirection: "row", alignItems: "center", gap: 7,
    backgroundColor: ORANGE, paddingHorizontal: 24,
    paddingVertical: 13, borderRadius: 30,
    shadowColor: ORANGE, shadowOpacity: 0.35,
    shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5,
  },
  fabText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
});