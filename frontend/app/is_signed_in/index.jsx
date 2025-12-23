import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{color:"orange",fontSize:45,}}>Smart Canteen</Text>
      <Link href={"/is_signed_out/LoginScreen"}>sign in</Link>
      <Link href={"/is_signed_out/signin"}>sign in given design</Link>

    </View>
  );
}