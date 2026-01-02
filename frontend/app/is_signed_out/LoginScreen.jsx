import { SigninStyles as styles } from "../../assets/src/styles/SigninStyles";

import React, { useState } from "react";
import { Link } from "expo-router";
import Toast from 'react-native-toast-message';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../../firebaseConfig";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const router = useRouter();


  const handleUsernameChange = (text) => setUsername(text.toUpperCase());


 
const handleLogin = () => {
  if (!username || !password) {
    alert("Please enter username and password");
    return;
  }

  const email = username + "@smartcanteen.com";

  let role = "";
  if (/^(L)?IDK\d{2}[A-Z]{2,3}\d{2,3}$/.test(username)) {
    role = "student";
  } else if (/^KTU-F\d{3,5}$/.test(username)) {
    role = "staff";
  } else if (username.toUpperCase() === "ADMIN") {
    role = "admin";
  } else if (/^[A-Za-z]+$/.test(username)) {
    role = "delivery";
  }

signInWithEmailAndPassword(auth, email, password)
  .then(() => {
    Toast.show({
      type: 'success',
      text1: `Logged in as ${username}`,
      text2: `Role: ${role}`,
      position: 'top',
      visibilityTime: 3000,
    });
     setTimeout(() => {
        if (role === "student" || role === "staff") {
          router.push("/is_signed_in/student_staff/HomeScreen");
        } else if (role === "admin") {
          router.push("/is_signed_in/Admin/HomeScreen");
        } else if (role === "delivery") {
          router.push("/is_signed_in/delivery/HomeScreen");
        } else {
          Toast.show({
            type: "error",
            text1: "Invalid role",
            text2: "Please contact admin",
          });
        }
      }, 1000);
  })
  .catch((error) => {
    Toast.show({
      type: 'error',
      text1: 'Login failed',
      text2: error.message,
      position: 'top',
      visibilityTime: 3000,
    });
  });

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
          <Ionicons name="person-outline" size={20} color="grey" />
          <TextInput
            placeholder="Username"
            style={styles.input}
            value={username}
            onChangeText={handleUsernameChange}
            autoCapitalize="characters"
            autoCorrect={false}
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

        
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don’t have an account?</Text>
          <Link href={"/is_signed_out/SignupScreen"}>
            <Text style={styles.signup}> Sign Up</Text>
          </Link>
        </View>
      </View>
      <Toast />
    </View>
  );
}



