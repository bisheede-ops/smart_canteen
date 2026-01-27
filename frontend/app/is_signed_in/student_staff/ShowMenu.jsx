import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

const ORANGE = "#FF7A00";

export default function MenuScreen() {
  const router = useRouter();
  const [menu, setMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Snack");
  const [loadingImages, setLoadingImages] = useState({}); // track individual image loading

  /* ---------- FETCH MENU ---------- */
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const snapshot = await getDocs(collection(db, "menu"));
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMenu(list);
      } catch (err) {
        console.log("Error fetching menu:", err);
      }
    };
    fetchMenu();
  }, []);

  /* ---------- FILTER MENU ---------- */
  const filteredMenu = menu.filter((item) => item.category === selectedCategory);

  /* ---------- RENDER ITEM ---------- */
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.imageBox}>
        {!item.image ? (
          <Text style={{ color: "#999" }}>No Image</Text>
        ) : (
          <>
            <Image
              source={{ uri: item.image }} // Base64 URI supported directly
              style={styles.foodImage}
              onLoadStart={() =>
                setLoadingImages((prev) => ({ ...prev, [item.id]: true }))
              }
              onLoadEnd={() =>
                setLoadingImages((prev) => ({ ...prev, [item.id]: false }))
              }
            />
            {loadingImages[item.id] && (
              <ActivityIndicator
                size="small"
                color={ORANGE}
                style={styles.imageLoader}
              />
            )}
          </>
        )}
      </View>

      <Text style={styles.foodName}>{item.name}</Text>
      <Text style={styles.foodPrice}>₹ {item.price}</Text>

      {(item.category === "Breakfast" || item.category === "Lunch") && (
        <TouchableOpacity
          style={styles.tokenBtn}
          onPress={() =>
            router.push({
              pathname: "/is_signed_in/student_staff/OrderPage",
              params: {
                itemId: item.id,
                name: item.name,
                price: item.price,
                category: item.category,
              },
            })
          }
        >
          <Text style={styles.tokenBtnText}>Get Token</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.appName}>SmartCanteen</Text>
      </View>

      {/* CATEGORY TABS */}
      <View style={styles.tabs}>
        {["Snack", "Breakfast", "Lunch"].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.tab, selectedCategory === cat && styles.activeTab]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.tabText,
                selectedCategory === cat && styles.activeTabText,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* MENU GRID */}
      <FlatList
        data={filteredMenu}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No items available</Text>
        }
      />

      {/* BOTTOM NAV */}
      <View style={styles.navbar}>
        <NavItem
          icon="home-outline"
          label="Home"
          onPress={() =>
            router.push("/is_signed_in/student_staff/HomeScreen")
          }
        />
        <NavItem
          icon="sparkles-outline"
          label="Special Food"
          onPress={() =>
            router.push("/is_signed_in/student_staff/SpecialFood")
          }
        />
        <NavItem
          icon="notifications-outline"
          label="Notification"
          onPress={() =>
            router.push("/is_signed_in/student_staff/Notification")
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

function NavItem({ icon, label, onPress, active }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Ionicons name={icon} size={24} color={active ? ORANGE : "#888"} />
      <Text
        style={[styles.navText, active && { color: ORANGE, fontWeight: "bold" }]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF4EB" },
  header: { padding: 16, alignItems: "center" },
  appName: { fontSize: 22, fontWeight: "700", color: ORANGE },
  tabs: { flexDirection: "row", justifyContent: "space-around", marginBottom: 10 },
  tab: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, backgroundColor: "#FFE1C2" },
  activeTab: { backgroundColor: ORANGE },
  tabText: { color: ORANGE, fontWeight: "600" },
  activeTabText: { color: "#fff" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 12, margin: 10, width: "45%", alignItems: "center", elevation: 3 },
  imageBox: { height: 100, width: "100%", borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 8, backgroundColor: "#FFF1E4" },
  foodImage: { height: "100%", width: "100%", borderRadius: 12, resizeMode: "cover" },
  imageLoader: { position: "absolute" },
  foodName: { fontSize: 14, fontWeight: "600", textAlign: "center" },
  foodPrice: { fontSize: 13, color: ORANGE, marginTop: 4 },
  tokenBtn: { marginTop: 8, backgroundColor: ORANGE, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20 },
  tokenBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 40 },
  navbar: { position: "absolute", bottom: 0, width: "100%", height: 65, flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#FFD2A6" },
  navItem: { alignItems: "center" },
  navText: { fontSize: 11, color: "#888", marginTop: 2 },
});
