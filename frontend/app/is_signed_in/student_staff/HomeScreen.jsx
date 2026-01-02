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

import { HomeStyles as styles, ORANGE } from "@/assets/src/styles/HomeStyles";

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);

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
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome,</Text>
          <Text style={styles.name}>{user ? user.name : ""}</Text>
        </View>

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
            label="Order Food"
            onPress={() =>
              router.push("/is_signed_in/student_staff/OrderPage")
            }   
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Today</Text>

          <FoodCard name="Veg Meals" price="₹60" />
          <FoodCard name="Chicken Biriyani" price="₹120" />
          <FoodCard name="Tea & Snacks" price="₹20" />
        </View>
      </ScrollView>

      <View style={styles.navbar}>
        <NavItem
          icon="home"
          label="Home"
          active

          
        />
        <NavItem
          icon="restaurant-outline"
          label="View Menu"
          onPress={() => router.push("/is_signed_in/student_staff/ShowMenu")}
        />
        <NavItem
          icon="receipt-outline"
          label="Orders"
          onPress={() =>
            router.push("/is_signed_in/student_staff/OrderPage")
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
