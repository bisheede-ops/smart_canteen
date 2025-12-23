import React, { useState } from "react";
import { Link } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  
    const [username, setUsername] = useState("");
    const handleUsernameChange = (text) => {
    const upperText = text.toUpperCase(); 
    setUsername(upperText);
    }

  const passwordsNotMatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Create Account </Text>
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
          <TouchableOpacity
            onPress={() => setHidePassword(!hidePassword)}
          >
            <Ionicons
              name={hidePassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="grey"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="shield-checkmark-outline" size={20} color="grey" />
          <TextInput
            placeholder="Confirm Password"
            style={styles.input}
            secureTextEntry={hideConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            onPress={() =>
              setHideConfirmPassword(!hideConfirmPassword)
            }
          >
            <Ionicons
              name={
                hideConfirmPassword ? "eye-off-outline" : "eye-outline" }
              size={20}
              color="grey"
            />
          </TouchableOpacity>
        </View>

        {passwordsNotMatch && (
          <Text style={styles.error}>
            Passwords do not match
          </Text>
        )}

        <TouchableOpacity style={[ styles.button, passwordsNotMatch && { opacity: 0.6 }, ]}  disabled={passwordsNotMatch} >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?
          </Text>
          <Link href="/is_signed_out/LoginScreen">
            <Text style={styles.login}> Login</Text>
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "orange",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
  },
  subtitle: {
    fontSize: 16,
    color: "black",
    marginTop: 5,
  },
  form: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    flex: 1,
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
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "orange",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginBottom: 10,
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "black",
  },
  login: {
    color: "orange",
    fontWeight: "bold",
  },
});
