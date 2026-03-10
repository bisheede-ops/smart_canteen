
import React, { useEffect, useRef } from "react";
import {
  View, Text, Animated,
  TouchableOpacity, StyleSheet, ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const ORANGE = "#f97316";

export default function OrderSuccess() {
  const router = useRouter();
  const { orderNumber, orderId, foodName, quantity, amount, toBeDelivered, place } =
    useLocalSearchParams();

  const isDelivery = toBeDelivered === "yes";

  const scaleAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(40)).current;
  const checkAnim  = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log(`[OrderSuccess] Screen mounted. orderNumber: ${orderNumber}, orderId: ${orderId}`);
    console.log(`[OrderSuccess] Details — foodName: ${foodName}, quantity: ${quantity}, amount: ₹${amount}, delivery: ${isDelivery}, place: "${place}"`);

    Animated.loop(
      Animated.sequence([
        Animated.timing(rippleAnim, { toValue: 1.7, duration: 900, useNativeDriver: true }),
        Animated.timing(rippleAnim, { toValue: 1,   duration: 900, useNativeDriver: true }),
      ])
    ).start();
    console.log("[OrderSuccess] Ripple animation started.");

    Animated.spring(scaleAnim, {
      toValue: 1, tension: 60, friction: 6, useNativeDriver: true,
    }).start();
    console.log("[OrderSuccess] Check circle scale animation started.");

    Animated.timing(checkAnim, {
      toValue: 1, duration: 400, delay: 300, useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, delay: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, delay: 400, useNativeDriver: true }),
    ]).start();
    console.log("[OrderSuccess] Content fade + slide animation started.");
  }, []);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} bounces={false}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* Check Icon */}
      <View style={styles.iconWrapper}>
        <Animated.View style={[styles.ripple, { transform: [{ scale: rippleAnim }] }]} />
        <Animated.View style={[styles.checkCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Animated.Text style={[styles.checkMark, { opacity: checkAnim }]}>✓</Animated.Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.heading}>Order Placed!</Text>
        <Text style={styles.subheading}>Your food is being prepared </Text>

        {/* Order Info Card */}
        <View style={styles.card}>

          {orderNumber ? (
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}><Ionicons name="receipt-outline" size={15} color={ORANGE} /></View>
              <Text style={styles.infoLabel}>Order No.</Text>
              <Text style={[styles.infoValue, styles.orderNumberText]}>{orderNumber}</Text>
            </View>
          ) : null}

          {orderId ? (
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}><Ionicons name="barcode-outline" size={15} color={ORANGE} /></View>
              <Text style={styles.infoLabel}>Order ID</Text>
              <Text style={[styles.infoValue, styles.orderIdText]} numberOfLines={1}>{orderId}</Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          {foodName ? (
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}><Ionicons name="fast-food-outline" size={15} color={ORANGE} /></View>
              <Text style={styles.infoLabel}>Item</Text>
              <Text style={styles.infoValue}>{foodName}</Text>
            </View>
          ) : null}

          {quantity ? (
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}><Ionicons name="layers-outline" size={15} color={ORANGE} /></View>
              <Text style={styles.infoLabel}>Quantity</Text>
              <Text style={styles.infoValue}>{quantity}</Text>
            </View>
          ) : null}

          {amount ? (
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}><Ionicons name="cash-outline" size={15} color={ORANGE} /></View>
              <Text style={styles.infoLabel}>Amount Paid</Text>
              <Text style={[styles.infoValue, styles.amountText]}>₹{amount}</Text>
            </View>
          ) : null}

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name={isDelivery ? "bicycle-outline" : "walk-outline"} size={15} color={ORANGE} />
            </View>
            <Text style={styles.infoLabel}>{isDelivery ? "Deliver to" : "Pickup"}</Text>
            <Text style={styles.infoValue}>{isDelivery ? place : "Self Pickup"}</Text>
          </View>

        </View>

        {/* Back to Home */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            console.log("[OrderSuccess] User tapped 'Back to Home'.");
            router.replace("/is_signed_in/student_staff/HomeScreen");
          }}
        >
          <Ionicons name="home-outline" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => {
            console.log("[OrderSuccess] User tapped 'View Orders'.");
            router.push("/is_signed_in/student_staff/MyOrders");
          }}
        >
          <Ionicons name="receipt-outline" size={16} color={ORANGE} />
          <Text style={styles.secondaryBtnText}>View Orders</Text>
        </TouchableOpacity>

      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#FFF4EC" },
  container: { alignItems: "center", justifyContent: "center", padding: 24, paddingTop: 60, paddingBottom: 48 },
  bgCircle1: { position: "absolute", width: 300, height: 300, borderRadius: 150, backgroundColor: "#fde9d4", top: -80, right: -80 },
  bgCircle2: { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "#fde9d4", bottom: 40, left: -60 },
  iconWrapper: { alignItems: "center", justifyContent: "center", marginBottom: 28 },
  ripple: { position: "absolute", width: 110, height: 110, borderRadius: 55, backgroundColor: "rgba(249,115,22,0.12)" },
  checkCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: ORANGE, alignItems: "center", justifyContent: "center", shadowColor: ORANGE, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  checkMark: { fontSize: 38, color: "#fff", fontWeight: "bold", lineHeight: 44 },
  content: { width: "100%", alignItems: "center" },
  heading: { fontSize: 26, fontWeight: "800", color: "#1a1a1a", letterSpacing: -0.5, marginBottom: 4 },
  subheading: { fontSize: 14, color: "#888", marginBottom: 24 },
  card: { width: "100%", backgroundColor: "#fff", borderRadius: 16, padding: 18, marginBottom: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 3 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 11, gap: 8 },
  infoIconBox: { width: 26, height: 26, borderRadius: 8, backgroundColor: "#fff5ee", alignItems: "center", justifyContent: "center" },
  infoLabel: { flex: 1, fontSize: 13, color: "#999" },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#1a1a1a", maxWidth: "55%", textAlign: "right" },
  orderNumberText: { color: ORANGE, letterSpacing: 0.5 },
  orderIdText: { fontSize: 11, color: "#aaa" },
  amountText: { color: ORANGE, fontSize: 15, fontWeight: "800" },
  divider: { height: 1, backgroundColor: "#f5f5f5", marginVertical: 10 },
  primaryBtn: { width: "100%", backgroundColor: ORANGE, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: 14, shadowColor: ORANGE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  secondaryBtn: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 13, borderRadius: 14, borderWidth: 1.5, borderColor: ORANGE, marginTop: 10 },
  secondaryBtnText: { color: ORANGE, fontWeight: "600", fontSize: 14 },
});