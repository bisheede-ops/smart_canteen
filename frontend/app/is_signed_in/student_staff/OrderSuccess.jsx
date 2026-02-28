import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";

export default function OrderSuccess() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/is_signed_in/student_staff/HomeScreen");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF4EC" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", color: "#f97316" }}>
        Order Success 🎉
      </Text>
      <Text>Your order has been placed successfully.</Text>
    </View>
  );
}