import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, setDoc, getDoc } from "firebase/firestore";
import {
  DeliveryStyles as styles,
  ORANGE_COLOR as ORANGE,
} from "@/assets/src/styles/DeliveryStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, usePathname } from "expo-router";
import { db } from "../../../firebaseConfig";

const INACTIVE = "#888";

export default function AddDeliveryAgent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  const handleSubmit = async () => {
    if (!username || !password) {
      Alert.alert("Missing details", "Please fill all fields");
      return;
    }

    try {
      const docRef = doc(db, "delivery_agents", username.toUpperCase());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        Alert.alert("Already exists", "Delivery agent already added");
        return;
      }

      await setDoc(docRef, {
        password,
        status: "active",
        createdAt: new Date(),
      });

      Alert.alert("Success", "Delivery agent added successfully");
      setUsername("");
      setPassword("");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <View style={styles.screen}>
      {/* MAIN CONTENT */}
      <View style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <Ionicons name="bicycle-outline" size={42} color="#fff" />
          <Text style={styles.headerTitle}>Delivery Agent Setup</Text>
          <Text style={styles.headerSubtitle}>
            Create and manage delivery staff access
          </Text>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          {/* USERNAME */}
          <Text style={styles.label}>AGENT USERNAME</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={INACTIVE} />
            <TextInput
              placeholder="AGENT001"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="characters"
            />
          </View>

          {/* PASSWORD */}
          <Text style={styles.label}>PASSWORD</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={INACTIVE} />
            <TextInput
              placeholder="Enter secure password"
              style={styles.input}
              secureTextEntry={hidePassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
              <Ionicons
                name={hidePassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={ORANGE}
              />
            </TouchableOpacity>
          </View>

          {/* BUTTON */}
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.9}
            onPress={handleSubmit}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>ADD DELIVERY AGENT</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BOTTOM NAVBAR */}
      <SafeAreaView>
        <View style={styles.navbar}>
          <NavItem
            icon="home-outline"
            label="Home"
            active={pathname === "/is_signed_in/Admin/HomeScreen"}
            onPress={() =>
              router.push("/is_signed_in/Admin/HomeScreen")
            }
          />

          <NavItem
            icon="bicycle-outline"
            label="Delivery"
            active={pathname === "/is_signed_in/Admin/AddDeliveryAgent"}

            
          />

          <NavItem
            icon="receipt-outline"
            label="Orders"
            active={pathname === "/is_signed_in/Admin/orders"}
            onPress={() =>
              router.push("/is_signed_in/Admin/DeliveryAssign")
            }
          />

          <NavItem
            icon="person-outline"
            label="Profile"
            active={pathname === "/is_signed_in/Admin/ProfileScreen"}
            onPress={() =>
              router.push("/is_signed_in/Admin/ProfileScreen")
            }
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function NavItem({ icon, label, onPress, active }) {
  const color = active ? "#FF9800" : INACTIVE;

  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={24} color={color} />
      <Text
        style={[
          styles.navText,
          { color },
          active && { fontWeight: "bold" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
