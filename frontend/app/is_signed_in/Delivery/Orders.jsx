import { useEffect, useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OrdersStyles as styles, ORANGE } from "@/assets/src/styles/OrdersStyles";

import Toast from "react-native-toast-message";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";
import { auth, db } from "../../../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

const DELIVERY_STATUSES = ["Picked up", "On my way", "Near your location"];

// Safe date parsing
const parseOrderDate = (createdAt) => {
  if (!createdAt) return null;

  try {
    if (createdAt?.seconds) {
      // Firestore timestamp
      return new Date(createdAt.seconds * 1000);
    }

    if (typeof createdAt === "string") {
      const dateObj = new Date(createdAt);
      if (isNaN(dateObj.getTime())) return null;
      return dateObj;
    }

    if (createdAt instanceof Date) return createdAt;

    return null;
  } catch (err) {
    console.warn("Invalid createdAt value:", createdAt, err);
    return null;
  }
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

export default function DeliveryOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const agentUid = auth.currentUser?.uid;

  useEffect(() => {
    if (!agentUid) {
      Toast.show({ type: "error", text1: "Not signed in" });
      setLoading(false);
      return;
    }
    fetchOrders();
  }, [agentUid]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "food_ordered"),
        where("deliveryAgentId", "==", agentUid),
        where("delivered", "==", false)
      );

      const snap = await getDocs(q);
      const list = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setOrders(list);
    } catch (error) {
      console.error(error);
      Toast.show({ type: "error", text1: "Failed to fetch orders" });
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryStatus = async (orderId, status) => {
    try {
      const orderRef = doc(db, "food_ordered", orderId);
      await updateDoc(orderRef, { delivery_status: status });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, delivery_status: status } : order
        )
      );

      Toast.show({ type: "success", text1: "Status Updated", text2: status });
    } catch (error) {
      console.error(error);
      Toast.show({ type: "error", text1: "Status update failed" });
    } finally {
      setStatusModalVisible(false);
      setSelectedOrderId(null);
    }
  };

  const markDelivered = async (orderId) => {
    try {
      await updateDoc(doc(db, "food_ordered", orderId), {
        delivered: true,
        delivery_status: "Delivered",
      });

      await updateDoc(doc(db, "delivery_agents", agentUid), {
        completed_order: increment(1),
      });

      Toast.show({ type: "success", text1: "Order Delivered" });

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Delivery update failed" });
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Food:</Text>
        <Text style={styles.value}>{item.foodName || "Unknown"}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Quantity:</Text>
        <Text style={styles.value}>{item.quantity ?? "0"}</Text>
      </View>

      {item.place && (
        <View style={styles.row}>
          <Text style={styles.label}>Place:</Text>
          <Text style={styles.value}>{item.place}</Text>
        </View>
      )}

      <View style={styles.row}>
        <Text style={styles.label}>Phone No:</Text>
        <Text style={styles.value}>{item.phoneno || "No number"}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Ordered At:</Text>
        <Text style={styles.value}>{formatOrderDate(item.createdAt)}</Text>
      </View>

      <Text style={styles.status}>
        Status: {item.delivery_status || "Not updated"}
      </Text>

      <View style={styles.btncontainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setSelectedOrderId(item.id);
            setStatusModalVisible(true);
          }}
        >
          <Ionicons name="chevron-down" size={18} color="#fff" />
          <Text style={styles.buttonText}>UPDATE STATUS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => markDelivered(item.id)}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
          <Text style={styles.buttonText}>MARK DELIVERED</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Orders to Deliver</Text>

      {loading ? (
        <ActivityIndicator size="large" color={ORANGE} />
      ) : orders.length === 0 ? (
        <Text style={styles.emptyText}>No assigned orders</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={fetchOrders}
        />
      )}

      <Modal transparent visible={statusModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {DELIVERY_STATUSES.map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.modalItem}
                onPress={() => updateDeliveryStatus(selectedOrderId, status)}
              >
                <Text style={styles.modalText}>{status}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setStatusModalVisible(false)}
            >
              <Text style={{ color: "red" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
}
