// import { Ionicons } from "@expo/vector-icons";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { Picker } from "@react-native-picker/picker";
// import { useState } from "react";
// import {
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// import { addDoc, collection, serverTimestamp } from "firebase/firestore";
// import { auth, db } from "../../../firebaseConfig";

// export default function SpecialFoodRequest() {
//   // -------- BASIC DETAILS --------
//   const [coordinatorName, setCoordinatorName] = useState("");
//   const [contact, setContact] = useState("");
//   const [eventName, setEventName] = useState("");
//   const [role, setRole] = useState("Student");
//   const [quantity, setQuantity] = useState("");
//   const [description, setDescription] = useState("");
//   const [delivery, setDelivery] = useState("No");
//   const [deliveryLocation, setDeliveryLocation] = useState("");

//   // -------- MULTI DATE + FOOD --------
//   const [schedule, setSchedule] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   const [tempFood, setTempFood] = useState("");
//   const [tempTime, setTempTime] = useState(new Date());
//   const [showTimePicker, setShowTimePicker] = useState(false);

//   const [errors, setErrors] = useState({});

//   // -------- HELPERS --------
//   const formatDate = (d) => d.toDateString();

//   const formatTime = (d) => {
//     let h = d.getHours();
//     let m = d.getMinutes();
//     let ampm = h >= 12 ? "PM" : "AM";
//     h = h % 12 || 12;
//     m = m < 10 ? "0" + m : m;
//     return `${h}:${m} ${ampm}`;
//   };

//   // -------- ADD FOOD --------
//   const addFoodToDate = () => {
//     if (!tempFood.trim()) {
//       Alert.alert("Error", "Food item required");
//       return;
//     }

//     const dateStr = formatDate(selectedDate);

//     setSchedule((prev) => {
//       const existing = prev.find((d) => d.date === dateStr);

//       if (existing) {
//         return prev.map((d) =>
//           d.date === dateStr
//             ? {
//                 ...d,
//                 items: [
//                   ...d.items,
//                   { food: tempFood, time: formatTime(tempTime) },
//                 ],
//               }
//             : d,
//         );
//       }

//       return [
//         ...prev,
//         {
//           date: dateStr,
//           items: [{ food: tempFood, time: formatTime(tempTime) }],
//         },
//       ];
//     });

//     setTempFood("");
//   };

//   // -------- VALIDATION --------
//   const validateForm = () => {
//     let e = {};

//     if (!coordinatorName.trim()) e.coordinatorName = "Required";
//     if (!/^[6-9][0-9]{9}$/.test(contact)) e.contact = "Invalid number";

//     if (!eventName.trim()) {
//       e.eventName = "Required";
//     } else {
//       // must contain at least one alphabet
//       const hasAlphabet = /.*[A-Za-z].*/;
//       if (!hasAlphabet.test(eventName)) {
//         e.eventName = "Event name must contain at least one alphabet";
//       }
//     }
//     if (!quantity || Number(quantity) <= 0) e.quantity = "Invalid quantity";
//     if (schedule.length === 0) e.schedule = "Add food details";
//     // if (delivery === "Yes" && !location) e.location = "Location required";
//     if (delivery === "Yes" && !deliveryLocation.trim())
//       e.deliveryLocation = "Location required";

//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   // -------- SUBMIT --------
//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     try {
//       await addDoc(collection(db, "specialFoodRequests"), {
//         userId: auth.currentUser.uid,
//         coordinatorName,
//         contact,
//         eventName,
//         role,
//         quantity,
//         description,
//         delivery,
//         deliveryLocation: delivery === "Yes" ? deliveryLocation : null,
//         schedule,
//         status: "pending",
//         statusOrder: 1,
//         createdAt: serverTimestamp(),
//       });

//       Alert.alert("Success", "Request submitted");

//       // RESET
//       setCoordinatorName("");
//       setContact("");
//       setEventName("");
//       setRole("Student");
//       setQuantity("");
//       setDescription("");
//       setDelivery("No");
//       setSchedule([]);

//       setErrors({});
//     } catch (err) {
//       console.log(err);
//       Alert.alert("Error", "Submission failed");
//     }
//   };

//   // -------- UI --------
//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <ScrollView contentContainerStyle={styles.container}>
//         <Text style={styles.heading}>
//           <Ionicons name="restaurant-outline" size={24} /> Special Food Request
//         </Text>

