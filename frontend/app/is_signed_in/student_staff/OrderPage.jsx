import React, { useState, useEffect } from "react";
import { validateFoodName,validateNumber,validateName } from "../../../utils/validation";
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
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { db, auth } from "../../../firebaseConfig";
import { isLoading } from "expo-font";

import {styles,ORANGE,INACTIVE} from "@/assets/src/styles/OrderPageStyles.js"

export default function OrderPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [phoneno, setPhoneno] = useState("");
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [place, setPlace] = useState("");

  const [loading,setLoading]=useState(false);

  const [toBeDelivered, setToBeDelivered] = useState(false);


  useEffect(() => {
    const fetchUsername = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const userRef = doc(db, "users", uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          setUsername(snap.data().name || "unknown");
          setPhoneno(snap.data().phone || "unknown");
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsername();
  }, []);

  const placeOrder = async () => {
    if(loading)return;
    setLoading(true);
    if (!username || !foodName || !quantity) {
      Toast.show({
        type: "error",
        text1: "Missing details",
        text2: "Please fill all required fields",
        position: "top",
      });
      setLoading(false);
      return;
    }

    if (toBeDelivered && !place) {
      Toast.show({
        type: "error",
        text1: "Delivery place required",
        position: "top",
      });
      setLoading(false);
      return;
    }

    const nameError = validateName(place);
    if (nameError) {
      Alert.alert("Error",nameError);
      setLoading(false);
      return;
    }

    const foodnameError = validateFoodName(foodName);
    if (foodnameError) {
      Alert.alert("Error",foodnameError);
      setLoading(false);
      return;
    }

    const numberError = validateNumber(quantity);
    if (numberError) {
      Alert.alert("Error",`Price `+numberError);
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "food_ordered"), {
        username,
        foodName,
        phoneno,
        quantity: Number(quantity),
        place: toBeDelivered ? place : "", 
        toBeDelivered,
        deliveryBy: "",
        createdAt: serverTimestamp(),
      });

      Toast.show({
        type: "success",
        text1: "Order Placed",
        visibilityTime: 2000,
        position: "top",
      });

      setFoodName("");
      setQuantity("");
      setPlace("");
      setToBeDelivered(false);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Order Failed",
        position: "top",
      });
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Food Order</Text>

        <Text style={styles.label}>Logged in as</Text>
        <View style={styles.userBox}>
          <Ionicons name="person-outline" size={18} color={ORANGE} />
          <Text style={styles.usernameText}>{username || "Loading..."}</Text>
        </View>

        <Input label="Food Name" value={foodName} onChange={setFoodName} />
        <Input
          label="Quantity"
          value={quantity}
          onChange={setQuantity}
          keyboard="number-pad"
        />

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
          <Input label="Delivery Place" value={place} onChange={setPlace} />
        )}

        <TouchableOpacity style={styles.button} onPress={placeOrder}>
          <Ionicons name="cart-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>{loading ? "ORDERING..." : "PLACE ORDER"}</Text>
        </TouchableOpacity>
      </View>

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
          onPress={() =>
            router.push("/is_signed_in/student_staff/ProfileScreen")
          }
        />
      </View>
    </SafeAreaView>
  );
}


function Input({ label, value, onChange, keyboard }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        style={styles.input}
      />
    </>
  );
}

function NavItem({ icon, label, onPress, active }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Ionicons name={icon} size={24} color={active ? ORANGE : INACTIVE} />
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


