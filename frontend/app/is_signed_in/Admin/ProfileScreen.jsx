import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../../firebaseConfig";

import { ProfileStyles as styles } from "../../../assets/src/styles/ProfileStyles";

const ORANGE = "#FF9800";
const INACTIVE = "#888";

export default function ProfileScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUser(docSnap.data());
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
      router.push("/is_signed_out/LoginScreen");
    } catch (error) {
      console.error("Logout Error:", error);
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
            <Text style={styles.name}>{user.name}</Text>
            
            <Text style={styles.userId}>{user.username}</Text>
          </>
        ) : (
          <Text>Loading...</Text>
        )}

        {/* Logout Button */}
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
          active={pathname === "/is_signed_in/Admin/HomeScreen"}
          onPress={() =>
            router.push("/is_signed_in/Admin/HomeScreen")
          }
        />

        <NavItem
          icon="bicycle-outline"
          label="Delivery"
          active={pathname === "/is_signed_in/Admin/AddDeliveryAgent"}
          onPress={() =>
            router.push("/is_signed_in/Admin/AddDeliveryAgent")
          }
        />

        <NavItem
          icon="receipt-outline"
          label="Orders"
          active={pathname === "/is_signed_in/Admin/orders"}
          onPress={() =>
            router.push("/is_signed_in/Admin/DeliveryAssign")
          }
        />

        <NavItem
          icon="person"
          label="Profile"
          active={pathname === "/is_signed_in/Admin/ProfileScreen"}
        />
      </View>
    </SafeAreaView>
  );
}

function NavItem({ icon, label, onPress, active }) {
  const color = active ? ORANGE : INACTIVE;

  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={24} color={color} />
      <Text
        style={[
          styles.navText,
          { color },
          active && { fontWeight: "bold" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
