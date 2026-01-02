import React, { useState } from "react";
import { Link, useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import Toast from 'react-native-toast-message';

import { SignupStyles as styles} from "@/assets/src/styles/SignupStyles";

export default function SignupScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);

  const handleSignUp = async () => {
    if (!name || !username || !password || !confirmPassword) {
      Toast.show({ type: 'error', text1: "Please fill all fields", position: 'top', visibilityTime: 3000 });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: "Passwords do not match", position: 'top', visibilityTime: 3000 });
      return;
    }

    const email = username + "@smartcanteen.com";

    let role = "";
    if (/^(L)?IDK\d{2}[A-Z]{2,3}\d{2,3}$/.test(username)) role = "student";
    else if (/^KTU-F\d{3,5}$/.test(username)) role = "staff";
    else {
      Toast.show({ type: 'error', text1: "Invalid username format", text2: "Only student or staff can sign up", position: 'top', visibilityTime: 3000 });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), { name, username, email, role });


      Toast.show({ type: 'success', text1: `Account created`, text2: `Role: ${role}`, position: 'top', visibilityTime: 3000 });

      setTimeout(() => {
        router.push("/is_signed_out/LoginScreen");
      }, 2000);

    } catch (error) {
      Toast.show({ type: 'error', text1: "Signup failed", text2: error.message, position: 'top', visibilityTime: 3000 });
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
          <TextInput placeholder="Full Name" style={styles.input} value={name} onChangeText={setName} />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="grey" />
          <TextInput placeholder="Username" style={styles.input} value={username} onChangeText={(text) => setUsername(text.toUpperCase())} autoCapitalize="characters" />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="grey" />
          <TextInput placeholder="Password" style={styles.input} secureTextEntry={hidePassword} value={password} onChangeText={setPassword} />
          <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
            <Ionicons name={hidePassword ? "eye-off-outline" : "eye-outline"} size={20} color="grey" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="shield-checkmark-outline" size={20} color="grey" />
          <TextInput placeholder="Confirm Password" style={styles.input} secureTextEntry={hideConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} />
          <TouchableOpacity onPress={() => setHideConfirmPassword(!hideConfirmPassword)}>
            <Ionicons name={hideConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="grey" />
          </TouchableOpacity>
        </View>

        {confirmPassword && password !== confirmPassword && <Text style={styles.error}>Passwords do not match</Text>}

        <TouchableOpacity style={[styles.button, confirmPassword !== password && { opacity: 0.6 }]} disabled={confirmPassword !== password} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
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

