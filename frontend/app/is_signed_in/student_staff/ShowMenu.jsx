import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

const ORANGE = "#FF7A00";

const getCategoryImage = (category) => {
  if (category === "Snack") return require("@/assets/images/snacks.webp");
  if (category === "Breakfast") return require("@/assets/images/bf.webp");
  if (category === "Lunch") return require("@/assets/images/lunch.jpg");
  return "fast-food-outline";
};


export default function MenuScreen() {
  const router = useRouter();

  const [menu, setMenu] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("Snack"); // DEFAULT
  
    /* ---------- FETCH MENU ---------- */
    useEffect(() => {
      const fetchMenu = async () => {
        const snapshot = await getDocs(collection(db, "menu"));
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMenu(list);
      };
  
      fetchMenu();
    }, []);
  
    /* ---------- FILTERED MENU ---------- */
    const filteredMenu = menu.filter(
      item => item.category === selectedCategory
    );

  return (
    <SafeAreaView style={styles.container}>
      {/* ---------- HEADER ---------- */}
      <View style={styles.header}>
        <Text style={styles.appName}>SmartCanteen</Text>
      </View>

      {/* ---------- CATEGORY TABS ---------- */}
      <View style={styles.tabs}>
        {["Snack", "Breakfast", "Lunch"].map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.tab,
              selectedCategory === cat && styles.activeTab,
            ]}
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

      {/* ---------- MENU GRID ---------- */}
      <FlatList
        data={filteredMenu}
        numColumns={2}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* OPTIONAL IMAGE PLACEHOLDER */}
            <View style={styles.imageBox}>
              <Image
                 source={getCategoryImage(selectedCategory)}
                  style={styles.foodImage}
              />
            </View>

            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={styles.foodPrice}>₹ {item.price}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No items available</Text>
        }
      />

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

  header: {
    padding: 16,
    alignItems: "center",
  },

  appName: {
    fontSize: 22,
    fontWeight: "700",
    color: ORANGE,
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "#FFE1C2",
  },

  activeTab: {
    backgroundColor: ORANGE,
  },

  tabText: {
    color: ORANGE,
    fontWeight: "600",
  },

  activeTabText: {
    color: "#fff",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    margin: 10,
    width: "45%",
    alignItems: "center",
    elevation: 3,
  },

  imageBox: {
    height: 80,
    width: "100%",
    backgroundColor: "#FFF1E4",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  foodName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  foodPrice: {
    fontSize: 13,
    color: ORANGE,
    marginTop: 4,
  },

  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 40,
  },

  /* ---------- NAVBAR ---------- */
  navbar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 65,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#FFD2A6",
  },

  navItem: {
    alignItems: "center",
  },

  navText: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },

  foodImage: {
  // width: 150,
  // height: 100,
  // resizeMode: "contain",

    height: 80,
    width: "100%",
    backgroundColor: "#FFF1E4",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
});
