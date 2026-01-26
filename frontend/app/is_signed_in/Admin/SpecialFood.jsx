// import { useEffect, useState } from "react";
// import { View, Text, FlatList, TouchableOpacity } from "react-native";
// import { collection, getDocs, orderBy, query } from "firebase/firestore";
// import { db } from "../../../firebaseConfig";
// import { useNavigation } from "@react-navigation/native";
// import { router } from "expo-router";
// export default function AdminSpecialFoodList() {
//   const [requests, setRequests] = useState([]);
//   const navigation = useNavigation();

//   useEffect(() => {
//     fetchRequests();
//   }, []);

//   const fetchRequests = async () => {
//     const q = query(
//       collection(db, "specialFoodRequests"),
//       orderBy("createdAt", "desc")
//     );

//     const snapshot = await getDocs(q);
//     const list = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     setRequests(list);
//   };
//   return (
//     <FlatList
//       data={requests}
//       keyExtractor={(item) => item.id}
//       renderItem={({ item }) => (
//         <TouchableOpacity
//           onPress={() =>
//             router.push({
//               pathname: "/is_signed_in/Admin/specialFoodDetails",
//               params: { id: item.id },
//             })
//           }
//           style={{
//             backgroundColor: "#fff",
//             padding: 15,
//             margin: 10,
//             borderRadius: 8,
//             elevation: 2,
//           }}
//         >
//           <Text style={{ fontWeight: "bold" }}>{item.eventName}</Text>
//           <Text>Coordinator: {item.coordinatorName}</Text>
//           <Text>Date: {item.date}</Text>
//         </TouchableOpacity>
//       )}
//     />
//   );
// }
import { useEffect, useState } from "react";
import {  Text, FlatList, TouchableOpacity } from "react-native";
import { collection, getDocs,query,orderBy } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { useRouter } from "expo-router";


export default function SpecialFoodList() {
  const [requests, setRequests] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const q = query(
        collection(db, "specialFoodRequests"),
        orderBy("statusOrder"), // 👈 pending → accepted → rejected
        orderBy("createdAt", "desc"), // 👈 newest first
      );

      const snapshot = await getDocs(q);

      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("ADMIN LIST:", list);
      setRequests(list);
    } catch (error) {
      console.log("Error fetching requests:", error);
    }
  };
  const getStatusColor = (status) => {
    if (status === "accepted") return "green";
    if (status === "rejected") return "red";
    return "orange";
  };

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 20 ,paddingTop:40}}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={{
            backgroundColor: "#fff",
            padding: 15,
            margin: 10,
            borderRadius: 8,
            elevation: 2,
          }}
          onPress={() =>
            router.push({
              pathname: "/is_signed_in/Admin/SpecialFoodDetails",
              params: { id: item.id },
            })
          }
        >
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {item.eventName}
          </Text>
          <Text>Coordinator: {item.coordinatorName}</Text>
          <Text>Date: {item.date}</Text>

          <Text
            style={{
              marginTop: 5,
              fontWeight: "bold",
              color: getStatusColor(item.status),
            }}
          >
            Status: {item.status?.toUpperCase()}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}
