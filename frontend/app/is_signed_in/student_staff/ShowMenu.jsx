

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
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import Toast from "react-native-toast-message";

const ORANGE = "#FF7A00";
const CATEGORIES = ["Snack", "Breakfast", "Lunch"];

export default function MenuScreen() {
  const router = useRouter();

  const [menu, setMenu] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Snack");
  const [loadingImages, setLoadingImages] = useState({});
  const [tokenLoading, setTokenLoading] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      console.log("[MenuScreen] Fetching menu from Firestore...");
      try {
        const snapshot = await getDocs(collection(db, "menu"));
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log(`[MenuScreen] Menu fetched successfully. ${list.length} items found.`);
        setMenu(list);
      } catch (err) {
        console.error("[MenuScreen] ERROR fetching menu:", err);
        Toast.show({ type: "error", text1: "Failed to load menu" });
      } finally {
        setMenuLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const goToOrderPage = (item) => {
    console.log(`[MenuScreen] Navigating to OrderPage for item: ${item.name} (id: ${item.id})`);
    router.push({
      pathname: "/is_signed_in/student_staff/OrderPage",
      params: {
        itemId: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
      },
    });
  };

  const handleGetToken = async (item) => {
    if (tokenLoading) {
      console.log("[MenuScreen] Token check already in progress, ignoring tap.");
      return;
    }

    console.log(`[MenuScreen] Checking token availability for: ${item.name} (itemId: ${item.id})`);

    try {
      setTokenLoading(item.id);

      const tokenRef = doc(db, "token", item.name.toLowerCase());
      const tokenSnap = await getDoc(tokenRef);

      if (!tokenSnap.exists()) {
        console.log(`[MenuScreen] No token doc found for "${item.name}" — no limit set, proceeding.`);
        goToOrderPage(item);
        return;
      }

      const { remainingToken } = tokenSnap.data();
      console.log(`[MenuScreen] Token doc found for "${item.name}". Remaining: ${remainingToken}`);

      if (remainingToken > 0) {
        console.log(`[MenuScreen] Tokens available (${remainingToken}), proceeding to OrderPage.`);
        goToOrderPage(item);
      } else {
        console.warn(`[MenuScreen] "${item.name}" is sold out. remainingToken: ${remainingToken}`);
        Toast.show({
          type: "error",
          text1: "Item finished",
          text2: `${item.name} is sold out for today`,
        });
      }
    } catch (error) {
      console.error(`[MenuScreen] ERROR checking token for "${item.name}":`, error);
      Toast.show({ type: "error", text1: "Could not check availability" });
    } finally {
      setTokenLoading(null);
    }
  };

  const filteredMenu = menu.filter((item) => item.category === selectedCategory);

  const renderItem = ({ item }) => {
    const isSnack = item.category === "Snack";
    const isCheckingThis = tokenLoading === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.imageBox}>
          {item.image ? (
            <>
              <Image
                source={{ uri: item.image }}
                style={styles.foodImage}
                onLoadStart={() => {
                  console.log(`[MenuScreen] Image loading started for: ${item.name}`);
                  setLoadingImages((prev) => ({ ...prev, [item.id]: true }));
                }}
                onLoadEnd={() => {
                  console.log(`[MenuScreen] Image loaded successfully for: ${item.name}`);
                  setLoadingImages((prev) => ({ ...prev, [item.id]: false }));
                }}
                onError={() => {
                  console.warn(`[MenuScreen] Image failed to load for: ${item.name}`);
                  setLoadingImages((prev) => ({ ...prev, [item.id]: false }));
                }}
              />
              {loadingImages[item.id] && (
                <ActivityIndicator size="small" color={ORANGE} style={styles.imageLoader} />
              )}
            </>
          ) : (
            <View style={styles.noImageBox}>
              <Ionicons name="fast-food-outline" size={36} color="#FFD2A6" />
            </View>
          )}
        </View>

        <Text style={styles.foodName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.foodPrice}>₹ {item.price}</Text>

        {!isSnack && (
          <TouchableOpacity
            style={[styles.actionBtn, isCheckingThis && styles.actionBtnDisabled]}
            onPress={() => handleGetToken(item)}
            disabled={!!tokenLoading}
          >
            {isCheckingThis ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.actionBtnText}>Get Token</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>SmartCanteen</Text>
      </View>

      <View style={styles.tabs}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.tab, selectedCategory === cat && styles.activeTab]}
            onPress={() => {
              console.log(`[MenuScreen] Category switched to: ${cat}`);
              setSelectedCategory(cat);
            }}
          >
            <Text style={[styles.tabText, selectedCategory === cat && styles.activeTabText]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {menuLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={styles.loadingText}>Loading menu...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMenu}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 6 }}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="fast-food-outline" size={48} color="#FFD2A6" />
              <Text style={styles.emptyText}>No items available</Text>
            </View>
          }
        />
      )}

      <View style={styles.navbar}>
        <NavItem icon="home-outline" label="Home" onPress={() => router.push("/is_signed_in/student_staff/HomeScreen")} />
        <NavItem icon="sparkles-outline" label="Special" onPress={() => router.push("/is_signed_in/student_staff/SpecialFood")} />
        <NavItem icon="notifications-outline" label="Alerts" onPress={() => router.push("/is_signed_in/student_staff/Notification")} />
        <NavItem icon="person-outline" label="Profile" onPress={() => router.push("/is_signed_in/student_staff/ProfileScreen")} />
      </View>
    </SafeAreaView>
  );
}

