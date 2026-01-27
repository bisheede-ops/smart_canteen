import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../../firebaseConfig";

const ORANGE = "#FF7A00";

const parseOrderDate = (createdAt) => {
  if (!createdAt) return null;
  if (typeof createdAt === "object" && createdAt.seconds) {
    return new Date(createdAt.seconds * 1000);
  }
  const d = new Date(createdAt);
  return isNaN(d.getTime()) ? null : d;
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

export default function OrderStatus() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUser(); }, []);
  useEffect(() => { if (user?.phone) fetchOrders(); }, [user]);

  const fetchUser = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) setUser(snap.data());
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "food_ordered"), where("phoneno", "==", user.phone));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Failed to fetch orders" });
    } finally { setLoading(false); }
  };

  const listData = useMemo(() => {
    const notDelivered = orders.filter(o => !o.delivered);
    return notDelivered.length
      ? notDelivered.map(o => ({ ...o, type: "order" }))
      : [{ type: "empty", text: "No pending orders" }];
  }, [orders]);

  const renderItem = ({ item }) => {
    if (item.type === "empty") return <Text style={styles.emptyText}>{item.text}</Text>;

    return (
      <View style={styles.card}>
        <Text style={styles.foodName}>{item.foodName} × {item.quantity}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Ordered At: </Text>
          <Text style={styles.value}>{formatOrderDate(item.createdAt)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Price: </Text>
          <Text style={styles.value}>₹{item.totalPrice}</Text>
        </View>

        {item.toBeDelivered ? (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Delivery Agent: </Text>
              <Text style={styles.value}>{item.deliveryAgentName || "Not Assigned"}</Text>
            </View>

            {item.deliveryAgentName && (
              <View style={styles.statusBox}>
                <Text style={styles.statusText}>
                  Status: {item.delivery_status || "Not Picked up"}
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.pickupRow}>
            <Text style={styles.pickupText}>Pickup at canteen</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Pending Orders</Text>

      {loading ? (
        <ActivityIndicator size="large" color={ORANGE} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item, index) => item.id ? item.id : `${item.type}-${index}`}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={fetchOrders}
          contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16, paddingTop: 10 }}
        />
      )}

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF9F2" },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: ORANGE,
    textAlign: "center",
    marginVertical: 18,
  },

  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 18,
    marginTop: 50,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  foodName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },

  row: {
    flexDirection: "row",
    marginBottom: 6,
  },

  label: {
    fontWeight: "600",
    color: "#555",
    fontSize: 16,
  },

  value: {
    color: "#333",
    fontSize: 16,
  },

  statusBox: {
    marginTop: 10,
    backgroundColor: "#FFF3E0",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignSelf: "flex-start",
  },

  statusText: {
    color: ORANGE,
    fontWeight: "700",
    fontSize: 16,
  },

  pickupRow: {
    marginTop: 10,
  },

  pickupText: {
    fontSize: 16,
    fontWeight: "600",
    color: ORANGE,
  },
});
