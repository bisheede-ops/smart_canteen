// // import { useLocalSearchParams } from "expo-router";
// // import {
// //   doc,
// //   onSnapshot,
// //   updateDoc,
// //   addDoc,
// //   collection,
// //   serverTimestamp,
// // } from "firebase/firestore";
// // import { useEffect, useState } from "react";
// // import { ScrollView, Text, TouchableOpacity, Alert } from "react-native";
// // import { db } from "../../../firebaseConfig";

// // export default function SpecialFoodDetails() {
// //   const { id } = useLocalSearchParams();
// //   const [data, setData] = useState(null);

// //   // 🔥 REAL-TIME LISTENER
// //   useEffect(() => {
// //     if (!id) return;

// //     const docRef = doc(db, "specialFoodRequests", id);

// //     const unsubscribe = onSnapshot(docRef, (snapshot) => {
// //       if (snapshot.exists()) {
// //         console.log("LIVE DETAILS:", snapshot.data());
// //         setData(snapshot.data());
// //       }
// //     });

// //     return () => unsubscribe(); // cleanup
// //   }, [id]);

// //   if (!data) return null;

// //   const updateStatus = async (newStatus) => {
// //     const orderMap = {
// //       pending: 1,
// //       accepted: 2,
// //       rejected: 3,
// //     };
// //     setData((prev) => ({
// //       ...prev,
// //       status: newStatus,
// //       statusOrder: orderMap[newStatus],
// //     }));
// //     try {

// //       await updateDoc(doc(db, "specialFoodRequests", id), {
// //         status: newStatus,
// //         statusOrder: orderMap[newStatus],
// //       });
// //         if (!data.userId) {
// //           console.log(" userId missing");
// //           return;
// //         }
// //         console.log("Notification userId:", data.userId);

// //        await addDoc(collection(db, "notifications"), {
// //          userId: data.userId, // IMPORTANT

// //          title: "Special Food Request",
// //          message:
// //            newStatus === "accepted"
// //              ? `Your request for "${data.eventName}" has been ACCEPTED`
// //              : `Your request for "${data.eventName}" has been REJECTED`,
// //          requestId: id,
// //          status: newStatus,
// //          isRead: false,
// //          createdAt: serverTimestamp(),
// //        });

// //       Alert.alert("Success", `Request ${newStatus.toUpperCase()} successfully`);
// //     } catch (error) {
// //       setData((prev) => ({
// //         ...prev,
// //         status: "pending",
// //         statusOrder: 1,
// //       }));

// //       console.log(error);
// //       Alert.alert("Error", "Error updating request");
// //     }
// //   };

// //   const sendPushNotification = async (expoPushToken, status) => {
// //     if (!expoPushToken) return;

// //     const message = {
// //       to: expoPushToken,
// //       sound: "default",
// //       title: "Special Food Request",
// //       body:
// //         status === "accepted"
// //           ? "Your special food request has been ACCEPTED ✅"
// //           : "Your special food request has been REJECTED ❌",
// //     };

// //     try {
// //       await fetch("https://exp.host/--/api/v2/push/send", {
// //         method: "POST",
// //         headers: {
// //           Accept: "application/json",
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify(message),
// //       });
// //     } catch (error) {
// //       console.log("Notification error:", error);
// //     }
// //   };

// //   return (
// //     <ScrollView style={{ padding: 15 }}>
// //       <Text style={{ fontSize: 18, fontWeight: "bold" }}>{data.eventName}</Text>

// //       <Text
// //         style={{
// //           marginVertical: 5,
// //           fontWeight: "bold",
// //           color:
// //             data.status === "accepted"
// //               ? "green"
// //               : data.status === "rejected"
// //                 ? "red"
// //                 : "orange",
// //         }}
// //       >
// //         Status: {data.status?.toUpperCase()}
// //       </Text>

// //       <Text>Coordinator: {data.coordinatorName}</Text>
// //       <Text>Contact: {data.contact}</Text>
// //       <Text>Role: {data.role}</Text>
// //       <Text>Date: {data.date}</Text>
// //       <Text>Quantity: {data.quantity}</Text>
// //       <Text>Delivery: {data.delivery}</Text>

// //       <Text style={{ marginTop: 10, fontWeight: "bold" }}>
// //         Food & Time Details
// //       </Text>

// //       {data.foodRequests.map((item, index) => (
// //         <Text key={index}>
// //           • {item.foodItem} – {item.time}
// //         </Text>
// //       ))}

// //       {data.description && (
// //         <>
// //           <Text style={{ marginTop: 10, fontWeight: "bold" }}>Description</Text>
// //           <Text>{data.description}</Text>
// //         </>
// //       )}

// //       {data.status === "pending" && (
// //         <>
// //           <TouchableOpacity
// //             style={{
// //               backgroundColor: "green",
// //               padding: 15,
// //               borderRadius: 8,
// //               marginTop: 20,
// //             }}
// //             onPress={() => updateStatus("accepted")}
// //           >
// //             <Text
// //               style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
// //             >
// //               Accept Request
// //             </Text>
// //           </TouchableOpacity>