//         <TextInput
//           style={styles.input}
//           placeholder="Coordinator Name"
//           value={coordinatorName}
//           onChangeText={setCoordinatorName}
//         />
//         {errors.coordinatorName && (
//           <Text style={styles.error}>{errors.coordinatorName}</Text>
//         )}

//         <TextInput
//           style={styles.input}
//           placeholder="Contact Number"
//           keyboardType="numeric"
//           maxLength={10}
//           value={contact}
//           onChangeText={setContact}
//         />
//         {errors.contact && <Text style={styles.error}>{errors.contact}</Text>}

//         <TextInput
//           style={styles.input}
//           placeholder="Event Name"
//           value={eventName}
//           onChangeText={setEventName}
//         />
//         {errors.eventName && (
//           <Text style={styles.error}>{errors.eventName}</Text>
//         )}

//         <View style={styles.picker}>
//           <Picker selectedValue={role} onValueChange={setRole}>
//             <Picker.Item label="Student" value="Student" />
//             <Picker.Item label="Staff" value="Staff" />
//             <Picker.Item label="Others" value="Others" />
//           </Picker>
//         </View>

//         {/* DATE */}
//         <TouchableOpacity
//           style={styles.dateBtn}
//           onPress={() => setShowDatePicker(true)}
//         >
//           <Text>Select Date: {formatDate(selectedDate)}</Text>
//         </TouchableOpacity>

//         {showDatePicker && (
//           <DateTimePicker
//             value={selectedDate}
//             mode="date"
//             onChange={(e, d) => {
//               setShowDatePicker(false);
//               if (d) setSelectedDate(d);
//             }}
//           />
//         )}

//         {/* FOOD + TIME */}
//         <TextInput
//           style={styles.input}
//           placeholder="Food Item (eg: Chaya + Pazhampori)"
//           value={tempFood}
//           onChangeText={setTempFood}
//         />

//         <TouchableOpacity
//           style={styles.dateBtn}
//           onPress={() => setShowTimePicker(true)}
//         >
//           <Text>Select Time: {formatTime(tempTime)}</Text>
//         </TouchableOpacity>

//         {showTimePicker && (
//           <DateTimePicker
//             value={tempTime}
//             mode="time"
//             onChange={(e, t) => {
//               setShowTimePicker(false);
//               if (t) setTempTime(t);
//             }}
//           />
//         )}

//         <TouchableOpacity style={styles.addBtn} onPress={addFoodToDate}>
//           <Text style={styles.addText}>Add Food</Text>
//         </TouchableOpacity>

//         {/* PREVIEW */}
//         {schedule.map((d, i) => (
//           <View key={i} style={styles.card}>
//             <Text style={{ fontWeight: "bold" }}>{d.date}</Text>
//             {d.items.map((it, idx) => (
//               <Text key={idx}>
//                 • {it.food} – {it.time}
//               </Text>
//             ))}
//           </View>
//         ))}
//         {errors.schedule && <Text style={styles.error}>{errors.schedule}</Text>}

//         <TextInput
//           style={styles.input}
//           placeholder="Quantity"
//           keyboardType="numeric"
//           value={quantity}
//           onChangeText={setQuantity}
//         />
//         {errors.quantity && <Text style={styles.error}>{errors.quantity}</Text>}

//         <TextInput
//           style={styles.textArea}
//           placeholder="Description"
//           multiline
//           value={description}
//           onChangeText={setDescription}
//         />

//         <View style={styles.picker}>
//           <Picker selectedValue={delivery} onValueChange={setDelivery}>
//             <Picker.Item label="Delivery - No" value="No" />
//             <Picker.Item label="Delivery - Yes" value="Yes" />
//           </Picker>
//         </View>
//         {/* 🔹 DELIVERY LOCATION TEXTAREA */}
//         {delivery === "Yes" && (
//           <>
//             <TextInput
//               style={styles.textArea}
//               placeholder="Enter delivery location (Building / Block / Landmark)"
//               value={deliveryLocation}
//               onChangeText={setDeliveryLocation}
//               multiline
//             />
//             {errors.deliveryLocation && (
//               <Text style={styles.error}>{errors.deliveryLocation}</Text>
//             )}
//           </>
//         )}

