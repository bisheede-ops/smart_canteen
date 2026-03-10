// import React, { useState, useEffect } from "react";
// import { useRouter } from "expo-router";
// import {
//   StyleSheet,
//   Text,
//   View,
//   SafeAreaView,
//   TextInput,
//   TouchableOpacity,
//   StatusBar,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import { Ionicons } from "@expo/vector-icons";
// import {
//   doc,
//   setDoc,
//   getDoc,
//   updateDoc,
//   serverTimestamp,
//   collection,
//   getDocs,
//   query,
//   where,
// } from "firebase/firestore";
// import { db } from "../../../firebaseConfig";

// export default function AdminTokenScreen() {
//   const router = useRouter();

//   const [foodItems, setFoodItems] = useState([]);
//   const [selectedMeal, setSelectedMeal] = useState("");
//   const [tokenCount, setTokenCount] = useState("");
//   const [loading, setLoading] = useState(false);

//   // ✅ Fetch only Breakfast & Lunch items
//   useEffect(() => {
//     const fetchFoodItems = async () => {
//       try {

//         const q = query(
//           collection(db, "menu"),
//           where("category", "in", ["Breakfast", "Lunch"]),
//         );

//         const querySnapshot = await getDocs(q);

//         const items = querySnapshot.docs.map((doc) => {

//           return {
//             id: doc.id,
//             ...doc.data(),
//           };
//         });

//         console.log("Final Items Array:", items);

//         setFoodItems(items);

//         if (items.length > 0) {
//           setSelectedMeal(items[0].id);
//         } else {
//           console.log("No items found in menu collection!");
//         }
//       } catch (error) {
//         console.log("Error fetching food items:", error);
//         Alert.alert("Error", "Failed to load food items");
//       }
//     };

//     fetchFoodItems();
//   }, []);

//   const handleSave = async () => {
//     if (!selectedMeal) {
//       Alert.alert("Error", "Please select a food item");
//       return;
//     }

//     if (!tokenCount || isNaN(tokenCount) || Number(tokenCount) <= 0) {
//       Alert.alert("Invalid Input", "Enter valid token count");
//       return;
//     }

//     try {
//       setLoading(true);

//       const mealRef = doc(db, "token", selectedMeal);
//       const mealSnap = await getDoc(mealRef);

//       // 🔹 If document does NOT exist (first time)
//       if (!mealSnap.exists()) {
//         await setDoc(mealRef, {
//           meal: selectedMeal,
//           totalToken: Number(tokenCount),
//           remainingToken: Number(tokenCount),
//           updatedAt: serverTimestamp(),
//         });

//         Alert.alert("Success", "Token created successfully!");
//       }
//       // 🔹 If document already exists
//       else {
//         await updateDoc(mealRef, {
//           totalToken: Number(tokenCount),
//           updatedAt: serverTimestamp(),
//         });

//         Alert.alert(
//           "Updated",
//           "Total token updated. Remaining token kept safe.",
//         );
//       }

//       setTokenCount("");
//       router.replace("is_signed_in/Admin/HomeScreen");
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Error", "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />

//       <View style={styles.header}>
//         <Ionicons name="ticket-outline" size={30} color="#FF7A00" />
//         <Text style={styles.headerTitle}>Set Meal Token Count</Text>
//       </View>

//       <View style={styles.form}>
//         <Text style={styles.label}>Select Food Item</Text>

//         <View style={styles.pickerContainer}>
//           <Picker
//             selectedValue={selectedMeal}
//             onValueChange={(itemValue) => setSelectedMeal(itemValue)}
//             dropdownIconColor="#FF7A00"
//           >
//             {foodItems.map((item) => (
//               <Picker.Item key={item.id} label={item.name} value={item.id} />
//             ))}
//           </Picker>
//         </View>

//         <Text style={styles.label}>Total Token Count</Text>

//         <TextInput
//           style={styles.input}
//           keyboardType="number-pad"
//           placeholder="Enter total tokens"
//           value={tokenCount}
//           onChangeText={setTokenCount}
//         />

//         <TouchableOpacity
//           style={styles.button}
//           onPress={handleSave}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.buttonText}>Save</Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// /* STYLES */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F4F6FA",
//     paddingHorizontal: 25,
//   },
//   header: {
//     marginTop: 40,
//     marginBottom: 40,
//     alignItems: "center",
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginTop: 12,
//     color: "#333",
//   },
//   form: {
//     gap: 22,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#444",
//   },
//   pickerContainer: {
//     backgroundColor: "#fff",
//     borderRadius: 15,
//     elevation: 5,
//   },
//   input: {
//     backgroundColor: "#fff",
//     borderRadius: 15,
//     padding: 16,
//     fontSize: 15,
//     elevation: 5,
//   },
//   button: {
//     marginTop: 25,
//     backgroundColor: "#FF7A00",
//     paddingVertical: 16,
//     borderRadius: 18,
//     alignItems: "center",
//     elevation: 8,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 15,
//     fontWeight: "bold",
//   },
// });
// import React, { useState, useEffect } from "react";
// import { useRouter } from "expo-router";
// import {
//   StyleSheet,
//   Text,
//   View,
//   SafeAreaView,
//   TextInput,
//   TouchableOpacity,
//   StatusBar,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import { Ionicons } from "@expo/vector-icons";
// import {
//   doc,
//   setDoc,
//   getDoc,
//   updateDoc,
//   serverTimestamp,
//   collection,
//   getDocs,
//   query,
//   where,
// } from "firebase/firestore";
// import { db } from "../../../firebaseConfig";

