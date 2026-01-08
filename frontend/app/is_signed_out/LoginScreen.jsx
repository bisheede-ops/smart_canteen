import { useState } from "react";
import { Link, useRouter } from "expo-router";
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";


export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleUsernameChange = (text) => setUsername(text.trim().toUpperCase());

  const handleLogin = async () => {
    if (!username || !password) {
      Toast.show({ type: "error", text1: "Enter username & password" });
      return;
    }

    let role = "User";

    if (/^(L)?IDK\d{2}[A-Z]{2,3}\d{2,3}$/.test(username)) {
      role = "Student";
    } else if ( /^(?:O|T)\d{4,6}$/i.test(username) ||  /^KTU-F\d{3,5}$/i.test(username)) {
      role = "Staff";
    } else if (username === "ADMIN") {
      role = "Admin";
    } else if (/^AGENT\d{3}$/.test(username)) {
      role = "Delivery";
    }

    const email = `${username}@smartcanteen.com`;

    try {
      // Delivery agents login
      
      if (role === "Delivery") {
        // First login via Firebase Auth
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Then fetch delivery agent record from Firestore
        const agentRef = doc(db, "delivery_agents", user.uid);
        const agentSnap = await getDoc(agentRef);

        if (!agentSnap.exists()) {
          Toast.show({
            type: "error",
            text1: "Delivery agent record not found",
          });
          return;
        }
        const agentData = agentSnap.data();
        if (agentData.status !== "active") {
          Toast.show({
            type: "error",
            text1: "Delivery agent inactive",
            visibilityTime: 3500,
          });
          return;
        }

        Toast.show({
          type: "success",
          text1: `Login Successful`,
          text2: `Welcome ${agentData.name}`,
          visibilityTime: 1000,
          
        });
        console.log("Login successful");
        console.log("Username:", username);
        console.log("Role:", role);
        console.log("UID:", user.uid);
        await delay(1000);

        router.replace({
          pathname: "/is_signed_in/Delivery/HomeScreen",
          params: { agentUid: user.uid },
        });

        return;
      }

      

      await signInWithEmailAndPassword(auth, email, password);

      Toast.show({ 
        type: "success", 
        text1: `Login Successful`,
        text2: `Welcome ${role}`,
        visibilityTime: 1000, });

        await delay(1000);

      if (role === "Admin") router.replace("/is_signed_in/Admin/HomeScreen");
      else if (role === "Staff")
        router.replace("/is_signed_in/student_staff/HomeScreen");
      else if (role === "Student")
        router.replace("/is_signed_in/student_staff/HomeScreen");
      console.log("\nLogin successful");
      console.log("Username:", username);
      console.log("Role:", role);
    }
    
    catch (error) {
      console.log("Login error:", error);
      let message = "Login failed";
      if (error.code === "auth/user-not-found") message = "Account not found";
      else if (error.code === "auth/wrong-password")
        message = "Incorrect password";
      else if (error.code === "auth/invalid-email")
        message = "Invalid username format";

      Toast.show({ type: "error", text1: "Login Error", text2: message });
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
          <Link href="/is_signed_out/SignupScreen">
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
    marginTop: 10,
  },
  buttonText: { color: "black", fontSize: 18, fontWeight: "bold" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: "black" },
  signup: { color: "orange", fontWeight: "bold" },
});

