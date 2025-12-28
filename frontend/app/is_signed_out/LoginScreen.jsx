
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
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);


  const handleUsernameChange = (text) => setUsername(text.toUpperCase());


 
const handleLogin = () => {
  if (!username || !password) {
    alert("Please enter username and password");
    return;
  }

  const email = username + "@smartcanteen.com";

  let role = "";
  if (/^(L)?IDK\d{2}[A-Z]{2,3}\d{2,3}$/.test(username)) {
    role = "Student";
  } else if (/^KTU-F\d{3,5}$/.test(username)) {
    role = "Staff";
  } else if (username.toUpperCase() === "ADMIN") {
    role = "Admin";
  } else if (/^[A-Za-z]+$/.test(username)) {
    role = "Delivery";
  }
  // signInWithEmailAndPassword(auth, email, password)
  //   .then((userCredential) => {
  //     alert(`Logged in as ${username}, Role: ${role}`);
  //   })
  //   .catch((error) => alert(error.message));

signInWithEmailAndPassword(auth, email, password)
  .then(() => {
    Toast.show({
      type: 'success',
      text1: `Logged in as ${username}`,
      text2: `Role: ${role}`,
      position: 'top',
      visibilityTime: 3000,
    });
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


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "orange" },
  header: { flex: 1, justifyContent: "center", paddingHorizontal: 30 },
  title: { fontSize: 30, fontWeight: "bold", color: "black" },
  subtitle: { fontSize: 16, color: "black", marginTop: 5 },
  form: {
    flex: 2,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  button: {
    backgroundColor: "orange",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "black", fontSize: 18, fontWeight: "bold" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: "black" },
  signup: { color: "orange", fontWeight: "bold" },
});
