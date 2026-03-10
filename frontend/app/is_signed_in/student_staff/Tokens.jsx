import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../../firebaseConfig";

const ORANGE = "#FF6B00";

export default function Tokens() {
  const router = useRouter();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[Tokens] Starting realtime token listener...");

    const unsubscribe = onSnapshot(
      collection(db, "token"),
      (snapshot) => {
        const allTokens = [];
        snapshot.forEach((doc) => {
          allTokens.push({ id: doc.id, ...doc.data() });
        });

        // Sort: available first, sold out last
        allTokens.sort((a, b) => b.remainingToken - a.remainingToken);

        console.log(`[Tokens] Fetched ${allTokens.length} token(s).`);
        setTokens(allTokens);
        setLoading(false);
      },
      (error) => {
        console.error("[Tokens] ERROR fetching tokens:", error);
        setLoading(false);
      }
    );

    return () => {
      console.log("[Tokens] Cleaning up token listener.");
      unsubscribe();
    };
  }, []);

  const getStatusStyle = (remaining) => {
    if (remaining === 0)  return { bg: "#FFEBEE", badge: "#E53935", label: "Sold Out" };
    if (remaining < 20)   return { bg: "#FFF3E0", badge: ORANGE,    label: "Low Stock" };
    return                       { bg: "#F1F8E9", badge: "#43A047",  label: "Available" };
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tokens</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={styles.loadingText}>Loading tokens...</Text>
        </View>
      ) : tokens.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="wallet-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No tokens found</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {/* Summary bar */}
          <View style={styles.summaryRow}>
            <SummaryChip
              color="#43A047"
              label="Available"
              count={tokens.filter(t => t.remainingToken >= 20).length}
            />
            <SummaryChip
              color={ORANGE}
              label="Low Stock"
              count={tokens.filter(t => t.remainingToken > 0 && t.remainingToken < 20).length}
            />
            <SummaryChip
              color="#E53935"
              label="Sold Out"
              count={tokens.filter(t => t.remainingToken === 0).length}
            />
          </View>

          {/* Token cards */}
          {tokens.map((item) => {
            const status = getStatusStyle(item.remainingToken);
            return (
              <View key={item.id} style={[styles.card, { backgroundColor: status.bg }]}>
                <View style={styles.cardLeft}>
                  <Ionicons name="ticket-outline" size={26} color={status.badge} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.mealName}>{item.meal || "Unknown Meal"}</Text>
                    {item.price !== undefined && (
                      <Text style={styles.price}>₹{item.price}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.cardRight}>
                  <Text style={[styles.remaining, { color: status.badge }]}>
                    {item.remainingToken}
                  </Text>
                  <Text style={styles.remainingLabel}>tokens</Text>
                  <View style={[styles.badge, { backgroundColor: status.badge }]}>
                    <Text style={styles.badgeText}>{status.label}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function SummaryChip({ color, label, count }) {
  return (
    <View style={[styles.chip, { borderColor: color }]}>
      <Text style={[styles.chipCount, { color }]}>{count}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#888",
    fontSize: 14,
    marginTop: 8,
  },
  emptyText: {
    color: "#aaa",
    fontSize: 15,
    marginTop: 8,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 10,
  },
  chip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: "#fff",
  },
  chipCount: {
    fontSize: 20,
    fontWeight: "800",
  },
  chipLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    marginBottom: 2,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  cardInfo: {
    gap: 2,
  },
  mealName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },
  price: {
    fontSize: 13,
    color: "#666",
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  remaining: {
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 28,
  },
  remainingLabel: {
    fontSize: 11,
    color: "#999",
    marginTop: -4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
