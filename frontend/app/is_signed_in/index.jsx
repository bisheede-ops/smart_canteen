import { Text, View , Image} from "react-native";
import { Link, useRouter } from "expo-router";
import { useEffect } from "react";
import { auth } from "../../firebaseConfig";

export default function Index() {
  const router = useRouter();

  console.log("Firebase App Name:", auth.app.name);

  useEffect(() => {

    const timer = setTimeout(() => {
      router.push("/is_signed_out/LoginScreen");
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
    
      <Image
        source={require("../../assets/images/logo.png")}
        style={{ width: 150, height: 150, marginBottom: 20,borderRadius:25, }}
        accessibilityLabel="Smart Canteen Logo"
      />
      <Text style={{ color: "orange", fontSize: 45 }}>
        Smart Canteen
      </Text>
    </View>
  );
}