function NavItem({ icon, label, onPress, active }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Ionicons name={icon} size={24} color={active ? ORANGE : "#888"} />
      <Text style={[styles.navText, active && { color: ORANGE, fontWeight: "bold" }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF4EB" },
  header: { padding: 16, alignItems: "center" },
  appName: { fontSize: 22, fontWeight: "700", color: ORANGE },
  tabs: { flexDirection: "row", justifyContent: "space-around", marginBottom: 12, paddingHorizontal: 12 },
  tab: { flex: 1, marginHorizontal: 4, paddingVertical: 8, borderRadius: 20, backgroundColor: "#FFE1C2", alignItems: "center" },
  activeTab: { backgroundColor: ORANGE },
  tabText: { color: ORANGE, fontWeight: "600", fontSize: 13 },
  activeTabText: { color: "#fff" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 12, margin: 6, width: "47%", alignItems: "center", elevation: 3, shadowColor: "#f97316", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  imageBox: { height: 100, width: "100%", borderRadius: 12, overflow: "hidden", marginBottom: 8, backgroundColor: "#FFF1E4", justifyContent: "center", alignItems: "center" },
  foodImage: { height: "100%", width: "100%", resizeMode: "cover" },
  imageLoader: { position: "absolute" },
  noImageBox: { justifyContent: "center", alignItems: "center" },
  foodName: { fontSize: 13, fontWeight: "600", textAlign: "center", color: "#1a1a1a", marginBottom: 2, minHeight: 36 },
  foodPrice: { fontSize: 13, color: ORANGE, fontWeight: "700", marginBottom: 8 },
  actionBtn: { backgroundColor: ORANGE, paddingVertical: 7, paddingHorizontal: 18, borderRadius: 20, minWidth: 90, alignItems: "center" },
  actionBtnDisabled: { backgroundColor: "#ffb380" },
  actionBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 60 },
  loadingText: { color: "#aaa", marginTop: 10, fontSize: 13 },
  emptyText: { color: "#aaa", marginTop: 8, fontSize: 14 },
  navbar: { position: "absolute", bottom: 0, width: "100%", height: 65, flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#FFD2A6" },
  navItem: { alignItems: "center" },
  navText: { fontSize: 11, color: "#888", marginTop: 2 },
});