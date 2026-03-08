
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";
// import { useEffect, useState } from "react";
// import { ScrollView, Text, TouchableOpacity, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { auth, db } from "../../../firebaseConfig";

// import { ORANGE, HomeStyles as styles } from "@/assets/src/styles/HomeStyles";

// export default function HomeScreen() {
//   const router = useRouter();
//   const [user, setUser] = useState(null);
//   const [lowTokens, setLowTokens] = useState([]);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const uid = auth.currentUser?.uid;
//         if (!uid) return;

//         const docRef = doc(db, "users", uid);
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           setUser(docSnap.data());
//         } else {
//           console.log("No such user in Firestore!");
//         }
//       } catch (error) {
//         console.error("Error fetching user:", error);
//       }
//     };
//     fetchUserData();
//   }, []);

//   // REALTIME TOKEN LISTENER
//   useEffect(() => {
//     const tokensRef = collection(db, "token");

//     const unsubscribe = onSnapshot(tokensRef, (snapshot) => {
//       const lowStockItems = [];

//       snapshot.forEach((doc) => {
//         const data = doc.data();

//         if (data.remainingToken < 20) {
//           lowStockItems.push({
//             id: doc.id,
//             selectedmeal: data.selectedmeal,
//             remainingToken: data.remainingToken,
//           });
//         }
//       });

//       setLowTokens(lowStockItems);
//     });

//     return () => unsubscribe();
//   }, []);

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.content}>

//         {/* LOW TOKEN BANNERS */}
//         {lowTokens.length > 0 && (
//           <View style={{ marginBottom: 15 }}>
//             {lowTokens.map((item) => (
//               <View
//                 key={item.id}
//                 style={{
//                   backgroundColor: item.remainingToken === 0 ? "#E53935" : "#FFF3E0",
//                   padding: 12,
//                   borderRadius: 8,
//                   marginBottom: 8,
//                   borderWidth: 1,
//                   borderColor: item.remainingToken === 0 ? "#E53935" : ORANGE,
//                 }}
//               >
//                 <Text
//                   style={{
//                     fontWeight: "bold",
//                     color: item.remainingToken === 0 ? "#fff" : "#000",
//                   }}
//                 >
//                   {item.selectedmeal}
//                 </Text>

//                 <Text
//                   style={{
//                     color: item.remainingToken === 0 ? "#fff" : "#333",
//                     marginTop: 4,
//                   }}
//                 >
//                   {item.remainingToken === 0
//                     ? "Finished"
//                     : `Remaining Tokens: ${item.remainingToken}`}
//                 </Text>
//               </View>
//             ))}
//           </View>
//         )}

//         <View style={styles.header}>
//           <Text style={styles.welcome}>Welcome,</Text>
//           <Text style={styles.name}>{user ? user.name : ""}</Text>
//         </View>

//         <View style={styles.actions}>
//           <ActionCard
//             icon="restaurant-outline"
//             label="View Menu"
//             onPress={() => router.push("/is_signed_in/student_staff/ShowMenu")}
//           />
//           <ActionCard
//             icon="time-outline"
//             label="Order Status"
//             onPress={() => router.push("/is_signed_in/student_staff/OrderStatus")}
//           />
//         </View>

//         <View style={styles.actions}>
//           <ActionCard
//             icon="cube-outline"
//             label="Weekly Subscription"
//             onPress={() =>
//               router.push("/is_signed_in/student_staff/SpecialFood")
//             }
//           />
//           <ActionCard
//             icon="receipt-outline"
//             label="Order history"
//             onPress={() =>
//               router.push("/is_signed_in/student_staff/OrderHistory")
//             }
//           />
//         </View>
//       </ScrollView>

//       <View style={styles.navbar}>
//         <NavItem icon="home" label="Home" active />
//         <NavItem
//           icon="sparkles-outline"
//           label="Special Food"
//           onPress={() =>
//             router.push("/is_signed_in/student_staff/SpecialFood")
//           }
//         />
//         <NavItem
//           icon="notifications-outline"
//           label="Notification"
//           onPress={() =>
//             router.push("/is_signed_in/student_staff/Notification")
//           }
//         />
//         <NavItem
//           icon="person-outline"
//           label="Profile"
//           onPress={() =>
//             router.push("/is_signed_in/student_staff/ProfileScreen")
//           }
//         />
//       </View>
//     </SafeAreaView>
//   );
// }

