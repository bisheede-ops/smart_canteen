import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { collection, doc, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../../../firebaseConfig";

const ORANGE = "#f97316";

export default function PaymentScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const params = useLocalSearchParams();
  const router = useRouter();

  const amount        = Number(params?.amount       || 0);
  const foodName      = params?.foodName            || "";
  const quantity      = Number(params?.quantity     || 0);
  const place         = params?.place               || "";
  const toBeDelivered = params?.toBeDelivered       === "yes";
  const itemId        = params?.itemId              || foodName.toLowerCase();
  const pricePerItem  = Number(params?.pricePerItem || 0);

  const [loading, setLoading]   = useState(false);
  const [username, setUsername] = useState("");
  const [phone, setPhone]       = useState("");         // ← new

  /* ---------- FETCH USER DATA ---------- */
  useEffect(() => {
    console.log(`[PaymentScreen] Screen mounted. foodName: ${foodName}, quantity: ${quantity}, amount: ₹${amount}, itemId: ${itemId}`);

    if (!amount) {
      console.warn("[PaymentScreen] Amount is 0 or missing.");
      Toast.show({ type: "error", text1: "Invalid amount" });
    }

    const fetchUserData = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.warn("[PaymentScreen] No authenticated user.");
        return;
      }
      console.log(`[PaymentScreen] Fetching user data for uid: ${uid}`);
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          const data = snap.data();
          const name  = data.username || data.name  || "Unknown";
          const ph    = data.phone                  || "";       // ← fetch phone
          console.log(`[PaymentScreen] User fetched — name: ${name}, phone: ${ph}`);
          setUsername(name);
          setPhone(ph);
        } else {
          console.warn("[PaymentScreen] User document not found in Firestore.");
        }
      } catch (e) {
        console.error("[PaymentScreen] ERROR fetching user data:", e);
      }
    };

    fetchUserData();
  }, []);

  /* ---------- HANDLE PAYMENT ---------- */
  async function handlePayment() {
    if (loading) {
      console.log("[PaymentScreen] handlePayment called while already loading, ignoring.");
      return;
    }

    console.log("[PaymentScreen] handlePayment triggered.");
    setLoading(true);

    try {
      // ── 1. Create Payment Intent ──────────────────────────────────
      console.log(`[PaymentScreen] Calling backend. Amount: ₹${amount} (${amount * 100} paise)`);
      const API_URL = process.env.EXPO_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount * 100 }),
      });

      const data = await response.json();
      const { clientSecret } = data;

      if (!clientSecret) {
        console.error("[PaymentScreen] No clientSecret returned from backend.", data);
        Toast.show({ type: "error", text1: "Payment initialization failed" });
        return;
      }
      console.log("[PaymentScreen] clientSecret received successfully.");

      // ── 2. Init Payment Sheet ─────────────────────────────────────
      console.log("[PaymentScreen] Initializing Stripe payment sheet...");
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Smart Canteen",
      });

      if (initError) {
        console.error("[PaymentScreen] ERROR initializing payment sheet:", initError);
        Toast.show({ type: "error", text1: "Payment setup failed" });
        return;
      }
      console.log("[PaymentScreen] Payment sheet initialized successfully.");

      // ── 3. Present Sheet to User ──────────────────────────────────
      console.log("[PaymentScreen] Presenting Stripe payment sheet to user...");
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        console.error("[PaymentScreen] Payment sheet error:", paymentError.message);
        Toast.show({ type: "error", text1: paymentError.message || "Payment failed" });
        return;
      }
      console.log("[PaymentScreen] Payment sheet completed — user paid.");

      // ── 4. Save order + increment counter + decrement token ───────
      const user       = auth.currentUser;
      const orderRef   = doc(collection(db, "orders"));
      const tokenRef   = doc(db, "token", foodName.toLowerCase());
      const counterRef = doc(db, "meta", "orderCounter");

      let resolvedOrderNumber = null;

      console.log(`[PaymentScreen] Starting Firestore transaction. orderId: ${orderRef.id}`);

      await runTransaction(db, async (transaction) => {

        // ── All reads first (Firestore requirement) ─────────────────
        const counterSnap = await transaction.get(counterRef);
        const tokenSnap   = await transaction.get(tokenRef);

        // ── Counter check ───────────────────────────────────────────
        if (!counterSnap.exists()) {
          console.error("[PaymentScreen] meta/orderCounter document is missing.");
          throw new Error("ORDER_COUNTER_MISSING");
        }

        const nextOrderNumber = counterSnap.data().lastOrderNumber + 1;
        console.log(`[PaymentScreen] Next order number: ${nextOrderNumber}`);

        // ── Token check ─────────────────────────────────────────────
        if (tokenSnap.exists()) {
          const remaining = tokenSnap.data().remainingToken;
          console.log(`[PaymentScreen] Token found. Remaining: ${remaining}, Requested: ${quantity}`);

          if (quantity > remaining) {
            console.warn("[PaymentScreen] Not enough tokens. Aborting transaction.");
            throw new Error("NOT_ENOUGH_TOKENS");
          }

          transaction.update(tokenRef, {
            remainingToken: remaining - quantity,
            updatedAt: serverTimestamp(),
          });
          console.log(`[PaymentScreen] Token decremented: ${remaining} → ${remaining - quantity}`);
        } else {
          console.log(`[PaymentScreen] No token doc for "${foodName.toLowerCase()}" — no limit enforced.`);
        }

        // ── All writes after all reads ──────────────────────────────

        // Increment order counter
        transaction.update(counterRef, { lastOrderNumber: nextOrderNumber });
        console.log(`[PaymentScreen] Order counter updated to: ${nextOrderNumber}`);

        // Save order document
        transaction.set(orderRef, {
          userId:    user.uid,
          userName:  username  || user.email || "Unknown",
          userEmail: user.email || "",
          phone:     phone     || "",                          // ← saved to order

          items: [{
            itemId,
            name:     foodName,
            quantity,
            price:    pricePerItem,
            subtotal: amount,
          }],
          pricing: {
            subtotal: amount,
            tax:      0,
            discount: 0,
            total:    amount,
          },
          payment: {
            method: "stripe",
            status: "paid",
            paidAt: serverTimestamp(),
          },
          deliveryDetails: { place, toBeDelivered },
          orderNumber: `SC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${nextOrderNumber}`,
          status:    "confirmed",
          note:      "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        console.log(`[PaymentScreen] Order set in transaction. orderId: ${orderRef.id}, orderNumber: ${nextOrderNumber}`);

        resolvedOrderNumber = `SC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${nextOrderNumber}`;
      });

      console.log(`[PaymentScreen] Transaction committed. orderId: ${orderRef.id}, orderNumber: ${resolvedOrderNumber}`);

      // ── 5. Navigate to success ────────────────────────────────────
      console.log("[PaymentScreen] Navigating to OrderSuccess screen.");
      router.replace({
        pathname: "/is_signed_in/student_staff/OrderSuccess",
        params: {
          orderNumber:   String(resolvedOrderNumber),
          orderId:       orderRef.id,
          foodName,
          quantity:      String(quantity),
          amount:        String(amount),
          toBeDelivered: toBeDelivered ? "yes" : "no",
          place,
        },
      });

    } catch (e) {
      if (e.message === "NOT_ENOUGH_TOKENS") {
        console.warn("[PaymentScreen] Transaction aborted: NOT_ENOUGH_TOKENS.");
        Toast.show({
          type: "error",
          text1: "Not enough tokens available",
          text2: "Someone may have just taken the last slot.",
        });
      } else if (e.message === "ORDER_COUNTER_MISSING") {
        console.error("[PaymentScreen] orderCounter document missing in Firestore.");
        Toast.show({
          type: "error",
          text1: "Order system error",
          text2: "Please contact support.",
        });
      } else {
        console.error("[PaymentScreen] Unhandled error in handlePayment:", e);
        Toast.show({ type: "error", text1: "Something went wrong" });
      }
    } finally {
      setLoading(false);
    }
  }

  /* ---------- RENDER ---------- */
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.heading}>Order Summary</Text>

        <View style={styles.row}>
          <Ionicons name="person-outline" size={16} color="#999" />
          <Text style={styles.rowLabel}>Ordering as</Text>
          <Text style={styles.rowValue}>{username || "..."}</Text>
        </View>

        {/* Phone number row */}
        <View style={styles.row}>
          <Ionicons name="call-outline" size={16} color="#999" />
          <Text style={styles.rowLabel}>Phone</Text>
          <Text style={styles.rowValue}>{phone || "..."}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Ionicons name="fast-food-outline" size={16} color="#999" />
          <Text style={styles.rowLabel}>Item</Text>
          <Text style={styles.rowValue}>{foodName || "N/A"}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="layers-outline" size={16} color="#999" />
          <Text style={styles.rowLabel}>Quantity</Text>
          <Text style={styles.rowValue}>{quantity}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="pricetag-outline" size={16} color="#999" />
          <Text style={styles.rowLabel}>Price per item</Text>
          <Text style={styles.rowValue}>₹{pricePerItem}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Ionicons
            name={toBeDelivered ? "bicycle-outline" : "walk-outline"}
            size={16} color="#999"
          />
          <Text style={styles.rowLabel}>{toBeDelivered ? "Deliver to" : "Pickup"}</Text>
          <Text style={styles.rowValue}>{toBeDelivered ? place : "Self Pickup"}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹{amount}</Text>
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          onPress={handlePayment}
          disabled={loading}
          style={[styles.payBtn, loading && styles.payBtnDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="lock-closed-outline" size={16} color="#fff" />
              <Text style={styles.payBtnText}>Pay ₹{amount} Securely</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={() => {
            console.log("[PaymentScreen] User cancelled payment, going back.");
            router.back();
          }}
          disabled={loading}
          style={[styles.cancelBtn, loading && { opacity: 0.4 }]}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        {/* Stripe Badge */}
        <View style={styles.stripeBadge}>
          <Ionicons name="shield-checkmark-outline" size={13} color="#aaa" />
          <Text style={styles.stripeText}>Secured by Stripe</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:         { flex: 1, backgroundColor: "#FFF4EC", justifyContent: "center", padding: 20 },
  card:           { backgroundColor: "#fff", borderRadius: 16, padding: 20, elevation: 3, shadowColor: "#f97316", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
  heading:        { fontSize: 18, fontWeight: "700", color: "#1a1a1a", marginBottom: 16 },
  row:            { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
  rowLabel:       { flex: 1, fontSize: 14, color: "#888" },
  rowValue:       { fontSize: 14, fontWeight: "600", color: "#1a1a1a", maxWidth: "55%", textAlign: "right" },
  divider:        { height: 1, backgroundColor: "#f5f5f5", marginVertical: 8 },
  totalRow:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 8 },
  totalLabel:     { fontSize: 15, fontWeight: "700", color: "#1a1a1a" },
  totalValue:     { fontSize: 20, fontWeight: "800", color: ORANGE },
  payBtn:         { backgroundColor: ORANGE, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 12, marginTop: 16, marginBottom: 10, shadowColor: ORANGE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  payBtnDisabled: { backgroundColor: "#ffb380", elevation: 0 },
  payBtnText:     { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelBtn:      { backgroundColor: "#f5f5f5", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  cancelBtnText:  { color: "#555", fontWeight: "600", fontSize: 14 },
  stripeBadge:    { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 4, marginTop: 14 },
  stripeText:     { fontSize: 11, color: "#bbb" },
});
