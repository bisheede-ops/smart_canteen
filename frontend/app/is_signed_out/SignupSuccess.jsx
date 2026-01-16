import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { signupSuccessStyles as styles } from "@/assets/src/styles/SignupSuccessStyles";

export default function SignupSuccess() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons
        name="checkmark-circle"
        size={100}
        color="#ff8c00"
      />

      <Text style={styles.title}>Signup Successful 🎉</Text>
      <Text style={styles.subtitle}>
        Your account has been created successfully.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/is_signed_out/LoginScreen")}
      >
        <Text style={styles.buttonText}>Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
}