// export default function Token() {
//   const router = useRouter();

//   const [selectedCategory, setSelectedCategory] = useState("Breakfast");
//   const [foodItems, setFoodItems] = useState([]);
//   const [selectedMeal, setSelectedMeal] = useState("");
//   const [tokenCount, setTokenCount] = useState("");
//   const [loading, setLoading] = useState(false);

//   // ✅ Fetch items based on category
//   useEffect(() => {
//     const fetchFoodItems = async () => {
//       try {
//         console.log("Fetching category:", selectedCategory);

//         const q = query(
//           collection(db, "menu"),
//           where("category", "==", selectedCategory),
//         );

//         const querySnapshot = await getDocs(q);

//         console.log("Docs count:", querySnapshot.size);

//         const items = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         setFoodItems(items);

//         if (items.length > 0) {
//           setSelectedMeal(items[0].id);
//         } else {
//           setSelectedMeal("");
//         }
//       } catch (error) {
//         console.log("Error fetching food items:", error);
//         Alert.alert("Error", "Failed to load food items");
//       }
//     };

//     fetchFoodItems();
//   }, [selectedCategory]);

//   const handleSave = () => {
//     if (!selectedMeal) {
//       Alert.alert("Error", "Please select a food item");
//       return;
//     }

//     if (!tokenCount || isNaN(tokenCount) || Number(tokenCount) <= 0) {
//       Alert.alert("Invalid Input", "Enter valid token count");
//       return;
//     }

//     // ✅ Confirmation Alert
//     Alert.alert(
//       "Confirm Token Update",
//       `Are you sure you want to set ${tokenCount} tokens for ${selectedCategory}?`,
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Yes",
//           onPress: async () => {
//             try {
//               setLoading(true);

//               const mealRef = doc(db, "token", selectedMeal);
//               const mealSnap = await getDoc(mealRef);

//               if (!mealSnap.exists()) {
//                 await setDoc(mealRef, {
//                   mealId: selectedMeal,
//                   category: selectedCategory,
//                   totalToken: Number(tokenCount),
//                   remainingToken: Number(tokenCount),
//                   updatedAt: serverTimestamp(),
//                 });

//                 Alert.alert("Success", "Token created successfully!");
//               } else {
//                 await updateDoc(mealRef, {
//                   totalToken: Number(tokenCount),
//                   updatedAt: serverTimestamp(),
//                 });

//                 Alert.alert(
//                   "Updated",
//                   "Total token updated. Remaining token kept safe.",
//                 );
//               }

//               setTokenCount("");
//               router.replace("/is_signed_in/Admin/HomeScreen");
//             } catch (error) {
//               console.log(error);
//               Alert.alert("Error", "Something went wrong");
//             } finally {
//               setLoading(false);
//             }
//           },
//         },
//       ],
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />

//       <View style={styles.header}>
//         <Ionicons name="ticket-outline" size={30} color="#FF7A00" />
//         <Text style={styles.headerTitle}>Set Meal Token Count</Text>
//       </View>

//       <View style={styles.form}>
//         {/* CATEGORY DROPDOWN */}
//         <Text style={styles.label}>Select Category</Text>
//         <View style={styles.pickerContainer}>
//           <Picker
//             selectedValue={selectedCategory}
//             onValueChange={(itemValue) => setSelectedCategory(itemValue)}
//             mode="dropdown"
//             style={{ color: "#000" }}
//           >
//             <Picker.Item label="Breakfast" value="Breakfast" />
//             <Picker.Item label="Lunch" value="Lunch" />
//           </Picker>
//         </View>

//         {/* FOOD DROPDOWN */}
//         <Text style={styles.label}>Select Food Item</Text>
//         <View style={styles.pickerContainer}>
//           <Picker
//             selectedValue={selectedMeal}
//             onValueChange={(itemValue) => setSelectedMeal(itemValue)}
//             mode="dropdown"
//             style={{ color: "#000" }}
//           >
//             {foodItems.length === 0 ? (
//               <Picker.Item label="No items available" value="" />
//             ) : (
//               foodItems.map((item) => (
//                 <Picker.Item key={item.id} label={item.name} value={item.id} />
//               ))
//             )}
//           </Picker>
//         </View>

//         {/* TOKEN INPUT */}
//         <Text style={styles.label}>Total Token Count</Text>

//         <TextInput
//           style={styles.input}
//           keyboardType="number-pad"
//           placeholder="Enter total tokens"
//           value={tokenCount}
//           onChangeText={setTokenCount}
//         />

