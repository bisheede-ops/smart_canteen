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

  // Logout function
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
            <Text style={styles.role}>{user.role}</Text>
            <Text style={styles.userId}>{user.username}</Text>
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
            router.push("/is_signed_in/student_staff/orders")
          }
        />

        <NavItem
          icon="person"
          label="Profile"
          active
          onPress={() =>
            router.push("/is_signed_in/student_staff/ProfileScreen")
          }
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4EB",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: ORANGE,
  },
  role: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  userId: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },
  email: {
    fontSize: 13,
    color: "#777",
    marginTop: 6,
  },

  /* 🔹 Logout button style */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ORANGE,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 30,
  },
  logoutText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },

  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 65,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#FFD2A6",
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
