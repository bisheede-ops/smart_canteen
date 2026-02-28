
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../../../firebaseConfig";

export default function PaymentScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const params = useLocalSearchParams();
  const router = useRouter();

  const amount = Number(params?.amount || 0);
  const foodName = params?.foodName || "";
  const quantity = params?.quantity || "";
  const place = params?.place || "";
  const toBeDelivered = params?.toBeDelivered === "yes";

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("PaymentScreen mounted, amount:", amount);

    if (!amount) {
      console.log("Invalid amount");
      Toast.show({ type: "error", text1: "Invalid amount" });
    }
  }, [amount]);

  async function handlePayment() {
    if (loading) {
      console.log("Payment already in progress");
      return;
    }

    setLoading(true);
    console.log("Payment button clicked");

    try {
      console.log("Requesting payment intent...");

      const response = await fetch("http://192.168.1.101:3000/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount * 100 })
      });

      console.log("Backend response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      const { clientSecret } = data;
      if (!clientSecret) {
        console.log("No clientSecret received");
        Toast.show({ type: "error", text1: "Payment initialization failed" });
        return;
      }

      console.log("Initializing payment sheet");
      await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Smart Canteen"
      });

      console.log("Presenting payment sheet");
      const { error } = await presentPaymentSheet();

      if (error) {
        console.log("Payment failed", error);
        Toast.show({ type: "error", text1: "Payment failed" });
      } else {
        console.log("Payment success — storing record");

        await addDoc(collection(db, "food_ordered"), {
          userId: auth.currentUser.uid,
          foodName,
          quantity: Number(quantity),
          totalPrice: amount,
          place,
          toBeDelivered,
          paymentStatus: "paid",
          createdAt: new Date()
        });

        console.log("Order details saved in Firestore");

        await addDoc(collection(db, "payments"), {
          userId: auth.currentUser.uid,
          foodName,
          quantity: Number(quantity),
          totalPrice: amount,
          place,
          toBeDelivered,
          paymentStatus: "paid",
          createdAt: new Date()
        });

        console.log("Payment record saved in Firestore");

        router.replace("/is_signed_in/student_staff/OrderSuccess");
      }
    } catch (e) {
      console.error("Payment error:", e);
      Toast.show({ type: "error", text1: "Payment error" });
    } finally {
      setLoading(false);
      console.log("Payment process finished");
    }
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: "#FFF4EC",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 20,
          elevation: 2,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
          Order Confirmation
        </Text>

        <Text style={{ fontSize: 15, marginBottom: 6 }}>
          Food: {foodName || "N/A"}
        </Text>

        <Text style={{ fontSize: 15, marginBottom: 6 }}>
          Quantity: {quantity || "0"}
        </Text>

        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 16 }}>
          Total Amount: ₹{amount}
        </Text>

        <TouchableOpacity
          onPress={handlePayment}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#ccc" : "#f97316",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Pay Now</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            console.log("Payment canceled, going back");
            router.back();
          }}
          style={{
            backgroundColor: "#eee",
            paddingVertical: 12,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#333", fontWeight: "600" }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}