//         <TouchableOpacity
//           style={styles.button}
//           onPress={handleSave}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.buttonText}>Save</Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// /* STYLES */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F4F6FA",
//     paddingHorizontal: 25,
//   },
//   header: {
//     marginTop: 40,
//     marginBottom: 40,
//     alignItems: "center",
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginTop: 12,
//     color: "#333",
//   },
//   form: {
//     gap: 22,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#444",
//   },
//   pickerContainer: {
//     backgroundColor: "#fff",
//     borderRadius: 15,
//     elevation: 5,
//     height: 55,
//     justifyContent: "center",
//   },
//   input: {
//     backgroundColor: "#fff",
//     borderRadius: 15,
//     padding: 16,
//     fontSize: 15,
//     elevation: 5,
//   },
//   button: {
//     marginTop: 25,
//     backgroundColor: "#FF7A00",
//     paddingVertical: 16,
//     borderRadius: 18,
//     alignItems: "center",
//     elevation: 8,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 15,
//     fontWeight: "bold",
//   },
// });
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
 
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";

export default function AdminTokenScreen() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState("Breakfast");
  const [foodItems, setFoodItems] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState("");
  const [tokenCount, setTokenCount] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch food items based on selected category
  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const q = query(
          collection(db, "menu"),
          where("category", "==", selectedCategory),
        );

        const querySnapshot = await getDocs(q);

        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFoodItems(items);

        if (items.length > 0) {
          setSelectedMeal(items[0].id);
        } else {
          setSelectedMeal("");
        }
      } catch (error) {
        console.log("Error fetching food items:", error);
        Alert.alert("Error", "Failed to load food items");
      }
    };

    fetchFoodItems();
  }, [selectedCategory]);

  // ✅ Save Token
  const handleSave = () => {
    if (!selectedMeal) {
      Alert.alert("Error", "Please select a food item");
      return;
    }

    if (!tokenCount || isNaN(tokenCount) || Number(tokenCount) <= 0) {
      Alert.alert("Invalid Input", "Enter valid token count");
      return;
    }

    const selectedItem = foodItems.find((item) => item.id === selectedMeal);

    if (!selectedItem) {
      Alert.alert("Error", "Invalid meal selected");
      return;
    }

    // ✅ Confirmation popup
    Alert.alert(
      "Confirm Token Update",
      `Meal: ${selectedItem.name}\nCategory: ${selectedCategory}\nTotal Tokens: ${tokenCount}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              setLoading(true);

              const mealRef = doc(db, "token", selectedMeal);
              const mealSnap = await getDoc(mealRef);

              if (!mealSnap.exists()) {
                await setDoc(mealRef, {
                  itemId: selectedMeal,
                  mealName: selectedItem.name,
                  category: selectedCategory,
                  totalToken: Number(tokenCount),
                  remainingToken: Number(tokenCount),
                  lastTokenNumber: 0,
                  updatedAt: serverTimestamp(),
                });

                Alert.alert("Success", "Token created successfully!");
              } else {
                await updateDoc(mealRef, {
                  mealName: selectedItem.name,
                  totalToken: Number(tokenCount),
                  updatedAt: serverTimestamp(),
                });

                Alert.alert(
                  "Updated",
                  "Total token updated. Remaining token kept safe.",
                );
              }

              setTokenCount("");
              router.replace("/is_signed_in/Admin/HomeScreen");
            } catch (error) {
              console.log(error);
              Alert.alert("Error", "Something went wrong");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Ionicons name="ticket-outline" size={30} color="#FF7A00" />
        <Text style={styles.headerTitle}>Set Meal Token Count</Text>
      </View>

      <View style={styles.form}>
        {/* CATEGORY DROPDOWN */}
        <Text style={styles.label}>Select Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            mode="dropdown"
            style={{ color: "#000" }}
          >
            <Picker.Item label="Breakfast" value="Breakfast" />
            <Picker.Item label="Lunch" value="Lunch" />
          </Picker>
        </View>

        {/* FOOD DROPDOWN */}
        <Text style={styles.label}>Select Food Item</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedMeal}
            onValueChange={(itemValue) => setSelectedMeal(itemValue)}
            mode="dropdown"
            style={{ color: "#000" }}
          >
            {foodItems.length === 0 ? (
              <Picker.Item label="No items available" value="" />
            ) : (
              foodItems.map((item) => (
                <Picker.Item key={item.id} label={item.name} value={item.id} />
              ))
            )}
          </Picker>
        </View>

        {/* TOKEN INPUT */}
        <Text style={styles.label}>Total Token Count</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          placeholder="Enter total tokens"
          value={tokenCount}
          onChangeText={setTokenCount}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FA",
    paddingHorizontal: 25,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 12,
    color: "#333",
  },
  form: {
    gap: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 5,
    height: 55,
    justifyContent: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 16,
    fontSize: 15,
    elevation: 5,
  },
  button: {
    marginTop: 25,
    backgroundColor: "#FF7A00",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});