// //           <TouchableOpacity
// //             style={{
// //               backgroundColor: "red",
// //               padding: 15,
// //               borderRadius: 8,
// //               marginTop: 10,
// //             }}
// //             onPress={() => updateStatus("rejected")}
// //           >
// //             <Text
// //               style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
// //             >
// //               Reject Request
// //             </Text>
// //           </TouchableOpacity>
// //         </>
// //       )}
// //     </ScrollView>
// //   );
// // }
// import { useLocalSearchParams } from "expo-router";
// import {
//   addDoc,
//   collection,
//   doc,
//   onSnapshot,
//   serverTimestamp,
//   updateDoc,
// } from "firebase/firestore";
// import { useEffect, useState } from "react";
// import { Alert, ScrollView, Text, TouchableOpacity } from "react-native";
// import Toast from "react-native-toast-message";
// import { db } from "../../../firebaseConfig";

// export default function SpecialFoodDetails() {
//   const { id } = useLocalSearchParams();
//   const [data, setData] = useState(null);

//   // 🔥 REAL-TIME LISTENER
//   useEffect(() => {
//     if (!id) return;

//     const docRef = doc(db, "specialFoodRequests", id);
//     const unsubscribe = onSnapshot(docRef, (snapshot) => {
//       if (snapshot.exists()) {
//         setData(snapshot.data());
//       }
//     });

//     return () => unsubscribe();
//   }, [id]);

//   if (!data) return null;

//   const updateStatus = async (newStatus) => {
//     const orderMap = {
//       pending: 1,
//       accepted: 2,
//       rejected: 3,
//     };

//     try {
//       // 1️⃣ Update request status
//       await updateDoc(doc(db, "specialFoodRequests", id), {
//         status: newStatus,
//         statusOrder: orderMap[newStatus],
//       });

//       // 2️⃣ Send notification to user
//       if (!data.userId) {
//         console.log("❌ userId missing");
//         return;
//       }

//       await addDoc(collection(db, "notifications"), {
//         userId: data.userId,
//         title: "Special Food Request",
//         message:
//           newStatus === "accepted"
//             ? `Your request for "${data.eventName}" has been ACCEPTED`
//             : `Your request for "${data.eventName}" has been REJECTED`,
//         requestId: id,
//         status: newStatus,
//         isRead: false,
//         createdAt: serverTimestamp(),
//       });

//       Toast.show({
//         type: "success",
//         text1: "Success",
//         text2: `Request ${newStatus.toUpperCase()} successfully`,
//       });
//     } catch (error) {
//       console.log(error);
//       Toast.show({
//         type: "error",
//         text1: "Error ",
//         text2: "Failed to update request",
//       });
//     }
//   };
//   const confirmStatusChange = (status) => {
//     Alert.alert(
//       "Confirm Action",
//       `Are you sure you want to ${status.toUpperCase()} this request?`,
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Yes",
//           onPress: () => updateStatus(status),
//         },
//       ],
//       { cancelable: true },
//     );
//   };

//   return (
//     <ScrollView style={{ padding: 15,paddingTop:40, }}>
//       <Text style={{ fontSize: 18, fontWeight: "bold" }}>{data.eventName}</Text>

//       <Text
//         style={{
//           marginVertical: 5,
//           fontWeight: "bold",
//           color:
//             data.status === "accepted"
//               ? "green"
//               : data.status === "rejected"
//                 ? "red"
//                 : "orange",
//         }}
//       >
//         Status: {data.status?.toUpperCase()}
//       </Text>

//       <Text>Coordinator: {data.coordinatorName}</Text>
//       <Text>Contact: {data.contact}</Text>
//       <Text>Role: {data.role}</Text>
//       {/* <Text>Date: {data.date}</Text> */}
//       <Text>
//         Date: {data.schedule?.[0]?.date || "No date"}
//       </Text>
//       <Text>Quantity: {data.quantity}</Text>
//       <Text>Delivery: {data.delivery}</Text>
//       {data.delivery === "Yes" && (
//         <Text>Delivery Location: {data.deliveryLocation}</Text>
//       )}
//       <Text style={{ marginTop: 10, fontWeight: "bold" }}>
//         Food & Time Details
//       </Text>

//       {data.schedule?.map((day, index) => (
//         <Text key={index} style={{ marginTop: 5 }}>
//            {day.date}
//           {day.items.map((item, idx) => (
//             <Text key={idx}>
//               {"\n"} • {item.food} – {item.time}
//             </Text>
//           ))}
//         </Text>
//       ))}

//       {data.description && (
//         <>
//           <Text style={{ marginTop: 10, fontWeight: "bold" }}>Description</Text>
//           <Text>{data.description}</Text>
//         </>
//       )}

