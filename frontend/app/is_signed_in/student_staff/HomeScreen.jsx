
// import { useRouter } from "expo-router";
// import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";
// import { useEffect, useState } from "react";
// import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { auth, db } from "../../../firebaseConfig";
// import { ORANGE, HomeStyles as styles } from "@/assets/src/styles/HomeStyles";
// import Ionicons from "@expo/vector-icons/Ionicons"; 

// export default function HomeScreen() {
//   const router = useRouter();
//   const [user, setUser]           = useState(null);
//   const [lowTokens, setLowTokens] = useState([]);

//   /* ---------- FETCH USER ---------- */
//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const uid = auth.currentUser?.uid;
//         if (!uid) {
//           console.warn("[HomeScreen] No authenticated user found.");
//           return;
//         }

//         console.log(`[HomeScreen] Fetching user data for uid: ${uid}`);
//         const docSnap = await getDoc(doc(db, "users", uid));

//         if (docSnap.exists()) {
//           console.log(`[HomeScreen] User fetched: ${docSnap.data().name}`);
//           setUser(docSnap.data());
//         } else {
//           console.warn("[HomeScreen] No user document found in Firestore.");
//         }
//       } catch (error) {
//         console.error("[HomeScreen] ERROR fetching user:", error);
//       }
//     };

//     fetchUserData();
//   }, []);

//   /* ---------- REALTIME TOKEN LISTENER ---------- */
//   useEffect(() => {
//     console.log("[HomeScreen] Starting realtime token listener...");

//     const unsubscribe = onSnapshot(
//       collection(db, "token"),
//       (snapshot) => {
//         const lowStockItems = [];

//         snapshot.forEach((doc) => {
//           const data = doc.data();
//           if (data.remainingToken < 20) {
//             lowStockItems.push({
//               id: doc.id,
//               meal: data.meal,
//               remainingToken: data.remainingToken,
//             });
//           }
//         });

//         console.log(`[HomeScreen] Token snapshot received. Low stock items: ${lowStockItems.length}`);
//         if (lowStockItems.length > 0) {
//           lowStockItems.forEach(item =>
//             console.log(`[HomeScreen] Low stock — ${item.meal}: ${item.remainingToken} remaining`)
//           );
//         }

//         setLowTokens(lowStockItems);
//       },
//       (error) => {
//         console.error("[HomeScreen] ERROR in token listener:", error);
//       }
//     );

//     return () => {
//       console.log("[HomeScreen] Cleaning up token listener.");
//       unsubscribe();
//     };
//   }, []);

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.content}>

//         {/* Header */}
//         <View style={styles.header}>
//           <Text style={styles.welcome}>Welcome,</Text>
//           <Text style={styles.name}>{user?.name || ""}</Text>
//         </View>

//         {/* Action Cards Row 1 */}
//         <View style={styles.actions}>
//           <ActionCard
//             icon="restaurant-outline"
//             label="View Menu"
//             onPress={() => {
//               console.log("[HomeScreen] Navigating to ShowMenu.");
//               router.push("/is_signed_in/student_staff/ShowMenu");
//             }}
//           />
//           <ActionCard
//             icon="receipt-outline"
//             label="My Orders"
//             onPress={() => {
//               console.log("[HomeScreen] Navigating to MyOrders.");
//               router.push("/is_signed_in/student_staff/MyOrders");
//             }}
//           />
//         </View>

//         {/* Action Cards Row 2 */}
//         <View style={styles.actions}>
//           <ActionCard
//             icon="wallet-outline"
//             label="Tokens"
//             onPress={() => {
//               console.log("[HomeScreen] Navigating to Tokens.");
//               router.push("/is_signed_in/student_staff/Tokens");
//             }}
//           />
//           <ActionCard
//             icon="time-outline"
//             label="Order History"
//             onPress={() => {
//               console.log("[HomeScreen] Navigating to OrderHistory.");
//               router.push("/is_signed_in/student_staff/OrderHistory");
//             }}
//           />
//         </View>

//         {/* Low Token Banners */}
//         {lowTokens.length > 0 && (
//           <View style={localStyles.bannerContainer}>
//             <Text style={localStyles.bannerTitle}>Stock Alerts</Text>
//             {lowTokens.map((item) => {
//               const isFinished = item.remainingToken === 0;
//               return (
//                 <View
//                   key={item.id}
//                   style={[
//                     localStyles.banner,
//                     isFinished ? localStyles.bannerFinished : localStyles.bannerLow,
//                   ]}
//                 >
//                   <View style={localStyles.bannerLeft}>
//                     <Ionicons
//                       name={isFinished ? "close-circle-outline" : "alert-circle-outline"}
//                       size={18}
//                       color={isFinished ? "#fff" : ORANGE}
//                     />
//                     <Text style={[
//                       localStyles.bannerMeal,
//                       isFinished && localStyles.bannerTextWhite,
//                     ]}>
//                       {item.meal || "Unknown Item"}
//                     </Text>
//                   </View>
//                   <Text style={[
//                     localStyles.bannerCount,
//                     isFinished && localStyles.bannerTextWhite,
//                   ]}>
//                     {isFinished ? "Sold Out" : `${item.remainingToken} left`}
//                   </Text>
//                 </View>
//               );
//             })}
//           </View>
//         )}

