import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../../firebaseConfig";

import { ProfileStyles as styles } from "../../../assets/src/styles/ProfileStyles";
const ORANGE = "#FF7A00";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // Fetch user data from Firestore
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

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace("/is_signed_out/LoginScreen");
      console.log("user logged out");
    } catch (error) {
      console.error("Logout Error:", error);
      console.log("user logout failed");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Profile Content */}
      <View style={styles.content}>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }}
          style={styles.avatar}
        />

        {user ? (
          <>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.role}>{user?.role}</Text>
            <Text style={styles.userId}>{user?.username}</Text>
          </>
        ) : (
          <Text>Loading...</Text>
        )}

        {/* 🔹 Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navbar */}
      <View style={styles.navbar}>
        <NavItem
          icon="home-outline"
          label="Home"
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
            router.push("/is_signed_in/student_staff/OrderPage")
          }
        />

        <NavItem
          icon="person"
          label="Profile"
          active

        />
      </View>
    </SafeAreaView>
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
