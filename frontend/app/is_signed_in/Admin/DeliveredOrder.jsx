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
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";
import { auth, db } from "../../../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

const ORANGE = "#FF7A00";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "food_ordered"),
        where("delivered", "==", true)
      );

      const snap = await getDocs(q);

      const list = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setOrders(list);

      if (list.length === 0) {
        Toast.show({
          type: "info",
          text1: "No Orders",
          text2: "No orders delivered yet",
        });
      }
    } catch (error) {
      console.error("Firestore error:", error);
      Toast.show({
        type: "error",
        text1: "Failed to fetch orders",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Render each order
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text>
        <Text style={styles.bold}>Ordered by:</Text> {item.username}
      </Text>
      <Text>
        <Text style={styles.bold}>Food:</Text> {item.foodName}
      </Text>
      <Text>
        <Text style={styles.bold}>Quantity:</Text> {item.quantity}
      </Text>
      <Text>
        <Text style={styles.bold}>Price:</Text> ₹{item.totalPrice}
      </Text>      
      <Text>
        <Text style={styles.bold}>Delivered by:</Text> {item.deliveryAgentName}
      </Text>

      {item.place && (
        <Text>
          <Text style={styles.bold}>Place:</Text> {item.place}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Delivered Orders</Text>

      {loading ? (
        <ActivityIndicator size="large" color={ORANGE} />
      ) : orders.length === 0 ? (
        <Text style={styles.emptyText}>No delivered orders</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}

      <Toast />
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

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
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  bold: {
    fontWeight: "bold",
  },
  button: {
    backgroundColor: ORANGE,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#777",
  },
  delivered: {
    marginTop: 10,
    fontWeight: "bold",
    color: "green",
  },
});