//         <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
//           <Text style={styles.submitText}>Submit Request</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// // -------- STYLES --------
// const styles = StyleSheet.create({
//   container: { padding: 20, backgroundColor: "#F9FAFB" },
//   heading: {
//     fontSize: 22,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   input: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 6,
//   },
//   picker: {
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 12,
//   },
//   dateBtn: {
//     backgroundColor: "#f6dcb6",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   addBtn: {
//     backgroundColor: "#f97316",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   addText: { color: "#fff", fontWeight: "bold" },
//   card: {
//     backgroundColor: "#e0f2fe",
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 6,
//   },
//   textArea: {
//     backgroundColor: "#fff",
//     padding: 12,
//     height: 80,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 12,
//   },
//   mapBtn: {
//     backgroundColor: "#d1fae5",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   submitBtn: { backgroundColor: "#f97316", padding: 15, borderRadius: 10 },
//   submitText: {
//     color: "#fff",
//     textAlign: "center",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   error: { color: "red", fontSize: 12, marginBottom: 6 },
// });

// import { Ionicons } from "@expo/vector-icons";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { Picker } from "@react-native-picker/picker";
// import { useState } from "react";
// import {
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// import { addDoc, collection, serverTimestamp } from "firebase/firestore";
// import { auth, db } from "../../../firebaseConfig";

// export default function SpecialFoodRequest() {
//   // -------- BASIC DETAILS --------
//   const [coordinatorName, setCoordinatorName] = useState("");
//   const [contact, setContact] = useState("");
//   const [eventName, setEventName] = useState("");
//   const [role, setRole] = useState("Student");
//   const [quantity, setQuantity] = useState("");
//   const [description, setDescription] = useState("");
//   const [delivery, setDelivery] = useState("No");
//   const [deliveryLocation, setDeliveryLocation] = useState("");

//   // -------- MULTI DATE + FOOD --------
//   const [schedule, setSchedule] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   const [tempFood, setTempFood] = useState("");
//   const [tempTime, setTempTime] = useState(new Date());
//   const [showTimePicker, setShowTimePicker] = useState(false);

//   const [errors, setErrors] = useState({});

//   // -------- HELPERS --------
//   const formatDate = (d) => d.toDateString();

//   const formatTime = (d) => {
//     let h = d.getHours();
//     let m = d.getMinutes();
//     let ampm = h >= 12 ? "PM" : "AM";
//     h = h % 12 || 12;
//     m = m < 10 ? "0" + m : m;
//     return `${h}:${m} ${ampm}`;
//   };

//   // -------- ADD FOOD --------
//   const addFoodToDate = () => {
//     if (!tempFood.trim()) {
//       Alert.alert("Error", "Food item required");
//       return;
//     }

//     const dateStr = formatDate(selectedDate);

//     setSchedule((prev) => {
//       const existing = prev.find((d) => d.date === dateStr);

//       if (existing) {
//         return prev.map((d) =>
//           d.date === dateStr
//             ? {
//                 ...d,
//                 items: [
//                   ...d.items,
//                   { food: tempFood, time: formatTime(tempTime) },
//                 ],
//               }
//             : d,
//         );
//       }

//       return [
//         ...prev,
//         {
//           date: dateStr,
//           items: [{ food: tempFood, time: formatTime(tempTime) }],
//         },
//       ];
//     });

//     setTempFood("");
//   };

//   // -------- VALIDATION --------
//   const validateForm = () => {
//     let e = {};

//     if (!coordinatorName.trim()) {
//       e.coordinatorName = "Required";
//     } else if (/\d/.test(coordinatorName)) {
//       e.coordinatorName = "Numbers are not allowed";
//     }

//     if (!/^[6-9][0-9]{9}$/.test(contact)) e.contact = "Invalid number";

//     if (!eventName.trim()) {
//       e.eventName = "Required";
//     } else {
//       // must contain at least one alphabet
//       const hasAlphabet = /.*[A-Za-z].*/;
//       if (!hasAlphabet.test(eventName)) {
//         e.eventName = "Event name must contain at least one alphabet";
//       }
//     }
//     if (!quantity || Number(quantity) <= 0) e.quantity = "Invalid quantity";
//     if (schedule.length === 0) e.schedule = "Add food details";
//     // if (delivery === "Yes" && !location) e.location = "Location required";
//     if (delivery === "Yes" && !deliveryLocation.trim())
//       e.deliveryLocation = "Location required";

