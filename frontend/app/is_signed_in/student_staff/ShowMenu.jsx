import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ORANGE = "#FF7A00";

export default function MenuScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* APP NAME */}
        <Text style={styles.appName}>SmartCanteen</Text>
        <View style={styles.divider} />

        {/* TITLE */}
        <Text style={styles.title}>MENU</Text>

        {/* MENU CARDS */}
        <View style={styles.grid}>
          <MenuCard title="Snacks" />
          <MenuCard title="Breakfast (8:30 am - 10:00 am)" token />
          <MenuCard title="Lunch (11:30 am - 2:00 pm)" token />
        </View>
      </ScrollView>

      {/* 🔻 BOTTOM NAVBAR */}
      <View style={styles.navbar}>
        <NavItem
          icon="home-outline"
          label="Home"
          onPress={() =>
            router.push("/is_signed_in/student_staff/HomeScreen")
          }
        />

        <NavItem
          icon="restaurant"
          label="Menu"
          active
         
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

/* ---------- MENU CARD ---------- */
function MenuCard({ title, token = false }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>

        {token && (
          <TouchableOpacity style={styles.tokenBtn}>
            <Text style={styles.tokenText}>Get a Token</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.emptySpace} />
    </View>
  );
}

/* ---------- NAV ITEM ---------- */
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
        color={
          danger ? "#E53935" : active ? ORANGE : "#888"
        }
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

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4EB",
  },

  appName: {
    fontSize: 22,
    fontWeight: "700",
    color: ORANGE,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 20,
  },

  divider: {
    height: 4,
    width: "100%",
    backgroundColor: ORANGE,
    marginVertical: 12,
    borderRadius: 2,
  },

  title: {
    fontWeight: "600",
    fontSize: 26,
    textAlign: "center",
    color: ORANGE,
    marginBottom: 40,
  },

  grid: {
    paddingHorizontal: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: ORANGE,
  },

  tokenBtn: {
    backgroundColor: ORANGE,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  tokenText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  emptySpace: {
    height: 60,
  },

  /* ---------- NAVBAR ---------- */
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
