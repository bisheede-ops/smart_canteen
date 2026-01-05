import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../../firebaseConfig";

const ORANGE = "#FF7A00";

export default function ProfileScreen() {
  const router = useRouter();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/is_signed_out/LoginScreen");
        return;
      }

      try {
        const agentRef = doc(db, "delivery_agents", user.uid);
        const agentSnap = await getDoc(agentRef);

        if (agentSnap.exists()) {
          setAgent(agentSnap.data());
        } else {
          console.log("Delivery agent not found in Firestore");
        }
      } catch (error) {
        console.error("Error fetching agent profile:", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    router.replace("/is_signed_out/LoginScreen");
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

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

        <Text style={styles.name}>{agent?.name || "Delivery Agent"}</Text>
        <Text style={styles.role}>Delivery Agent</Text>
        <Text style={styles.userId}>{agent?.username || ""}</Text>

        {/* Logout */}
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
          onPress={() => router.push("/is_signed_in/Delivery/HomeScreen")}
        />

        <NavItem
          icon="receipt-outline"
          label="To Deliver"
          onPress={() =>
            router.push("/is_signed_in/Delivery/Orders")
          }
        />

        <NavItem
          icon="receipt-outline"
          label="Delivered"
          onPress={() =>
            router.push("/is_signed_in/Delivery/OrderHistory")
          }
        />
        <NavItem
          icon="person"
          label="Profile"
          active
          onPress={() => router.push("/is_signed_in/Delivery/ProfileScreen")}
        />
      </View>
    </SafeAreaView>
  );
}

function NavItem({ icon, label, onPress, active, danger }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Ionicons
        name={icon}
        size={24}
        color={danger ? "#E53935" : active ? ORANGE : "#888"}
      />
      <Text
        style={[
          styles.navText,
          active && { color: ORANGE, fontWeight: "bold" },
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
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