//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   // -------- SUBMIT --------
//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     try {
//       await addDoc(collection(db, "specialFoodRequests"), {
//         userId: auth.currentUser.uid,
//         coordinatorName,
//         contact,
//         eventName,
//         role,
//         quantity,
//         description,
//         delivery,
//         deliveryLocation: delivery === "Yes" ? deliveryLocation : null,
//         schedule,
//         status: "pending",
//         statusOrder: 1,
//         createdAt: serverTimestamp(),
//       });

//       Alert.alert("Success", "Request submitted");

//       // RESET
//       setCoordinatorName("");
//       setContact("");
//       setEventName("");
//       setRole("Student");
//       setQuantity("");
//       setDescription("");
//       setDelivery("No");
//       setSchedule([]);

//       setErrors({});
//     } catch (err) {
//       console.log(err);
//       Alert.alert("Error", "Submission failed");
//     }
//   };

//   // -------- UI --------
//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <ScrollView contentContainerStyle={styles.container}>
//         <Text style={styles.heading}>
//           <Ionicons name="restaurant-outline" size={24} /> Special Food Request
//         </Text>

//         <TextInput
//           style={styles.input}
//           placeholder="Coordinator Name"
//           value={coordinatorName}
//           onChangeText={setCoordinatorName}
//         />
//         {errors.coordinatorName && (
//           <Text style={styles.error}>{errors.coordinatorName}</Text>
//         )}

//         <TextInput
//           style={styles.input}
//           placeholder="Contact Number"
//           keyboardType="numeric"
//           maxLength={10}
//           value={contact}
//           onChangeText={setContact}
//         />
//         {errors.contact && <Text style={styles.error}>{errors.contact}</Text>}

//         <TextInput
//           style={styles.input}
//           placeholder="Event Name"
//           value={eventName}
//           onChangeText={setEventName}
//         />
//         {errors.eventName && (
//           <Text style={styles.error}>{errors.eventName}</Text>
//         )}

//         <View style={styles.picker}>
//           <Picker selectedValue={role} onValueChange={setRole}>
//             <Picker.Item label="Student" value="Student" />
//             <Picker.Item label="Staff" value="Staff" />
//             <Picker.Item label="Others" value="Others" />
//           </Picker>
//         </View>

//         {/* DATE */}
//         <TouchableOpacity
//           style={styles.dateBtn}
//           onPress={() => setShowDatePicker(true)}
//         >
//           <Text>Select Date: {formatDate(selectedDate)}</Text>
//         </TouchableOpacity>

//         {showDatePicker && (
//           <DateTimePicker
//             value={selectedDate}
//             mode="date"
//             onChange={(e, d) => {
//               setShowDatePicker(false);
//               if (d) setSelectedDate(d);
//             }}
//           />
//         )}

//         {/* FOOD + TIME */}
//         <TextInput
//           style={styles.input}
//           placeholder="Food Item (eg: Chaya + Pazhampori)"
//           value={tempFood}
//           onChangeText={setTempFood}
//         />

//         <TouchableOpacity
//           style={styles.dateBtn}
//           onPress={() => setShowTimePicker(true)}
//         >
//           <Text>Select Time: {formatTime(tempTime)}</Text>
//         </TouchableOpacity>

//         {showTimePicker && (
//           <DateTimePicker
//             value={tempTime}
//             mode="time"
//             onChange={(e, t) => {
//               setShowTimePicker(false);
//               if (t) setTempTime(t);
//             }}
//           />
//         )}

//         <TouchableOpacity style={styles.addBtn} onPress={addFoodToDate}>
//           <Text style={styles.addText}>Add Food</Text>
//         </TouchableOpacity>

//         {/* PREVIEW */}
//         {schedule.map((d, i) => (
//           <View key={i} style={styles.card}>
//             <Text style={{ fontWeight: "bold" }}>{d.date}</Text>
//             {d.items.map((it, idx) => (
//               <Text key={idx}>
//                 • {it.food} – {it.time}
//               </Text>
//             ))}
//           </View>
//         ))}
//         {errors.schedule && <Text style={styles.error}>{errors.schedule}</Text>}

//         <TextInput
//           style={styles.input}
//           placeholder="Quantity"
//           keyboardType="numeric"
//           value={quantity}
//           onChangeText={setQuantity}
//         />
//         {errors.quantity && <Text style={styles.error}>{errors.quantity}</Text>}

//         <TextInput
//           style={styles.textArea}
//           placeholder="Description"
//           multiline
//           value={description}
//           onChangeText={setDescription}
//         />

