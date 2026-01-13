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

import {
  validateUsername,
  validatePassword,
  validateName,
} from "../../utils/validation";

export default function SignupScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState(""); 
  const [role, setRole] = useState("student");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (loading) return;
    setLoading(true);
    console.log("Sign up clicked");
    if (!name || !username || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Please fill all fields",
        position: "top",
      });
      setLoading(false);
      return;
    }

    const nameError = validateName(name);
    if (nameError) {
      Toast.show({ type: "error", text1: nameError });
      setLoading(false);
      return;
    }

    const usernameError = validateUsername(username);
    if (usernameError) {
      Toast.show({ type: "error", text1: usernameError });
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      Toast.show({ type: "error", text1: passwordError });
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

    const email = `${username}@smartcanteen.com`;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        name,
        phone: username,
        email,
        role,
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
           console.log("Signed up");
      }, 1000);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Signup failed",
        text2: error.message,
        position: "top",
      });
      setLoading(false);
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
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="grey" />
          <TextInput
            placeholder="Full Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color="grey" />
          <TextInput
            placeholder="Phone Number (10 digits)"
            style={styles.input}
            value={username}
            onChangeText={(text) =>
              setUsername(text.replace(/\D/g, ""))
            }
            keyboardType="number-pad"
            maxLength={10}
          />
        </View>

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