//       </ScrollView>

//       {/* Navbar */}
//       <View style={styles.navbar}>
//         <NavItem icon="home" label="Home" active />
//         <NavItem
//           icon="sparkles-outline"
//           label="Special Food"
//           onPress={() => {
//             console.log("[HomeScreen] Navigating to SpecialFood via navbar.");
//             router.push("/is_signed_in/student_staff/SpecialFood");
//           }}
//         />
//         <NavItem
//           icon="notifications-outline"
//           label="Notification"
//           onPress={() => {
//             console.log("[HomeScreen] Navigating to Notification via navbar.");
//             router.push("/is_signed_in/student_staff/Notification");
//           }}
//         />
//         <NavItem
//           icon="person-outline"
//           label="Profile"
//           onPress={() => {
//             console.log("[HomeScreen] Navigating to ProfileScreen via navbar.");
//             router.push("/is_signed_in/student_staff/ProfileScreen");
//           }}
//         />
//       </View>
//     </SafeAreaView>
//   );
// }

// function ActionCard({ icon, label, onPress }) {
//   return (
//     <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.8}>
//       <Ionicons name={icon} size={30} color={ORANGE} />
//       <Text style={styles.actionText}>{label}</Text>
//     </TouchableOpacity>
//   );
// }

// function NavItem({ icon, label, onPress, active, danger }) {
//   return (
//     <TouchableOpacity style={styles.navItem} onPress={onPress} activeOpacity={0.7}>
//       <Ionicons
//         name={icon}
//         size={24}
//         color={danger ? "#E53935" : active ? ORANGE : "#888"}
//       />
//       <Text style={[
//         styles.navText,
//         active  && { color: ORANGE,   fontWeight: "bold" },
//         danger  && { color: "#E53935" },
//       ]}>
//         {label}
//       </Text>
//     </TouchableOpacity>
//   );
// }

// const localStyles = StyleSheet.create({
//   bannerContainer: {
//     marginTop: 20,
//   },
//   bannerTitle: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: "#888",
//     marginBottom: 8,
//     textTransform: "uppercase",
//     letterSpacing: 0.6,
//   },
//   banner: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 8,
//     borderWidth: 1,
//   },
//   bannerLow: {
//     backgroundColor: "#FFF3E0",
//     borderColor: ORANGE,
//   },
//   bannerFinished: {
//     backgroundColor: "#E53935",
//     borderColor: "#E53935",
//   },
//   bannerLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     flex: 1,
//   },
//   bannerMeal: {
//     fontWeight: "600",
//     color: "#333",
//     fontSize: 14,
//   },
//   bannerCount: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: ORANGE,
//   },
//   bannerTextWhite: {
//     color: "#fff",
//   },
// });


