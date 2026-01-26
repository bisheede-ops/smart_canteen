import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db,auth } from "../../../firebaseConfig";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const userId = auth.currentUser.uid;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setNotifications(list);
  };

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          No notifications
        </Text>
      }
      renderItem={({ item }) => (
        <View
          style={{
            backgroundColor: item.isRead ? "#fff" : "#eef6ff",
            padding: 15,
            margin: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
          <Text>{item.message}</Text>
          <Text style={{ color: "gray", marginTop: 5 }}>
            Status: {item.status.toUpperCase()}
          </Text>
        </View>
      )}
    />
  );
}
// import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
// import { useEffect, useState } from "react";
// import { FlatList, Text, View } from "react-native";
// import { auth, db } from "../../../firebaseConfig";

// export default function Notifications() {
//   const [notifications, setNotifications] = useState([]);
//   const userId = auth.currentUser?.uid;

//   useEffect(() => {
//     if (userId) {
//       fetchNotifications();
//     }
//   }, [userId]);

//   const fetchNotifications = async () => {
//     try {
//       const q = query(
//         collection(db, "notifications"),
//         where("userId", "==", userId),
//         orderBy("createdAt", "desc"),
//       );

//       const snapshot = await getDocs(q);
//       const list = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       setNotifications(list);
//     } catch (error) {
//       console.log("Error fetching notifications:", error);
//     }
//   };

//   const renderItem = ({ item }) => {
//     const isUnread = !item.isRead;

//     return (
//       <View
//         style={{
//           backgroundColor: isUnread ? "#f1f7ff" : "#ffffff",
//           padding: 14,
//           marginHorizontal: 12,
//           marginVertical: 6,
//           borderRadius: 10,
//           borderLeftWidth: isUnread ? 4 : 0,
//           borderLeftColor: "#4f8ef7",
//         }}
//       >
//         {/* Title & unread dot */}
//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <Text
//             style={{
//               fontSize: 15,
//               fontWeight: isUnread ? "700" : "500",
//             }}
//           >
//             {item.title}
//           </Text>

//           {isUnread && (
//             <View
//               style={{
//                 width: 8,
//                 height: 8,
//                 borderRadius: 4,
//                 backgroundColor: "#4f8ef7",
//               }}
//             />
//           )}
//         </View>

//         {/* Message */}
//         <Text
//           style={{
//             marginTop: 4,
//             fontSize: 14,
//             color: "#555",
//           }}
//         >
//           {item.message}
//         </Text>

//         {/* Status */}
//         <Text
//           style={{
//             marginTop: 6,
//             fontSize: 12,
//             color: "#888",
//           }}
//         >
//           {item.status === "accepted"
//             ? "✅ Accepted"
//             : item.status === "rejected"
//               ? "❌ Rejected"
//               : "⏳ Pending"}
//         </Text>
//       </View>
//     );
//   };

//   return (
//     <FlatList
//       data={notifications}
//       keyExtractor={(item) => item.id}
//       renderItem={renderItem}
//       ListEmptyComponent={
//         <Text style={{ textAlign: "center", marginTop: 50, color: "#777" }}>
//           No notifications
//         </Text>
//       }
//     />
//   );
// }
