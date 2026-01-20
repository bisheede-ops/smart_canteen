import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

import {
  validateUsername,
  validatePassword,
} from "../../utils/validation";

import { SigninStyles as styles } from "@/assets/src/styles/SigninStyles";

export default function LoginScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleUsernameChange = (text) =>
    setUsername(text.replace(/\D/g, ""));

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    console.log("\nlog in clicked");


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

    const email = `${username}@smartcanteen.com`;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredential.user.uid;
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        Toast.show({
          type: "error",
          text1: "User profile not found",
        });
        return;
      }

      const { role } = userSnap.data();

      // Toast.show({
      //   type: "success",
      //   text1: "Login Successful",
      // });
      setTimeout(() => {
        console.log("Logged in");
        if (role === "admin") {
          router.replace("/is_signed_in/Admin/HomeScreen");
        } else if (role === "delivery_agent") {
          router.replace("/is_signed_in/Delivery/HomeScreen");
        } else if (
          role === "student" ||
          role === "staff" ||
          role === "teacher"
        ) {
          router.replace("/is_signed_in/student_staff/HomeScreen");
        } else {
          Toast.show({
            type: "error",
            text1: "Invalid role assigned",
          });
        }
        
      }, 400);
    } catch (error) {
      console.log("Login error:", error);

      let message = "Login failed";
      if (error.code === "auth/user-not-found")
        message = "Account not found";
      else if (error.code === "auth/wrong-password")
        message = "Incorrect password";

      Toast.show({
        type: "error",
        text1: "Login Error",
        text2: message,
      });
      setLoading(false);
    } 
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to your account</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color="grey" />
          <TextInput
            placeholder="Phone Number"
            style={styles.input}
            value={username}
            onChangeText={handleUsernameChange}
            keyboardType="number-pad"
            maxLength={10}
          />
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

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don’t have an account?</Text>
          <Link href="/is_signed_out/SignupScreen">
            <Text style={styles.signup}> Sign Up</Text>
          </Link>
        </View>
      </View>

      <Toast />
    </View>
  );
}