// function ActionCard({ icon, label, onPress }) {
//   return (
//     <TouchableOpacity
//       style={styles.actionCard}
//       onPress={onPress}
//       activeOpacity={0.8}
//     >
//       <Ionicons name={icon} size={30} color={ORANGE} />
//       <Text style={styles.actionText}>{label}</Text>
//     </TouchableOpacity>
//   );
// }

// function NavItem({ icon, label, onPress, active, danger }) {
//   return (
//     <TouchableOpacity
//       style={styles.navItem}
//       onPress={onPress}
//       activeOpacity={0.7}
//     >
//       <Ionicons
//         name={icon}
//         size={24}
//         color={danger ? "#E53935" : active ? ORANGE : "#888"}
//       />
//       <Text
//         style={[
//           styles.navText,
//           active && { color: ORANGE, fontWeight: "bold" },
//           danger && { color: "#E53935" },
//         ]}
//       >
//         {label}
//       </Text>
//     </TouchableOpacity>
//   );
// }


import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../../firebaseConfig";

import { ORANGE, HomeStyles as styles } from "@/assets/src/styles/HomeStyles";

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [lowTokens, setLowTokens] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUser(docSnap.data());
        } else {
          console.log("No such user in Firestore!");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUserData();
  }, []);

  // REALTIME TOKEN LISTENER
  useEffect(() => {
    const tokensRef = collection(db, "token");

    const unsubscribe = onSnapshot(tokensRef, (snapshot) => {
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

      setLowTokens(lowStockItems);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome,</Text>
          <Text style={styles.name}>{user ? user.name : ""}</Text>
        </View>

        <View style={styles.actions}>
          <ActionCard
            icon="restaurant-outline"
            label="View Menu"
            onPress={() => router.push("/is_signed_in/student_staff/ShowMenu")}
          />
          <ActionCard
            icon="time-outline"
            label="Order Status"
            onPress={() => router.push("/is_signed_in/student_staff/OrderStatus")}
          />
        </View>

        <View style={styles.actions}>
          <ActionCard
            icon="cube-outline"
            label="Weekly Subscription"
            onPress={() =>
              router.push("/is_signed_in/student_staff/SpecialFood")
            }
          />
          <ActionCard
            icon="receipt-outline"
            label="Order history"
            onPress={() =>
              router.push("/is_signed_in/student_staff/OrderHistory")
            }
          />
        </View>

        {/* LOW TOKEN BANNERS MOVED TO BOTTOM */}
        {lowTokens.length > 0 && (
          <View style={{ marginTop: 20 }}>
            {lowTokens.map((item) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: item.remainingToken === 0 ? "#E53935" : "#FFF3E0",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: item.remainingToken === 0 ? "#E53935" : ORANGE,
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    color: item.remainingToken === 0 ? "#fff" : "#000",
                  }}
                >
                  {item.meal ? item.meal : "Unknown Item"}
                </Text>

                <Text
                  style={{
                    color: item.remainingToken === 0 ? "#fff" : "#333",
                    marginTop: 4,
                  }}
                >
                  {item.remainingToken === 0
                    ? "Finished"
                    : `Remaining Tokens: ${item.remainingToken}`}
                </Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      <View style={styles.navbar}>
        <NavItem icon="home" label="Home" active />
        <NavItem
          icon="sparkles-outline"
          label="Special Food"
          onPress={() =>
            router.push("/is_signed_in/student_staff/SpecialFood")
          }
        />
        <NavItem
          icon="notifications-outline"
          label="Notification"
          onPress={() =>
            router.push("/is_signed_in/student_staff/Notification")
          }
        />
        <NavItem
          icon="person-outline"
          label="Profile"
          onPress={() =>
            router.push("/is_signed_in/student_staff/ProfileScreen")
          }
        />
      </View>
    </SafeAreaView>
  );
}

function ActionCard({ icon, label, onPress }) {
  return (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={30} color={ORANGE} />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

function NavItem({ icon, label, onPress, active, danger }) {
  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={24}
        color={danger ? "#E53935" : active ? ORANGE : "#888"}
      />
      <Text
        style={[
          styles.navText,
          active && { color: ORANGE, fontWeight: "bold" },
          danger && { color: "#E53935" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}