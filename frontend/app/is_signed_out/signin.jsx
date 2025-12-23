import React, { useState } from "react";
import {Link} from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const handleUsernameChange = (text) => {
  const upperText = text.toUpperCase(); 
  setUsername(upperText);
};
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.orangeShape} />
        <View style={styles.innercontainer}>

            <View style={styles.header}>
                <Text style={styles.title}>Login</Text>
                <View style={styles.underline} />
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

                <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                <Text style={styles.footerText}>Don’t have an account?</Text>
                <TouchableOpacity>
                    <Link href={"/is_signed_out/signup"}><Text style={styles.signup}>Sign Up</Text></Link>
                </TouchableOpacity>
                </View>
            </View>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems:"center",
    justifyContent:"flex-end",    
  },
innercontainer: {
    flex: 1,
    alignItems:"center",
    justifyContent:"center",  
    alignContent:"center",  
    width:"85%",
    maxHeight:"50%",
  },
  header: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "black",
    
  },
  form: {
    flex: 2,
    backgroundColor: "#eeba4022",
    borderRadius: 30,
    padding: 30,
    marginBottom:20,


  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    width:"90%",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  forgot: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    color: "orange",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "orange",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    alignSelf:"center",
    width:180,
    
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "black",
  },
  signup: {
    color: "orange",
    fontWeight: "bold",
  },
  underline: {
    width: 100,
    height: 5,
    backgroundColor: "#ff9800",
    marginTop: 6,
    marginBottom: 30,
  },
orangeShape: {
    position: "absolute",
    top: -80,
    left: -260,
    width: 500,
    height: 500,
    backgroundColor: "#ff9800",
    transform: [{ rotate: "45deg" }],
},
});
