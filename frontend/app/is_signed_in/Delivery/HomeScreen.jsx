import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth, db } from "../../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const ORANGE = "#FF9800";

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // Fetch user from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUser(docSnap.data());
        } else {
          console.log("No such user in Firestore!");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome,</Text>
          <Text style={styles.name}>{user ? user.name : "Loading..."}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <ActionCard
            icon="restaurant-outline"
            label="View Menu"
            onPress={() =>
              router.push("/is_signed_in/student_staff/ShowMenu")
            }
          />
          <ActionCard
            icon="receipt-outline"
            label="My Orders"
            onPress={() =>
              router.push("/is_signed_in/student_staff/orders")
            }
          />
        </View>

        {/* Popular Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Today</Text>

          <FoodCard name="Veg Meals" price="₹60" />
          <FoodCard name="Chicken Biriyani" price="₹120" />
          <FoodCard name="Tea & Snacks" price="₹20" />
        </View>
      </ScrollView>

      {/* Bottom Navbar */}
      <View style={styles.navbar}>
        <NavItem
          icon="home"
          label="Home"
          active
          onPress={() =>
            router.push("/is_signed_in/student_staff/HomeScreen")
          }
        />
        <NavItem
          icon="restaurant-outline"
          label="Menu"
          onPress={() =>
            router.push("/is_signed_in/student_staff/ShowMenu")
          }
        />
        <NavItem
          icon="receipt-outline"
          label="Orders"
          onPress={() =>
            router.push("/is_signed_in/student_staff/orders")
          }
        />
        <NavItem
          icon="person-outline"
          label="Profile"
          onPress={() =>
            router.push("/is_signed_in/student_staff/ProfileScreen")
          }
        />
      </View>
    </SafeAreaView>
  );
}

function ActionCard({ icon, label, onPress }) {
  return (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={30} color={ORANGE} />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

function FoodCard({ name, price }) {
  return (
    <View style={styles.foodCard}>
      <Text style={styles.foodName}>{name}</Text>
      <Text style={styles.foodPrice}>{price}</Text>
    </View>
  );
}

function NavItem({ icon, label, onPress, active, danger }) {
  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={24}
        color={danger ? "#E53935" : active ? ORANGE : "#888"}
      />
      <Text
        style={[
          styles.navText,
          active && { color: ORANGE, fontWeight: "bold" },
          danger && { color: "#E53935" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7ED",
  },
  content: {
    padding: 20,
    paddingBottom: 90,
  },
  header: {
    marginBottom: 25,
  },
  welcome: {
    fontSize: 16,
    color: "#888",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: ORANGE,
  },
  role: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderRadius: 14,
    alignItems: "center",
    elevation: 3,
  },
  actionText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  foodCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 2,
  },
  foodName: {
    fontSize: 15,
  },
  foodPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: ORANGE,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 65,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#FFE0B2",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
});