//         <View style={styles.picker}>
//           <Picker selectedValue={delivery} onValueChange={setDelivery}>
//             <Picker.Item label="Delivery - No" value="No" />
//             <Picker.Item label="Delivery - Yes" value="Yes" />
//           </Picker>
//         </View>
//         {/* 🔹 DELIVERY LOCATION TEXTAREA */}
//         {delivery === "Yes" && (
//           <>
//             <TextInput
//               style={styles.textArea}
//               placeholder="Enter delivery location (Building / Block / Landmark)"
//               value={deliveryLocation}
//               onChangeText={setDeliveryLocation}
//               multiline
//             />
//             {errors.deliveryLocation && (
//               <Text style={styles.error}>{errors.deliveryLocation}</Text>
//             )}
//           </>
//         )}

//         <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
//           <Text style={styles.submitText}>Submit Request</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// // -------- STYLES --------
// const styles = StyleSheet.create({
//   container: { padding: 20, backgroundColor: "#F9FAFB" },
//   heading: {
//     fontSize: 22,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   input: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 6,
//   },
//   picker: {
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 12,
//   },
//   dateBtn: {
//     backgroundColor: "#f6dcb6",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   addBtn: {
//     backgroundColor: "#f97316",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   addText: { color: "#fff", fontWeight: "bold" },
//   card: {
//     backgroundColor: "#e0f2fe",
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 6,
//   },
//   textArea: {
//     backgroundColor: "#fff",
//     padding: 12,
//     height: 80,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 12,
//   },
//   mapBtn: {
//     backgroundColor: "#d1fae5",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   submitBtn: { backgroundColor: "#f97316", padding: 15, borderRadius: 10 },
//   submitText: {
//     color: "#fff",
//     textAlign: "center",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   error: { color: "red", fontSize: 12, marginBottom: 6 },
// });


import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../firebaseConfig";

