
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View,ScrollView} from "react-native";

/* ---------- MAIN DASHBOARD ITEMS ---------- */
const gridItems = [
  {
    title: "Menu",
    subtitle: "View food items",
    onPress: () => router.push("is_signed_in/Admin/AddNewMenu"),
  },
  {
    title: "Delivery Agent",
    subtitle: "Add new agent",
    onPress: () => router.push("is_signed_in/Admin/AddDeliveryAgent"),
  },
  { title: "Emergency Meal", subtitle: "Instant food" },
  { title: "Special Food", subtitle: "Today's special", onPress: () => router.push("/is_signed_in/Admin/SpecialFood"), },
  { title: "Subscription", subtitle: "Weekly plan" },
  { title: "Token", subtitle: "Generate token" },
  {
    title: "Assign Details",
    subtitle: "Pass details to delivery agent",
    onPress: () => router.push("/is_signed_in/Admin/DeliveryAssign"),
  },
  {
    title: "Feedback",
    subtitle: "Suggestions and Reviews",
  },
];

export default function Index() {
  const handleLogout = () => {
    // Later you can add Firebase signOut here
    router.push("is_signed_in/Admin/ProfileScreen");
  };

  return (
    <ScrollView style={styles.container}>
      {/* ---------- HEADER ---------- */}
      <View style={styles.header}>
        <Text style={styles.appName}>SmartCanteen</Text>

        {/* LOGOUT ICON */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={26} color="#FF7A00" />
        </TouchableOpacity>
      </View>

      {/* ---------- GRID (2 COLUMNS) ---------- */}
      <View style={styles.grid}>
        {gridItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            activeOpacity={0.85}
            onPress={item.onPress}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ paddingBottom: 50 }} />
    </ScrollView>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF6ED",
    padding: 20,
    marginTop:20,
  },

  /* HEADER */
  header: {
    marginBottom: 24,
    justifyContent: "center",
  },

  appName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FF7A00",
  },

  logoutBtn: {
    position: "absolute",
    right: 0,
    padding: 6,
  },

  /* GRID */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    backgroundColor: "#FFFFFF",
    width: "48%",
    height: 140,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    justifyContent: "space-between",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },

  centerWrapper: {
    alignItems: "center",
    marginTop: 10,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FF7A00",
  },

  cardSubtitle: {
    fontSize: 13,
    color: "#666",
  },
});
