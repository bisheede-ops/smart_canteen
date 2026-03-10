

import React, { useState, useEffect } from "react";
import {
  ScrollView, View, Text, TextInput,
  TouchableOpacity, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { db, auth } from "../../../firebaseConfig";
import { validateNumber } from "../../../utils/validation";
import { styles, ORANGE, INACTIVE } from "@/assets/src/styles/OrderPageStyles.js";

const PLACES = [
  "Cheruthoni", "Painavu", "Paremavu",
  "Nila Hostel", "Kabani Hostel",
  "Staff quarters near LH",
  "Staff quarters near administrative block",
];

export default function OrderPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const foodName     = params?.name    || "";
  const price        = Number(params?.price || 0);
  const itemId       = params?.itemId  || foodName.toLowerCase();

  const [username, setUsername]         = useState("");
  const [quantity, setQuantity]         = useState("");
  const [place, setPlace]               = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [toBeDelivered, setToBeDelivered] = useState(false);
  const [loading, setLoading]           = useState(false);

  const totalPrice = quantity && price ? Number(quantity) * price : 0;

  useEffect(() => {
    console.log(`[OrderPage] Screen mounted. Item: "${foodName}", Price: ₹${price}, ItemId: ${itemId}`);

    const fetchUserDetails = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.warn("[OrderPage] No authenticated user found.");
        return;
      }
      console.log(`[OrderPage] Fetching user details for uid: ${uid}`);
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          const name = snap.data().username || snap.data().name || "Unknown";
          console.log(`[OrderPage] User details fetched. Username: ${name}`);
          setUsername(name);
        } else {
          console.warn("[OrderPage] User document does not exist in Firestore.");
        }
      } catch (err) {
        console.error("[OrderPage] ERROR fetching user details:", err);
      }
    };

    fetchUserDetails();
  }, []);

  const placeOrder = async () => {
    if (loading) {
      console.log("[OrderPage] placeOrder called while already loading, ignoring.");
      return;
    }

    console.log(`[OrderPage] placeOrder triggered. foodName: ${foodName}, quantity: ${quantity}, toBeDelivered: ${toBeDelivered}, place: "${place}"`);

    if (!quantity) {
      console.warn("[OrderPage] Validation failed: quantity is empty.");
      Toast.show({ type: "error", text1: "Please enter a quantity" });
      return;
    }

    const qtyError = validateNumber(quantity);
    if (qtyError) {
      console.warn(`[OrderPage] Validation failed: ${qtyError}`);
      Toast.show({ type: "error", text1: qtyError });
      return;
    }

    const qty = Number(quantity);
    if (qty < 1) {
      console.warn(`[OrderPage] Validation failed: quantity ${qty} is less than 1.`);
      Toast.show({ type: "error", text1: "Quantity must be at least 1" });
      return;
    }

    if (toBeDelivered && !place) {
      console.warn("[OrderPage] Validation failed: delivery selected but no place chosen.");
      Toast.show({ type: "error", text1: "Please select a delivery place" });
      return;
    }

    setLoading(true);

    try {
      console.log(`[OrderPage] Checking token for: "${foodName.toLowerCase()}"`);
      const tokenRef = doc(db, "token", foodName.toLowerCase());
      const tokenSnap = await getDoc(tokenRef);

      if (tokenSnap.exists()) {
        const remaining = tokenSnap.data().remainingToken;
        console.log(`[OrderPage] Token doc found. Remaining tokens: ${remaining}`);

        if (remaining === 0) {
          console.warn(`[OrderPage] Item "${foodName}" is sold out.`);
          Toast.show({ type: "error", text1: "Item finished for today" });
          setLoading(false);
          return;
        }

        if (qty > remaining) {
          console.warn(`[OrderPage] Requested qty (${qty}) exceeds remaining tokens (${remaining}).`);
          Toast.show({
            type: "error",
            text1: `Only ${remaining} left`,
            text2: "Please reduce your quantity",
          });
          setLoading(false);
          return;
        }

        console.log(`[OrderPage] Token check passed. qty: ${qty}, remaining: ${remaining}`);
      } else {
        console.log(`[OrderPage] No token doc for "${itemId}" — no limit enforced.`);
      }

      console.log(`[OrderPage] All validations passed. Navigating to PaymentScreen. Total: ₹${totalPrice}`);

      router.push({
        pathname: "/is_signed_in/student_staff/PaymentScreen",
        params: {
          itemId,
          foodName,
          quantity:     String(qty),
          pricePerItem: String(price),
          amount:       String(totalPrice),
          place:        toBeDelivered ? place : "",
          toBeDelivered: toBeDelivered ? "yes" : "no",
        },
      });

    } catch (err) {
      console.error("[OrderPage] ERROR during placeOrder:", err);
      Toast.show({ type: "error", text1: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 120 }}>

        <Text style={styles.title}>Food Order</Text>

        <Text style={styles.label}>Logged in as</Text>
        <View style={styles.userBox}>
          <Ionicons name="person-outline" size={18} color={ORANGE} />
          <Text style={styles.usernameText}>{username}</Text>
        </View>

        <Text style={styles.label}>Food Name</Text>
        <View style={[styles.input, { backgroundColor: "#F3F3F3" }]}>
          <Text style={{ color: "#333" }}>{foodName}</Text>
        </View>

        <Text style={styles.label}>Quantity</Text>
        <TextInput
          value={quantity}
          onChangeText={(val) => {
            if (/^\d*$/.test(val)) {
              console.log(`[OrderPage] Quantity changed to: ${val}`);
              setQuantity(val);
            }
          }}
          keyboardType="number-pad"
          placeholder="Enter quantity"
          style={styles.input}
        />

        {totalPrice > 0 && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceTitle}>TOTAL AMOUNT</Text>
            <Text style={styles.priceText}>₹ {totalPrice}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => {
            const next = !toBeDelivered;
            console.log(`[OrderPage] Delivery toggled to: ${next}`);
            setToBeDelivered(next);
            setPlace("");
          }}
        >
          <Ionicons name={toBeDelivered ? "checkbox" : "square-outline"} size={22} color={ORANGE} />
          <Text style={styles.toggleText}>To be delivered</Text>
        </TouchableOpacity>

        {toBeDelivered && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.label}>Delivery Place</Text>

            <TouchableOpacity
              style={[styles.input, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}
              onPress={() => {
                console.log(`[OrderPage] Dropdown toggled. Now: ${!showDropdown ? "open" : "closed"}`);
                setShowDropdown(!showDropdown);
              }}
            >
              <Text style={{ color: place ? "#000" : "#999" }}>{place || "Select place"}</Text>
              <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={20} color={ORANGE} />
            </TouchableOpacity>

            {showDropdown && (
              <View style={styles.dropdown}>
                <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
                  {PLACES.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={styles.dropdownItem}
                      onPress={() => {
                        console.log(`[OrderPage] Delivery place selected: ${p}`);
                        setPlace(p);
                        setShowDropdown(false);
                      }}
                    >
                      <Text style={{ color: place === p ? ORANGE : "#333" }}>{p}</Text>
                      {place === p && <Ionicons name="checkmark" size={16} color={ORANGE} />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={placeOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="cart-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>PLACE ORDER</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>

      <View style={styles.navbar}>
        <NavItem icon="home" label="Home" onPress={() => router.push("/is_signed_in/student_staff/HomeScreen")} />
        <NavItem icon="restaurant-outline" label="Menu" onPress={() => router.push("/is_signed_in/student_staff/ShowMenu")} />
        <NavItem icon="receipt-outline" label="Orders" active />
        <NavItem icon="person-outline" label="Profile" onPress={() => router.push("/is_signed_in/student_staff/ProfileScreen")} />
      </View>
    </SafeAreaView>
  );
}

function NavItem({ icon, label, onPress, active }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Ionicons name={icon} size={24} color={active ? ORANGE : INACTIVE} />
      <Text style={[styles.navText, active && { color: ORANGE, fontWeight: "bold" }]}>{label}</Text>
    </TouchableOpacity>
  );
}