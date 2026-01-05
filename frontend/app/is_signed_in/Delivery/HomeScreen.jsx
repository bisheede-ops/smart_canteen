// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
// import { useEffect, useState } from "react";
// import { doc, getDoc } from "firebase/firestore";
// import { onAuthStateChanged } from "firebase/auth";
// import { db, auth } from "../../../firebaseConfig";

// export default function HomeScreen() {
//   const router = useRouter();
//   const [agent, setAgent] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (!user) {
//         router.replace("/is_signed_out/LoginScreen");
//         return;
//       }

//       try {
//         const agentRef = doc(db, "delivery_agents", user.uid);
//         const agentSnap = await getDoc(agentRef);

//         if (agentSnap.exists()) {
//           setAgent(agentSnap.data());
//         } else {
//           console.log("Delivery agent record not found");
//         }
//       } catch (error) {
//         console.log("Error fetching agent data:", error);
//       } finally {
//         setLoading(false);
//       }
//     });

//     return unsubscribe;
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#FF7A00" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Delivery Dashboard</Text>
//       </View>

//       {/* INFO */}
//       <View style={styles.infoBox}>
//         <Text style={styles.welcome}>Welcome,</Text>
//         <Text style={styles.name}>{agent?.name || "Delivery Agent"}</Text>
//         <Text style={styles.username}>{agent?.username || ""}</Text>
//       </View>

//       {/* STATS */}
//       <View style={styles.statsBox}>
//         <View style={styles.statRow}>
//           <Text style={styles.statLabel}>Total Orders</Text>
//           <Text style={styles.statValue}>{agent?.total_order ?? 0}</Text>
//         </View>

//         <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
//           <Text style={styles.statLabel}>Completed Orders</Text>
//           <Text style={styles.statValue}>{agent?.completed_order ?? 0}</Text>
//         </View>
//       </View>

//       {/* ACTION BUTTONS */}
//       <View style={styles.actions}>
//         <TouchableOpacity
//           style={styles.actionBtn}
//           onPress={() => router.push("/is_signed_in/Delivery/Orders")}
//         >
//           <Ionicons name="list-outline" size={22} color="#FF7A00" />
//           <Text style={styles.actionText}>View Orders</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.actionBtn}
//           onPress={() => router.push("/is_signed_in/Delivery/OrderHistory")}
//         >
//           <Ionicons name="time-outline" size={22} color="#FF7A00" />
//           <Text style={styles.actionText}>Order History</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.actionBtn}
//           onPress={() => router.push("/is_signed_in/Delivery/ProfileScreen")}
//         >
//           <Ionicons name="person-outline" size={22} color="#FF7A00" />
//           <Text style={styles.actionText}>My Profile</Text>
//         </TouchableOpacity>
//       </View>

//       {/* LOGOUT */}
//       <TouchableOpacity
//         style={styles.logoutBtn}
//         onPress={async () => {
//           await auth.signOut();
//           router.replace("/is_signed_out/LoginScreen");
//         }}
//       >
//         <Ionicons name="log-out-outline" size={18} color="#fff" />
//         <Text style={styles.logoutText}>Logout</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// /* ================= STYLES ================= */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F8F8F8",
//     padding: 20,
//   },

//   loader: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   header: {
//     backgroundColor: "#FF7A00",
//     paddingVertical: 18,
//     borderRadius: 14,
//     alignItems: "center",
//   },

//   headerTitle: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "700",
//     marginTop: 6,
//   },

//   infoBox: {
//     marginTop: 20,
//     alignItems: "center",
//   },

//   welcome: {
//     fontSize: 14,
//     color: "#777",
//   },

//   name: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#333",
//     marginTop: 4,
//   },

//   username: {
//     fontSize: 13,
//     color: "#888",
//     marginTop: 2,
//   },

//   statsBox: {
//     backgroundColor: "#fff",
//     marginTop: 25,
//     borderRadius: 12,
//     padding: 16,
//   },

//   statRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 10,
//     borderBottomWidth: 0.5,
//     borderColor: "#eee",
//   },

//   statLabel: {
//     fontSize: 15,
//     color: "#555",
//   },

//   statValue: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#FF7A00",
//   },

//   actions: {
//     marginTop: 30,
//   },

//   actionBtn: {
//     backgroundColor: "#fff",
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 14,
//     borderRadius: 12,
//     marginBottom: 12,
//   },

//   actionText: {
//     marginLeft: 14,
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#333",
//   },

//   logoutBtn: {
//     backgroundColor: "#FF7A00",
//     paddingVertical: 14,
//     borderRadius: 14,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: "auto",
//   },

//   logoutText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "700",
//     marginLeft: 8,
//   },
// });


import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../firebaseConfig";
import AuthGuard from "../../../components/AuthGuard";

export default function HomeScreen() {
  const router = useRouter();
  const [agent, setAgent] = useState(null);

  useEffect(() => {
    const fetchAgent = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const agentRef = doc(db, "delivery_agents", user.uid);
        const snap = await getDoc(agentRef);

        if (snap.exists()) {
          setAgent(snap.data());
        }
      } catch (err) {
        console.log("Agent fetch error:", err);
      }
    };

    fetchAgent();
  }, []);

  return (
    <AuthGuard>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Delivery Dashboard</Text>
        </View>

        {/* INFO */}
        <View style={styles.infoBox}>
          <Text style={styles.welcome}>Welcome,</Text>
          <Text style={styles.name}>{agent?.name}</Text>
          <Text style={styles.username}>{agent?.username}</Text>
        </View>

        {/* STATS */}
        <View style={styles.statsBox}>
          <Stat label="Total Orders" value={agent?.total_order ?? 0} />
          <Stat label="Completed Orders" value={agent?.completed_order ?? 0} />
        </View>

        {/* ACTIONS */}
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
          <Action
            icon="person-outline"
            label="My Profile"
            onPress={() =>
              router.push("/is_signed_in/Delivery/ProfileScreen")
            }
          />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await auth.signOut();
            router.replace("/is_signed_out/LoginScreen");
          }}
        >
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
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
      <Ionicons name={icon} size={22} color="#FF7A00" />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}



/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    padding: 20,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    backgroundColor: "#FF7A00",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 6,
  },

  infoBox: {
    marginTop: 20,
    alignItems: "center",
  },

  welcome: {
    fontSize: 14,
    color: "#777",
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 4,
  },

  username: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },

  statsBox: {
    backgroundColor: "#fff",
    marginTop: 25,
    borderRadius: 12,
    padding: 16,
  },

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },

  statLabel: {
    fontSize: 15,
    color: "#555",
  },

  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF7A00",
  },

  actions: {
    marginTop: 30,
  },

  actionBtn: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },

  actionText: {
    marginLeft: 14,
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  logoutBtn: {
    backgroundColor: "#FF7A00",
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
  },

  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
});
