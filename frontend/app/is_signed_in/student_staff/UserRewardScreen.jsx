// // // UserRewardScreen.js

// import React, { useEffect, useState } from "react";
// import { View, Text, StyleSheet } from "react-native";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "../../../firebaseConfig";

// export default function UserRewardScreen() {

//   const [winners, setWinners] = useState({});

//   useEffect(() => {
//     loadRewards();
//   }, []);

//   const loadRewards = async () => {

//     console.log("Fetching reward winners...");

//     try {

//       const snap = await getDoc(doc(db, "rewards", "current"));

//       if (!snap.exists()) {
//         console.log("❌ No rewards document found");
//         return;
//       }

//       const data = snap.data();

//       console.log("Reward data:", data);

//       setWinners(data);

//     } catch (error) {

//       console.log("❌ Error fetching rewards:", error);

//     }
//   };

//   return (

//     <View style={styles.container}>

//       <Text style={styles.title}>🏆 Reward Winners</Text>

//       <Text style={styles.text}>
//         🥇 First: {winners.first || "No winner"}
//       </Text>

//       <Text style={styles.text}>
//         🥈 Second: {winners.second || "No winner"}
//       </Text>

//       <Text style={styles.text}>
//         🥉 Third: {winners.third || "No winner"}
//       </Text>

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
//     fontSize: 26,
//     fontWeight: "bold",
//     marginBottom: 30,
//   },

//   text: {
//     fontSize: 18,
//     marginVertical: 6,
//   },

// });
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

export default function RewardScreen() {
  const [winners, setWinners] = useState([]);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    const snap = await getDoc(doc(db, "rewards", "current"));

    if (snap.exists()) {
      setWinners(snap.data().winners || []);
    }
  };

  const renderWinner = ({ item }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.crown}>👑</Text>

        <Text style={styles.name}>{item.username}</Text>

        <Text style={styles.orders}>{item.orders} Orders</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Reward Winners</Text>

      <Text style={styles.subtitle}>Top Customers of the Month</Text>

      <FlatList
        data={winners}
        renderItem={renderWinner}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={{ paddingTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    paddingTop: 50,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 16,
    color: "#777",
    marginTop: 5,
  },

  card: {
    backgroundColor: "white",
    width: 300,
    padding: 25,
    borderRadius: 20,
    marginVertical: 10,
    alignItems: "center",
    elevation: 5,
  },

  crown: {
    fontSize: 40,
  },

  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },

  orders: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
});