import { useRouter } from "expo-router";
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../../firebaseConfig";
import { ORANGE, HomeStyles as styles } from "@/assets/src/styles/HomeStyles";
import Ionicons from "@expo/vector-icons/Ionicons"; 

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser]           = useState(null);
  const [lowTokens, setLowTokens] = useState([]);

  /* ---------- FETCH USER ---------- */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          console.warn("[HomeScreen] No authenticated user found.");
          return;
        }

        console.log(`[HomeScreen] Fetching user data for uid: ${uid}`);
        const docSnap = await getDoc(doc(db, "users", uid));

        if (docSnap.exists()) {
          console.log(`[HomeScreen] User fetched: ${docSnap.data().name}`);
          setUser(docSnap.data());
        } else {
          console.warn("[HomeScreen] No user document found in Firestore.");
        }
      } catch (error) {
        console.error("[HomeScreen] ERROR fetching user:", error);
      }
    };

    fetchUserData();
  }, []);

  /* ---------- REALTIME TOKEN LISTENER ---------- */
  useEffect(() => {
    console.log("[HomeScreen] Starting realtime token listener...");

    const unsubscribe = onSnapshot(
      collection(db, "token"),
      (snapshot) => {
        const lowStockItems = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.remainingToken < 20) {
            lowStockItems.push({
              id: doc.id,
              meal: data.meal,
              remainingToken: data.remainingToken,
            });
          }
        });

        console.log(`[HomeScreen] Token snapshot received. Low stock items: ${lowStockItems.length}`);
        if (lowStockItems.length > 0) {
          lowStockItems.forEach(item =>
            console.log(`[HomeScreen] Low stock — ${item.meal}: ${item.remainingToken} remaining`)
          );
        }

        setLowTokens(lowStockItems);
      },
      (error) => {
        console.error("[HomeScreen] ERROR in token listener:", error);
      }
    );

    return () => {
      console.log("[HomeScreen] Cleaning up token listener.");
      unsubscribe();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome,</Text>
          <Text style={styles.name}>{user?.name || ""}</Text>
        </View>

        {/* Action Cards Row 1 */}
        <View style={styles.actions}>
          <ActionCard
            icon="restaurant-outline"
            label="View Menu"
            onPress={() => {
              console.log("[HomeScreen] Navigating to ShowMenu.");
              router.push("/is_signed_in/student_staff/ShowMenu");
            }}
          />
          <ActionCard
            icon="receipt-outline"
            label="My Orders"
            onPress={() => {
              console.log("[HomeScreen] Navigating to MyOrders.");
              router.push("/is_signed_in/student_staff/MyOrders");
            }}
          />
        </View>

        {/* Action Cards Row 2 */}
        <View style={styles.actions}>
          <ActionCard
            icon="wallet-outline"
            label="Tokens"
            onPress={() => {
              console.log("[HomeScreen] Navigating to Tokens.");
              router.push("/is_signed_in/student_staff/Tokens");
            }}
          />
          <ActionCard
            icon="time-outline"
            label="Order History"
            onPress={() => {
              console.log("[HomeScreen] Navigating to OrderHistory.");
              router.push("/is_signed_in/student_staff/OrderHistory");
            }}
          />
        </View>
        <View style={styles.actions}>
          <ActionCard
            icon="trophy-outline"
            label="Reward"
            onPress={() => {
              console.log("[HomeScreen] Navigating to Tokens.");
              router.push("/is_signed_in/student_staff/UserRewardScreen");
            }}
          />
          <ActionCard
            icon="calendar-outline"
            label="Weekly Subscription"
            onPress={() => {
              console.log("[HomeScreen] Navigating to OrderHistory.");
              router.push("/is_signed_in/student_staff/OrderHistor");
            }}
          />
        </View>

        {/* Low Token Banners */}
        {lowTokens.length > 0 && (
          <View style={localStyles.bannerContainer}>
            <Text style={localStyles.bannerTitle}>Stock Alerts</Text>
            {lowTokens.map((item) => {
              const isFinished = item.remainingToken === 0;
              return (
                <View
                  key={item.id}
                  style={[
                    localStyles.banner,
                    isFinished
                      ? localStyles.bannerFinished
                      : localStyles.bannerLow,
                  ]}
                >
                  <View style={localStyles.bannerLeft}>
                    <Ionicons
                      name={
                        isFinished
                          ? "close-circle-outline"
                          : "alert-circle-outline"
                      }
                      size={18}
                      color={isFinished ? "#fff" : ORANGE}
                    />
                    <Text
                      style={[
                        localStyles.bannerMeal,
                        isFinished && localStyles.bannerTextWhite,
                      ]}
                    >
                      {item.meal || "Unknown Item"}
                    </Text>
                  </View>
                  <Text
                    style={[
                      localStyles.bannerCount,
                      isFinished && localStyles.bannerTextWhite,
                    ]}
                  >
                    {isFinished ? "Sold Out" : `${item.remainingToken} left`}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Navbar */}
      <View style={styles.navbar}>
        <NavItem icon="home" label="Home" active />
        <NavItem
          icon="sparkles-outline"
          label="Special Food"
          onPress={() => {
            console.log("[HomeScreen] Navigating to SpecialFood via navbar.");
            router.push("/is_signed_in/student_staff/SpecialFood");
          }}
        />
        <NavItem
          icon="notifications-outline"
          label="Notification"
          onPress={() => {
            console.log("[HomeScreen] Navigating to Notification via navbar.");
            router.push("/is_signed_in/student_staff/Notification");
          }}
        />
        <NavItem
          icon="person-outline"
          label="Profile"
          onPress={() => {
            console.log("[HomeScreen] Navigating to ProfileScreen via navbar.");
            router.push("/is_signed_in/student_staff/ProfileScreen");
          }}
        />
      </View>
    </SafeAreaView>
  );
}

function ActionCard({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name={icon} size={30} color={ORANGE} />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

function NavItem({ icon, label, onPress, active, danger }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress} activeOpacity={0.7}>
      <Ionicons
        name={icon}
        size={24}
        color={danger ? "#E53935" : active ? ORANGE : "#888"}
      />
      <Text style={[
        styles.navText,
        active  && { color: ORANGE,   fontWeight: "bold" },
        danger  && { color: "#E53935" },
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const localStyles = StyleSheet.create({
  bannerContainer: {
    marginTop: 20,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  bannerLow: {
    backgroundColor: "#FFF3E0",
    borderColor: ORANGE,
  },
  bannerFinished: {
    backgroundColor: "#E53935",
    borderColor: "#E53935",
  },
  bannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  bannerMeal: {
    fontWeight: "600",
    color: "#333",
    fontSize: 14,
  },
  bannerCount: {
    fontSize: 13,
    fontWeight: "700",
    color: ORANGE,
  },
  bannerTextWhite: {
    color: "#fff",
  },
});