//       {data.status === "pending" && (
//         <>
//           <TouchableOpacity
//             style={{
//               backgroundColor: "green",
//               padding: 15,
//               borderRadius: 8,
//               marginTop: 20,
//             }}
//             onPress={() => confirmStatusChange("accepted")}
//           >
//             <Text
//               style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
//             >
//               Accept Request
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={{
//               backgroundColor: "red",
//               padding: 15,
//               borderRadius: 8,
//               marginTop: 10,
//             }}
//             onPress={() => confirmStatusChange("rejected")}
//           >
//             <Text
//               style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
//             >
//               Reject Request
//             </Text>
//           </TouchableOpacity>
//         </>
//       )}
//     </ScrollView>
//   );
// }

import { useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { db } from "../../../firebaseConfig";

export default function SpecialFoodDetails() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState(null);

  // 🔥 REAL-TIME LISTENER
  useEffect(() => {
    if (!id) return;

    const docRef = doc(db, "specialFoodRequests", id);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.data());
      }
    });

    return () => unsubscribe();
  }, [id]);

  if (!data) return null;

  // ---------- STATUS UPDATE ----------
  const updateStatus = async (newStatus) => {
    const orderMap = {
      pending: 1,
      accepted: 2,
      rejected: 3,
    };

    try {
      await updateDoc(doc(db, "specialFoodRequests", id), {
        status: newStatus,
        statusOrder: orderMap[newStatus],
      });

      if (!data.userId) {
        console.log("❌ userId missing");
        return;
      }

      await addDoc(collection(db, "notifications"), {
        userId: data.userId,
        title: "Special Food Request",
        message:
          newStatus === "accepted"
            ? `Your request for "${data.eventName}" has been ACCEPTED`
            : `Your request for "${data.eventName}" has been REJECTED`,
        requestId: id,
        status: newStatus,
        isRead: false,
        createdAt: serverTimestamp(),
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: `Request ${newStatus.toUpperCase()} successfully`,
      });
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update request",
      });
    }
  };

  const confirmStatusChange = (status) => {
    Alert.alert(
      "Confirm Action",
      `Are you sure you want to ${status.toUpperCase()} this request?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: () => updateStatus(status) },
      ],
      { cancelable: true }
    );
  };

  // ---------- UI ----------
  return (
    <ScrollView
      style={{
        padding: 15,
        paddingTop: 40,
        backgroundColor: "#f9fafb",
      }}
    >
      {/* TITLE */}
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        {data.eventName}
      </Text>

      {/* STATUS BADGE */}
      <Text
        style={{
          alignSelf: "flex-start",
          backgroundColor: getStatusColor(data.status),
          color: "#fff",
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 20,
          fontWeight: "bold",
          marginVertical: 10,
        }}
      >
        {data.status?.toUpperCase()}
      </Text>

      {/* DETAILS */}
      <Section title="Request Details">
        <Row label="Coordinator" value={data.coordinatorName} />
        <Row label="Contact" value={data.contact} />
        <Row label="Role" value={data.role} />
        <Row label="Quantity" value={data.quantity} />
        <Row label="Delivery" value={data.delivery} />
        {data.delivery === "Yes" && (
          <Row label="Location" value={data.deliveryLocation} />
        )}
      </Section>

      {/* DATE & FOOD */}
      <Section title="Food Schedule">
        {data.schedule?.map((day, index) => (
          <View
            key={index}
            style={{
              backgroundColor: "#eef2ff",
              padding: 10,
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
              📅 {day.date}
            </Text>
            {day.items.map((item, idx) => (
              <Text key={idx}>
                • {item.food} — {item.time}
              </Text>
            ))}
          </View>
        ))}
      </Section>

      {/* DESCRIPTION */}
      {data.description && (
        <Section title="Description">
          <Text>{data.description}</Text>
        </Section>
      )}

      {/* ACTION BUTTONS */}
      {data.status === "pending" && (
        <>
          <ActionButton
            label="Accept Request"
            color="#16a34a"
            onPress={() => confirmStatusChange("accepted")}
          />
          <ActionButton
            label="Reject Request"
            color="#dc2626"
            onPress={() => confirmStatusChange("rejected")}
          />
          <View style={{ paddingBottom: 100 }} />
        </>
      )}
    </ScrollView>
  );
}

// ---------- HELPER COMPONENTS ----------

const Section = ({ title, children }) => (
  <View
    style={{
      backgroundColor: "#fff",
      padding: 15,
      borderRadius: 12,
      marginBottom: 15,
      elevation: 2,
    }}
  >
    <Text style={{ fontWeight: "bold", marginBottom: 8 }}>{title}</Text>
    {children}
  </View>
);

const Row = ({ label, value }) => (
  <Text style={{ marginBottom: 4 }}>
    <Text style={{ fontWeight: "bold" }}>{label}: </Text>
    {value}
  </Text>
);

const ActionButton = ({ label, color, onPress }) => (
  <TouchableOpacity
    style={{
      backgroundColor: color,
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
    }}
    onPress={onPress}
  >
    <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>
      {label}
    </Text>
  </TouchableOpacity>
);

const getStatusColor = (status) => {
  if (status === "accepted") return "#16a34a";
  if (status === "rejected") return "#dc2626";
  return "#f59e0b";
};