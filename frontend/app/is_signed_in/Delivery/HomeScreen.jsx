import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../../firebaseConfig";
import AuthGuard from "../../../components/AuthGuard";

import { ORANGE, homestyles as styles } from "@/assets/src/styles/DeliveryHomeStyles"


export default function HomeScreen() {
  const router = useRouter();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgent();
  }, []);

  const fetchAgent = async () => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const agentRef = doc(db, "delivery_agents", user.uid);
      const snap = await getDoc(agentRef);

      if (snap.exists()) {
        setAgent({
          uid: snap.id,
          ...snap.data(),
        });
      } else {
        console.warn("No delivery agent document found");
      }
    } catch (err) {
      console.error("Agent fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

  return (
    <AuthGuard>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Delivery Dashboard</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.welcome}>Welcome,</Text>
          <Text style={styles.name}>{agent?.name ?? "Agent"}</Text>
          <Text style={styles.username}>{"status:"}{agent?.status ?? ""}</Text>
        </View>

        <View style={styles.statsBox}>
          <Stat label="Total Orders" value={agent?.total_order ?? 0} />
          <Stat label="Completed Orders" value={agent?.completed_order ?? 0} />
        </View>

        <View style={styles.actions}>
          <Action
            icon="list-outline"
            label="View Orders"
            onPress={() =>
              router.push("/is_signed_in/Delivery/Orders")
            }
          />
          <Action
            icon="time-outline"
            label="Order History"
            onPress={() =>
              router.push("/is_signed_in/Delivery/OrderHistory")
            }
          />
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            try {
              await auth.signOut();
              router.replace("/is_signed_out/LoginScreen");
              console.log("user logged out");
            }catch (error) {
              console.error("Logout Error:", error);
              console.log("user logout failed");
            }
          }}
        >
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </AuthGuard>
  );
}


function Stat({ label, value }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function Action({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <Ionicons name={icon} size={22} color={ORANGE} />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

