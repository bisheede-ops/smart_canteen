
import React, { useState, useEffect } from "react";
import { Alert, ScrollView } from "react-native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  addDoc,
  doc,
  getDoc,
} from "firebase/firestore";

import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { db, auth } from "../../../firebaseConfig";

import {
  validateFoodName,
  validateNumber,
  validateName,
} from "../../../utils/validation";

import {
  styles,
  ORANGE,
  INACTIVE,
} from "@/assets/src/styles/OrderPageStyles.js";

/* =========================
   DELIVERY PLACES
========================= */
const PLACES = [
  "Cheruthoni",
  "Painavu",
  "Paremavu",
  "Nila Hostel",
  "Kabani Hostel",
  "Staff quarters near LH",
  "Staff quarters near administrative block"
];

/* =========================
   ORDER PAGE
========================= */
export default function OrderPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [username, setUsername] = useState("");
  const [phoneno, setPhoneno] = useState("");
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const [place, setPlace] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [toBeDelivered, setToBeDelivered] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params?.name) setFoodName(params.name);
    if (params?.price) setPrice(Number(params.price));
  }, [params]);

  useEffect(() => {
    if (quantity && price) {
      setTotalPrice(Number(quantity) * price);
    } else {
      setTotalPrice(0);
    }
  }, [quantity, price]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          setUsername(snap.data().username || snap.data().name || "unknown");
          setPhoneno(snap.data().phone || "unknown");
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserDetails();
  }, []);

  const placeOrder = async () => {
    if (loading) return;
    setLoading(true);

    if (!foodName || !quantity) {
      Toast.show({ type: "error", text1: "Missing details" });
      setLoading(false);
      return;
    }

    const foodError = validateFoodName(foodName);
    if (foodError) {
      Alert.alert("Error", foodError);
      setLoading(false);
      return;
    }

    const qtyError = validateNumber(quantity);
    if (qtyError) {
      Alert.alert("Error", qtyError);
      setLoading(false);
      return;
    }

    if (toBeDelivered) {
      if (!place) {
        Alert.alert("Error", "Delivery place required");
        setLoading(false);
        return;
      }

      const placeError = validateName(place);
      if (placeError) {
        Alert.alert("Error", placeError);
        setLoading(false);
        return;
      }
    }

    try {
      await addDoc(collection(db, "food_ordered"), {
        userId: auth.currentUser.uid,
        username,
        phoneno,
        foodName,
        quantity: Number(quantity),
        price,
        totalPrice,
        place: toBeDelivered ? place : "",
        toBeDelivered,
        deliveryBy: "",
        createdAt: new Date(),
      });

      Toast.show({ type: "success", text1: "Order Placed" });
      setTimeout(() => {
        router.push("/is_signed_in/student_staff/HomeScreen");
        console.log("ordered");
      }, 100);
      setQuantity("");
      setPlace("");
      setShowDropdown(false);
      setToBeDelivered(false);
      setTotalPrice(0);
      
    } catch (err) {
      Toast.show({ type: "error", text1: "Order Failed" });
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* SCROLLABLE FORM AREA */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Food Order</Text>

        <Text style={styles.label}>Logged in as</Text>
        <View style={styles.userBox}>
          <Ionicons name="person-outline" size={18} color={ORANGE} />
          <Text style={styles.usernameText}>{username}</Text>
        </View>

        <Input label="Food Name" value={foodName} editable={false} />

        <Input
          label="Quantity"
          value={quantity}
          onChange={setQuantity}
          keyboard="number-pad"
        />

        {totalPrice > 0 && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceTitle}>TOTAL AMOUNT</Text>
            <Text style={styles.priceText}>₹ {totalPrice}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setToBeDelivered(!toBeDelivered)}
        >
          <Ionicons
            name={toBeDelivered ? "checkbox" : "square-outline"}
            size={22}
            color={ORANGE}
          />
          <Text style={styles.toggleText}>To be delivered</Text>
        </TouchableOpacity>

        {toBeDelivered && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.label}>Delivery Place</Text>

            <TouchableOpacity
              style={[
                styles.input,
                {
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                },
              ]}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Text style={{ color: place ? "#000" : "#999" }}>
                {place || "Select place"}
              </Text>

              <Ionicons
                name={showDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color={ORANGE}
              />
            </TouchableOpacity>

            {showDropdown && (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 8,
                  marginTop: 6,
                  backgroundColor: "#fff",
                  maxHeight: 180,
                }}
              >
                <ScrollView showsVerticalScrollIndicator={false}
                nestedScrollEnabled>
                  {PLACES.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={{
                        padding: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: "#eee",
                      }}
                      onPress={() => {
                        setPlace(item);
                        setShowDropdown(false);
                      }}
                    >
                      <Text>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={placeOrder}>
          <Ionicons name="cart-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>
            {loading ? "ORDERING..." : "PLACE ORDER"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* FIXED NAVBAR */}
      <View style={styles.navbar}>
        <NavItem
          icon="home"
          label="Home"
          onPress={() => router.push("/is_signed_in/student_staff/HomeScreen")}
        />
        <NavItem
          icon="restaurant-outline"
          label="Menu"
          onPress={() => router.push("/is_signed_in/student_staff/ShowMenu")}
        />
        <NavItem icon="receipt-outline" label="Orders" active />
        <NavItem
          icon="person-outline"
          label="Profile"
          onPress={() => router.push("/is_signed_in/student_staff/ProfileScreen")}
        />
      </View>
    </SafeAreaView>
  );
}

/* =========================
   INPUT COMPONENT
========================= */
function Input({ label, value, onChange, keyboard, editable = true }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        editable={editable}
        style={[
          styles.input,
          !editable && { backgroundColor: "#F3F3F3" },
        ]}
      />
    </>
  );
}

/* =========================
   NAV ITEM COMPONENT
========================= */
function NavItem({ icon, label, onPress, active }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Ionicons
        name={icon}
        size={24}
        color={active ? ORANGE : INACTIVE}
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


