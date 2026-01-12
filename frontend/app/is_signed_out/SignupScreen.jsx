import React, { useState } from "react";
import { Link, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

import { auth, db } from "../../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import Toast from "react-native-toast-message";

import { SignupStyles as styles } from "@/assets/src/styles/SignupStyles";

export default function SignupScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState(""); // phone number
  const [role, setRole] = useState("student"); // 👈 NEW
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (loading) return;
    setLoading(true);
    console.log("Sign up clicked");
    // basic empty checks
    if (!name || !username || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Please fill all fields",
        position: "top",
      });
      setLoading(false);
      return;
    }

    // phone number validation (10 digits only)
    if (!/^\d{10}$/.test(username)) {
      Toast.show({
        type: "error",
        text1: "Invalid phone number",
        text2: "Username must be a 10-digit number",
        position: "top",
      });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords do not match",
        position: "top",
      });
      setLoading(false);
      return;
    }

    // phone → email
    const email = `${username}@smartcanteen.com`;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // store user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        phone: username,
        email,
        role, // 👈 stored from dropdown
        createdAt: serverTimestamp(),
      });

      Toast.show({
        type: "success",
        text1: "Account created",
        text2: `Role: ${role}`,
        position: "top",
      });

      setTimeout(() => {
        router.push("/is_signed_out/LoginScreen");
      }, 2000);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Signup failed",
        text2: error.message,
        position: "top",
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* Name */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="grey" />
          <TextInput
            placeholder="Full Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Phone Number (Username) */}
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color="grey" />
          <TextInput
            placeholder="Phone Number (10 digits)"
            style={styles.input}
            value={username}
            onChangeText={(text) =>
              setUsername(text.replace(/\D/g, "")) // only numbers
            }
            keyboardType="number-pad"
            maxLength={10}
          />
        </View>

        {/* Role Dropdown */}
        <View style={styles.inputContainer}>
          <Ionicons name="people-outline" size={20} color="grey" />
          <Picker
            selectedValue={role}
            onValueChange={(value) => setRole(value)}
            style={{ flex: 1 }}
          >
            <Picker.Item label="Student" value="student" />
            <Picker.Item label="Teacher" value="teacher" />
            <Picker.Item label="Staff" value="staff" />
          </Picker>
        </View>

        {/* Password */}
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

        {/* Confirm Password */}
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
              name={
                hideConfirmPassword ? "eye-off-outline" : "eye-outline"
              }
              size={20}
              color="grey"
            />
          </TouchableOpacity>
        </View>

        {confirmPassword && password !== confirmPassword && (
          <Text style={styles.error}>Passwords do not match</Text>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            confirmPassword !== password && { opacity: 0.6 },
          ]}
          disabled={confirmPassword !== password}
          onPress={handleSignUp}
        >
          <Text style={styles.buttonText}>
            {loading ? "Signing up..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/is_signed_out/LoginScreen">
            <Text style={styles.login}> Login</Text>
          </Link>
        </View>
      </ScrollView>

      <Toast />
    </View>
  );
}