export default function SpecialFoodRequest() {
  // -------- BASIC DETAILS --------
  const [coordinatorName, setCoordinatorName] = useState("");
  const [contact, setContact] = useState("");
  const [eventName, setEventName] = useState("");
  const [role, setRole] = useState("Student");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [delivery, setDelivery] = useState("No");
  const [deliveryLocation, setDeliveryLocation] = useState("");

  // -------- MULTI DATE + FOOD --------
  const [schedule, setSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [tempFood, setTempFood] = useState("");
  const [tempTime, setTempTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [errors, setErrors] = useState({});

  // -------- HELPERS --------
  const formatDate = (d) => d.toDateString();

  const formatTime = (d) => {
    let h = d.getHours();
    let m = d.getMinutes();
    let ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    m = m < 10 ? "0" + m : m;
    return `${h}:${m} ${ampm}`;
  };

  // -------- ADD FOOD --------
  const addFoodToDate = () => {
    if (!tempFood.trim()) {
      Alert.alert("Error", "Food item required");
      return;
    }

    const dateStr = formatDate(selectedDate);

    setSchedule((prev) => {
      const existing = prev.find((d) => d.date === dateStr);

      if (existing) {
        return prev.map((d) =>
          d.date === dateStr
            ? {
                ...d,
                items: [
                  ...d.items,
                  { food: tempFood, time: formatTime(tempTime) },
                ],
              }
            : d,
        );
      }

      return [
        ...prev,
        {
          date: dateStr,
          items: [{ food: tempFood, time: formatTime(tempTime) }],
        },
      ];
    });

    setTempFood("");
  };

  // -------- VALIDATION --------
  const validateForm = () => {
    let e = {};

    if (!coordinatorName.trim()) {
      e.coordinatorName = "Required";
    } else if (/\d/.test(coordinatorName)) {
      e.coordinatorName = "Numbers are not allowed";
    }

    if (!/^[6-9][0-9]{9}$/.test(contact)) e.contact = "Invalid number";

    if (!eventName.trim()) {
      e.eventName = "Required";
    } else {
      // must contain at least one alphabet
      const hasAlphabet = /.*[A-Za-z].*/;
      if (!hasAlphabet.test(eventName)) {
        e.eventName = "Event name must contain at least one alphabet";
      }
    }
    if (!quantity || Number(quantity) <= 0) e.quantity = "Invalid quantity";
    if (schedule.length === 0) e.schedule = "Add food details";
    // if (delivery === "Yes" && !location) e.location = "Location required";
    if (delivery === "Yes" && !deliveryLocation.trim())
      e.deliveryLocation = "Location required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // -------- SUBMIT --------
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await addDoc(collection(db, "specialFoodRequests"), {
        userId: auth.currentUser.uid,
        coordinatorName,
        contact,
        eventName,
        role,
        quantity,
        description,
        delivery,
        deliveryLocation: delivery === "Yes" ? deliveryLocation : null,
        schedule,
        status: "pending",
        statusOrder: 1,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Request submitted");

      // RESET
      setCoordinatorName("");
      setContact("");
      setEventName("");
      setRole("Student");
      setQuantity("");
      setDescription("");
      setDelivery("No");
      setSchedule([]);

      setErrors({});
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Submission failed");
    }
  };

  // -------- UI --------
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>
          <Ionicons name="restaurant-outline" size={24} /> Special Food Request
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Coordinator Name"
          value={coordinatorName}
          onChangeText={setCoordinatorName}
        />
        {errors.coordinatorName && (
          <Text style={styles.error}>{errors.coordinatorName}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Contact Number"
          keyboardType="numeric"
          maxLength={10}
          value={contact}
          onChangeText={setContact}
        />
        {errors.contact && <Text style={styles.error}>{errors.contact}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Event Name"
          value={eventName}
          onChangeText={setEventName}
        />
        {errors.eventName && (
          <Text style={styles.error}>{errors.eventName}</Text>
        )}

        <View style={styles.picker}>
          <Picker selectedValue={role} onValueChange={setRole}>
            <Picker.Item label="Student" value="Student" />
            <Picker.Item label="Staff" value="Staff" />
            <Picker.Item label="Others" value="Others" />
          </Picker>
        </View>

        {/* DATE */}
        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>Select Date: {formatDate(selectedDate)}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            onChange={(e, d) => {
              setShowDatePicker(false);
              if (d) setSelectedDate(d);
            }}
          />
        )}

        {/* FOOD + TIME */}
        <TextInput
          style={styles.input}
          placeholder="Food Item (eg: Chaya + Pazhampori)"
          value={tempFood}
          onChangeText={setTempFood}
        />

        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => setShowTimePicker(true)}
        >
          <Text>Select Time: {formatTime(tempTime)}</Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={tempTime}
            mode="time"
            onChange={(e, t) => {
              setShowTimePicker(false);
              if (t) setTempTime(t);
            }}
          />
        )}

        <TouchableOpacity style={styles.addBtn} onPress={addFoodToDate}>
          <Text style={styles.addText}>Add Food</Text>
        </TouchableOpacity>

        {/* PREVIEW */}
        {schedule.map((d, i) => (
          <View key={i} style={styles.card}>
            <Text style={{ fontWeight: "bold" }}>{d.date}</Text>
            {d.items.map((it, idx) => (
              <Text key={idx}>
                • {it.food} – {it.time}
              </Text>
            ))}
          </View>
        ))}
        {errors.schedule && <Text style={styles.error}>{errors.schedule}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Quantity"
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />
        {errors.quantity && <Text style={styles.error}>{errors.quantity}</Text>}

        <TextInput
          style={styles.textArea}
          placeholder="Description"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* <View style={styles.picker}>
          <Picker selectedValue={delivery} onValueChange={setDelivery}>
            <Picker.Item label="Delivery - No" value="No" />
            <Picker.Item label="Delivery - Yes" value="Yes" />
          </Picker>
        </View>
       
        {delivery === "Yes" && (
          <>
            <TextInput
              style={styles.textArea}
              placeholder="Enter delivery location (Building / Block / Landmark)"
              value={deliveryLocation}
              onChangeText={setDeliveryLocation}
              multiline
            />
            {errors.deliveryLocation && (
              <Text style={styles.error}>{errors.deliveryLocation}</Text>
            )}
          </>
        )} */}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Request</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// -------- STYLES --------
const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F9FAFB" },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 6,
  },
  picker: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
  },
  dateBtn: {
    backgroundColor: "#f6dcb6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  addBtn: {
    backgroundColor: "#f97316",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  addText: { color: "#fff", fontWeight: "bold" },
  card: {
    backgroundColor: "#e0f2fe",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  textArea: {
    backgroundColor: "#fff",
    padding: 12,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
  },
  mapBtn: {
    backgroundColor: "#d1fae5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  submitBtn: { backgroundColor: "#f97316", padding: 15, borderRadius: 10 },
  submitText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  error: { color: "red", fontSize: 12, marginBottom: 6 },
});
