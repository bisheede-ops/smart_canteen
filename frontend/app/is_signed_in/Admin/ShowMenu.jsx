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
import { MenuStyles as styles } from "@/assets/src/styles/MenuStyles";
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
            router.push("/is_signed_in/Admin/HomeScreen")
          }
        />

        <NavItem
          icon="bicycle-outline"
          label="Delivery"
          onPress={() => router.push("/is_signed_in/Admin/AddDeliveryAgent")}
        />

        <NavItem
          icon="receipt-outline"
          label="Orders"
          onPress={() =>
            router.push("/is_signed_in/Admin/DeliveryAssign")
          }
        />

        <NavItem
          icon="person-outline"
          label="Profile"
          onPress={() =>
            router.push("/is_signed_in/Admin/ProfileScreen")
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


