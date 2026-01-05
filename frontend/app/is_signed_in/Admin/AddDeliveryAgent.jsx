import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import Toast from "react-native-toast-message";

import { auth, db } from "../../../firebaseConfig";
import { SignupStyles as styles } from "@/assets/src/styles/SignupStyles";

export default function AddDeliveryAgent() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);

  const handleAddAgent = async () => {
    if (!name || !username || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Please fill all fields",
        position: "top",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords do not match",
        position: "top",
      });
      return;
    }

    const email = `${username}@smartcanteen.com`;

    try {
      // 🔐 Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // 📦 Store delivery agent data
      await setDoc(doc(db, "delivery_agents", user.uid), {
        total_order:"",
        completed_order:"",
        name,
        username,
        email,
        status: "active",
        createdAt: serverTimestamp(),
      });

      Toast.show({
        type: "success",
        text1: "Delivery Agent Added",
        text2: username,
        position: "top",
      });

      setName("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Failed to add agent",
        text2: error.message,
        position: "top",
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Add Delivery Agent</Text>
        <Text style={styles.subtitle}>
          Create account for delivery agent
        </Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* NAME */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="grey" />
          <TextInput
            placeholder="Full Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* USERNAME */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="grey" />
          <TextInput
            placeholder="Agent Username"
            style={styles.input}
            value={username}
            onChangeText={(text) => setUsername(text.toUpperCase())}
            autoCapitalize="characters"
          />
        </View>

        {/* PASSWORD */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="grey" />
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry={hidePassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
            <Ionicons
              name={hidePassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="grey"
            />
          </TouchableOpacity>
        </View>

        {/* CONFIRM PASSWORD */}
        <View style={styles.inputContainer}>
          <Ionicons name="shield-checkmark-outline" size={20} color="grey" />
          <TextInput
            placeholder="Confirm Password"
            style={styles.input}
            secureTextEntry={hideConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setHideConfirmPassword(!hideConfirmPassword)}
          >
            <Ionicons
              name={hideConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="grey"
            />
          </TouchableOpacity>
        </View>

        {confirmPassword && password !== confirmPassword && (
          <Text style={styles.error}>Passwords do not match</Text>
        )}

        {/* BUTTON */}
        <TouchableOpacity
          style={[
            styles.button,
            confirmPassword !== password && { opacity: 0.6 },
          ]}
          disabled={confirmPassword !== password}
          onPress={handleAddAgent}
        >
          <Text style={styles.buttonText}>Add Agent</Text>
        </TouchableOpacity>
      </ScrollView>

      <Toast />
    </View>
  );
}
