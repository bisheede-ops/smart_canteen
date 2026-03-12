// import React from "react";
// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import { collection, getDocs, doc, setDoc } from "firebase/firestore";
// import { db } from "../../../firebaseConfig";

// export default function AdminRewardDebug() {

//   const generateWinners = async () => {

//     console.log("========== START REWARD DEBUG ==========");

//     try {

//       const snapshot = await getDocs(collection(db, "payments"));

//       console.log("Total payment docs:", snapshot.size);

//       if (snapshot.empty) {
//         console.log("❌ Payments collection empty");
//         return;
//       }

//       const count = {};

//       snapshot.forEach((docSnap) => {

//         const data = docSnap.data();

//         console.log("------ PAYMENT DOCUMENT ------");
//         console.log("Doc ID:", docSnap.id);
//         console.log("Full data:", data);

//         // PRINT ALL FIELDS
//         Object.keys(data).forEach((key) => {
//           console.log("Field:", key, "Value:", data[key]);
//         });

//         // TRY COMMON FIELD NAMES
//         const uid =
//           data.userId ||
//           data.uid ||
//           data.user ||
//           data.customerId ||
//           data.email;

//         console.log("Detected UID:", uid);

//         if (!uid) {
//           console.log("⚠️ No user field detected in this payment");
//           return;
//         }

//         count[uid] = (count[uid] || 0) + 1;

//       });

//       console.log("User transaction count:", count);

//       const users = Object.entries(count).map(([uid, total]) => ({
//         uid,
//         total,
//       }));

//       console.log("Users array:", users);

//       users.sort((a, b) => b.total - a.total);

//       console.log("Sorted users:", users);

//       const top3 = users.slice(0, 3);

//       console.log("Top 3:", top3);

//       if (top3.length === 0) {
//         console.log("❌ No winners detected");
//         return;
//       }

//       await setDoc(doc(db, "rewards", "current"), {
//         first: top3[0]?.uid || null,
//         second: top3[1]?.uid || null,
//         third: top3[2]?.uid || null,
//       });

//       console.log("✅ Winners saved");

//       console.log("========== END DEBUG ==========");

//     } catch (error) {

//       console.log("❌ ERROR:", error);

//     }
//   };

//   return (
//     <View style={styles.container}>

//       <Text style={styles.title}>Reward Debug</Text>

//       <TouchableOpacity
//         style={styles.button}
//         onPress={generateWinners}
//       >
//         <Text style={styles.buttonText}>
//           Generate Winners
//         </Text>
//       </TouchableOpacity>

//     </View>
//   );
// }

// const styles = StyleSheet.create({

//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },

//   button: {
//     backgroundColor: "orange",
//     padding: 15,
//     borderRadius: 10,
//   },

//   buttonText: {
//     color: "white",
//     fontWeight: "bold",
//   },

// });

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

export default function AdminRewardScreen() {
  const generateRewards = async () => {
    try {
      const paymentSnap = await getDocs(collection(db, "payments"));

      const transactionCount = {};

      paymentSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const uid = data.userId;

        if (!uid) return;

        transactionCount[uid] = (transactionCount[uid] || 0) + 1;
      });

      const usersArray = Object.keys(transactionCount).map((uid) => ({
        uid,
        orders: transactionCount[uid],
      }));

      usersArray.sort((a, b) => b.orders - a.orders);

      const top3 = usersArray.slice(0, 3);

      const winners = [];

      for (let user of top3) {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        let username = "Unknown";

        if (userDoc.exists()) {
          username = userDoc.data().username || userDoc.data().name;
        }

        winners.push({
          uid: user.uid,
          username: username,
          orders: user.orders,
        });
      }

      await setDoc(doc(db, "rewards", "current"), {
        winners: winners,
      });

      Alert.alert("Success", "Reward winners generated!");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Reward Generator</Text>

      <TouchableOpacity style={styles.button} onPress={generateRewards}>
        <Text style={styles.buttonText}>Generate Winners</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#ff6b00",
  },

  button: {
    backgroundColor: "#ff6b00",
    padding: 18,
    borderRadius: 12,
    width: 220,
    alignItems: "center",
    elevation: 5,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});