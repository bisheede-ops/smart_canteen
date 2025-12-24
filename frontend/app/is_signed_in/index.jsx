import { Text, View } from "react-native";
import { Link } from "expo-router";
import { auth } from "../../firebaseConfig"; // ✅ FIXED PATH

export default function Index() {

  console.log("Firebase App Name:", auth.app.name);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "orange", fontSize: 45 }}>
        Smart Canteen
      </Text>

      <Link href={"/is_signed_out/LoginScreen"}>sign in</Link>
    </View>
  );
}

