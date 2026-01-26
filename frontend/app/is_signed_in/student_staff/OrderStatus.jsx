
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../../firebaseConfig";

import { OrdersStyles as styles, ORANGE } from "@/assets/src/styles/OrdersStyles";

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

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.phone) fetchOrders();
  }, [user]);

  const fetchUser = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) setUser(snap.data());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const q = query(
        collection(db, "food_ordered"),
        where("phoneno", "==", user.phone)
      );

      const snap = await getDocs(q);
      setOrders(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }))
      );
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Failed to fetch orders",
      });
    } finally {
      setLoading(false);
    }
  };

  const listData = useMemo(() => {
    // Only include non-delivered orders
    const notDelivered = orders.filter(o => !o.delivered);

    return notDelivered.length
      ? notDelivered.map(o => ({ ...o, type: "order" }))
      : [{ type: "empty", text: "No pending orders" }];
  }, [orders]);

  const renderItem = ({ item }) => {
    if (item.type === "empty") {
      return <Text style={styles.emptyText}>{item.text}</Text>;
    }

    return (
      <View style={styles.card}>
        <Text style={styles.value}>
          <Text style={styles.label}>Food:</Text> {item.foodName} × {item.quantity}
        </Text>

        <Text style={styles.value}>
          <Text style={styles.label}>Ordered At:</Text> {formatOrderDate(item.createdAt)}
        </Text>

        <Text style={styles.value}>
          <Text style={styles.label}>Price:</Text> ₹{item.totalPrice}
        </Text>

        <Text style={styles.value}>
          <Text style={styles.label}>Delivery Agent:</Text> {item.deliveryAgentName || "Not Assigned"}
        </Text>

        {item.deliveryAgentName && (
          <Text style={styles.status}>
            Status: {item.delivery_status || "Not Picked up"}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Pending Orders</Text>

      {loading ? (
        <ActivityIndicator size="large" color={ORANGE} />
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item, index) =>
            item.id ? item.id : `${item.type}-${index}`
          }
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={fetchOrders}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      <Toast />
    </SafeAreaView>
  );
}
