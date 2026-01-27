// import React, { useEffect, useState } from "react";
// import {
//   Alert,
//   FlatList,
//   Modal,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   Platform,
//   Image,
//   ScrollView,
//   ActivityIndicator,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
// import { db } from "../../../firebaseConfig";
// import * as ImagePicker from "expo-image-picker";

// import { styles as baseStyles } from "@/assets/src/styles/MenuScreenStyles";

// export default function AdminMenu() {
//   const [menu, setMenu] = useState([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);

//   const [name, setName] = useState("");
//   const [price, setPrice] = useState("");
//   const [category, setCategory] = useState("Snack");

//   const [startTime, setStartTime] = useState(null);
//   const [endTime, setEndTime] = useState(null);
//   const [showStartPicker, setShowStartPicker] = useState(false);
//   const [showEndPicker, setShowEndPicker] = useState(false);

//   const [image, setImage] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const formatTime = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

//   /* ---------- FETCH MENU ---------- */
//   const fetchMenu = async () => {
//     const snapshot = await getDocs(collection(db, "menu"));
//     const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//     setMenu(list);
//   };

//   useEffect(() => { fetchMenu(); }, []);

//   /* ---------- IMAGE PICKER (Base64) ---------- */
//   const pickImage = async () => {
//     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!permission.granted) {
//       Alert.alert("Permission required", "Allow gallery access");
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images, // <-- corrected
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.5,
//       base64: true,
//     });

//     if (!result.canceled) {
//       setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
//     }
//   };


//   /* ---------- SAVE MENU ITEM ---------- */
//   const handleSave = async () => {
//     if (loading) return;
//     setLoading(true);

//     if (!name || !price) { Alert.alert("Error", "Fill all fields"); setLoading(false); return; }
//     if (isNaN(price)) { Alert.alert("Error", "Price must be a number"); setLoading(false); return; }
//     if ((category === "Breakfast" || category === "Lunch") && (!startTime || !endTime)) {
//       Alert.alert("Error", "Please select serving time"); setLoading(false); return;
//     }

//     const data = {
//       name,
//       price: Number(price),
//       category,
//       image: image || "", // store Base64 in Firestore
//       time: category === "Snack" ? "" : `${formatTime(startTime)} - ${formatTime(endTime)}`,
//       createdAt: serverTimestamp(),
//     };

//     try {
//       if (editingItem) await updateDoc(doc(db, "menu", editingItem.id), data);
//       else await addDoc(collection(db, "menu"), data);
//       closeModal();
//       fetchMenu();
//     } catch {
//       Alert.alert("Error", "Operation failed");
//     }

//     setLoading(false);
//   };

//   /* ---------- DELETE MENU ITEM ---------- */
//   const handleDelete = (id) => {
//     Alert.alert("Confirm", "Delete this item?", [
//       { text: "Cancel" },
//       { text: "Delete", style: "destructive", onPress: async () => { await deleteDoc(doc(db, "menu", id)); fetchMenu(); } },
//     ]);
//   };

//   /* ---------- MODAL CONTROLS ---------- */
//   const openAdd = () => {
//     setEditingItem(null); setName(""); setPrice(""); setCategory("Snack");
//     setStartTime(null); setEndTime(null); setImage(null); setModalVisible(true);
//   };

//   const openEdit = (item) => {
//     setEditingItem(item); setName(item.name); setPrice(item.price.toString()); setCategory(item.category); setImage(item.image || null);
//     if (item.time) {
//       const [start, end] = item.time.split(" - ");
//       setStartTime(new Date(`1970-01-01 ${start}`)); setEndTime(new Date(`1970-01-01 ${end}`));
//     } else { setStartTime(null); setEndTime(null); }
//     setModalVisible(true);
//   };

//   const closeModal = () => setModalVisible(false);

//   /* ---------- RENDER MENU ITEM ---------- */
//   const renderItem = ({ item }) => (
//     <View style={baseStyles.card}>
//       <View>
//         {item.image ? <Image source={{ uri: item.image }} style={baseStyles.menuImage} /> : null}
//         <Text style={baseStyles.name}>{item.name}</Text>
//         <Text style={baseStyles.price}>₹ {item.price}</Text>
//         <Text style={baseStyles.category}>{item.category}</Text>
//         {item.time ? <Text style={baseStyles.time}>⏰ {item.time}</Text> : null}
//       </View>
//       <View style={baseStyles.actions}>
//         <TouchableOpacity onPress={() => openEdit(item)}>
//           <Ionicons name="create-outline" size={22} color="#4caf50" />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={() => handleDelete(item.id)}>
//           <Ionicons name="trash-outline" size={22} color="#f44336" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   /* ---------- RENDER ---------- */
//   return (
//     <View style={baseStyles.container}>
//       <View style={baseStyles.headerContainer}>
//         <Text style={baseStyles.header}>Admin Menu</Text>
//         <TouchableOpacity style={baseStyles.addBtn} onPress={openAdd}>
//           <Ionicons name="add" size={20} color="#fff" />
//           <Text style={baseStyles.addText}>Add Menu Item</Text>
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         data={menu}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={{ paddingBottom: 20 }}
//         ListEmptyComponent={<Text style={baseStyles.emptyText}>No menu items added yet</Text>}
//       />

//       <Modal visible={modalVisible} transparent animationType="slide">
//         <ScrollView contentContainerStyle={modalStyles.overlay}>
//           <View style={modalStyles.modal}>
//             <Text style={modalStyles.modalTitle}>{editingItem ? "Edit Item" : "Add Item"}</Text>

//             <TextInput placeholder="Food Name" style={modalStyles.input} value={name} onChangeText={setName} />
//             <TextInput placeholder="Price" style={modalStyles.input} keyboardType="numeric" value={price} onChangeText={setPrice} />

//             <Text style={modalStyles.label}>Add Food Image</Text>
//             <TouchableOpacity style={modalStyles.imagePicker} onPress={pickImage}>
//               {image ? (
//                 <Image source={{ uri: image }} style={modalStyles.previewImage} />
//               ) : (
//                 <View style={modalStyles.placeholder}>
//                   <Ionicons name="image-outline" size={40} color="#ccc" />
//                   <Text style={modalStyles.imageText}>Tap to add image</Text>
//                 </View>
//               )}
//             </TouchableOpacity>

//             <Text style={modalStyles.label}>Category</Text>
//             <View style={modalStyles.categoryRow}>
//               {["Snack", "Breakfast", "Lunch"].map((item) => (
//                 <TouchableOpacity key={item} style={[modalStyles.categoryBtn, category === item && modalStyles.activeCategory]} onPress={() => setCategory(item)}>
//                   <Text style={category === item ? modalStyles.activeText : modalStyles.categoryText}>{item}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             {(category === "Breakfast" || category === "Lunch") && (
//               <>
//                 <TouchableOpacity style={modalStyles.timeBtn} onPress={() => setShowStartPicker(true)}>
//                   <Text>{startTime ? formatTime(startTime) : "Select Start Time"}</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={modalStyles.timeBtn} onPress={() => setShowEndPicker(true)}>
//                   <Text>{endTime ? formatTime(endTime) : "Select End Time"}</Text>
//                 </TouchableOpacity>

//                 {showStartPicker && <DateTimePicker value={startTime || new Date()} mode="time" display={Platform.OS === "android" ? "clock" : "spinner"} onChange={(e, date) => { setShowStartPicker(false); if (date) setStartTime(date); }} />}
//                 {showEndPicker && <DateTimePicker value={endTime || new Date()} mode="time" display={Platform.OS === "android" ? "clock" : "spinner"} onChange={(e, date) => { setShowEndPicker(false); if (date) setEndTime(date); }} />}
//               </>
//             )}

//             <View style={modalStyles.modalActions}>
//               <TouchableOpacity onPress={closeModal}><Text style={modalStyles.cancel}>Cancel</Text></TouchableOpacity>
//               <TouchableOpacity onPress={handleSave}><Text style={modalStyles.save}>{loading ? "Saving..." : "Save"}</Text></TouchableOpacity>
//             </View>
//           </View>
//         </ScrollView>
//       </Modal>
//     </View>
//   );
// }

// const modalStyles = StyleSheet.create({
//   overlay: { flexGrow: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: 20 },
//   modal: { width: "100%", backgroundColor: "#fff", borderRadius: 12, padding: 20 },
//   modalTitle: { fontSize: 20, fontWeight: "700", color: "#FF7A00", marginBottom: 15, textAlign: "center" },
//   input: { height: 45, backgroundColor: "#f0f0f0", borderRadius: 8, paddingHorizontal: 10, marginVertical: 5 },
//   label: { fontSize: 14, marginTop: 10 },
//   imagePicker: { height: 140, width: "100%", borderWidth: 1, borderColor: "#FF7A00", borderRadius: 12, justifyContent: "center", alignItems: "center", marginVertical: 10, backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
//   previewImage: { width: "100%", height: "100%", borderRadius: 12 },
//   placeholder: { justifyContent: "center", alignItems: "center" },
//   imageText: { color: "#aaa", marginTop: 5, fontSize: 14 },
//   categoryRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
//   categoryBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: "#FF7A00" },
//   activeCategory: { backgroundColor: "#FF7A00" },
//   categoryText: { color: "#FF7A00" },
//   activeText: { color: "#fff" },
//   timeBtn: { height: 40, borderWidth: 1, borderColor: "#FF7A00", borderRadius: 8, justifyContent: "center", alignItems: "center", marginVertical: 5 },
//   modalActions: { flexDirection: "row", justifyContent: "space-around", marginTop: 20 },
//   cancel: { color: "#FF7A00", fontWeight: "700" },
//   save: { color: "#fff", fontWeight: "700", backgroundColor: "#FF7A00", paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
// });














import React, { useEffect, useState } from "react";
import { validateFoodName, validateSameTime, validateTimeOrder, validateNumber } from "../../../utils/validation.js";
import {
  Alert,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import * as ImagePicker from "expo-image-picker";

import { styles } from "@/assets/src/styles/MenuScreenStyles";

export default function AdminMenu() {
  const [menu, setMenu] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Snack");

  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [image, setImage] = useState(null); // Base64
  const [loading, setLoading] = useState(false);

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  /* ---------- FETCH MENU ---------- */
  const fetchMenu = async () => {
    const snapshot = await getDocs(collection(db, "menu"));
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMenu(list);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  /* ---------- IMAGE PICKER (BASE64) ---------- */
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Allow gallery access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,      // smaller size
      base64: true,      // Base64 enabled
    });

    if (!result.canceled) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  /* ---------- SAVE MENU ITEM ---------- */
  const handleSave = async () => {
    if (loading) return;
    setLoading(true);

    if (!name || !price) {
      Alert.alert("Error", "Fill all fields");
      setLoading(false);
      return;
    }

    const foodnameError = validateFoodName(name);
    if (foodnameError) {
      Alert.alert("Error", foodnameError);
      setLoading(false);
      return;
    }

    const numberError = validateNumber(price);
    if (numberError) {
      Alert.alert("Error", `Price ${numberError}`);
      setLoading(false);
      return;
    }

    if (
      (category === "Breakfast" || category === "Lunch") &&
      (!startTime || !endTime)
    ) {
      Alert.alert("Error", "Please select serving time");
      setLoading(false);
      return;
    }

    if (category !== "Snack") {
      const timeError =
        validateSameTime(startTime, endTime) ||
        validateTimeOrder(startTime, endTime);

      if (timeError) {
        Alert.alert("Error", timeError);
        setLoading(false);
        return;
      }
    }

    const data = {
      name,
      price: Number(price),
      category,
      image: image || "", // Base64 stored in Firestore
      time:
        category === "Snack"
          ? ""
          : `${formatTime(startTime)} - ${formatTime(endTime)}`,
      createdAt: serverTimestamp(),
    };

    try {
      if (editingItem) {
        await updateDoc(doc(db, "menu", editingItem.id), data);
      } else {
        await addDoc(collection(db, "menu"), data);
      }
      closeModal();
      fetchMenu();
    } catch (e) {
      Alert.alert("Error", "Operation failed");
    }

    setLoading(false);
  };

  /* ---------- DELETE ---------- */
  const handleDelete = (id) => {
    Alert.alert("Confirm", "Delete this item?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "menu", id));
          fetchMenu();
        },
      },
    ]);
  };

  /* ---------- MODAL CONTROLS ---------- */
  const openAdd = () => {
    setEditingItem(null);
    setName("");
    setPrice("");
    setCategory("Snack");
    setStartTime(null);
    setEndTime(null);
    setImage(null);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(item.price.toString());
    setCategory(item.category);
    setImage(item.image || null);

    if (item.time) {
      const [start, end] = item.time.split(" - ");
      setStartTime(new Date(`1970-01-01 ${start}`));
      setEndTime(new Date(`1970-01-01 ${end}`));
    } else {
      setStartTime(null);
      setEndTime(null);
    }

    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  /* ---------- RENDER ITEM ---------- */
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.menuImage} />
        ) : null}
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>₹ {item.price}</Text>
        <Text style={styles.category}>{item.category}</Text>
        {item.time ? <Text style={styles.time}>⏰ {item.time}</Text> : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEdit(item)}>
          <Ionicons name="create-outline" size={22} color="#4caf50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={22} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ---------- UI ---------- */
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Admin Menu</Text>

        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addText}>Add Menu Item</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={menu}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No menu items added yet</Text>
        }
      />

      {/* ---------- MODAL ---------- */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <ScrollView contentContainerStyle={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editingItem ? "Edit Item" : "Add Item"}
            </Text>

            <TextInput
              placeholder="Food Name"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder="Price"
              style={styles.input}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />

            {/* IMAGE PICKER */}
            <Text style={styles.label}>Food Image</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholder}>
                  <Ionicons name="image-outline" size={40} color="#ccc" />
                  <Text style={styles.imageText}>Tap to add image</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryRow}>
              {["Snack", "Breakfast", "Lunch"].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.categoryBtn,
                    category === item && styles.activeCategory,
                  ]}
                  onPress={() => setCategory(item)}
                >
                  <Text
                    style={
                      category === item
                        ? styles.activeText
                        : styles.categoryText
                    }
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {(category === "Breakfast" || category === "Lunch") && (
              <>
                <TouchableOpacity
                  style={styles.timeBtn}
                  onPress={() => setShowStartPicker(true)}
                >
                  <Text>
                    {startTime ? formatTime(startTime) : "Select Start Time"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.timeBtn}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Text>
                    {endTime ? formatTime(endTime) : "Select End Time"}
                  </Text>
                </TouchableOpacity>

                {showStartPicker && (
                  <DateTimePicker
                    value={startTime || new Date()}
                    mode="time"
                    display={Platform.OS === "android" ? "clock" : "spinner"}
                    onChange={(e, date) => {
                      setShowStartPicker(false);
                      if (date) setStartTime(date);
                    }}
                  />
                )}

                {showEndPicker && (
                  <DateTimePicker
                    value={endTime || new Date()}
                    mode="time"
                    display={Platform.OS === "android" ? "clock" : "spinner"}
                    onChange={(e, date) => {
                      setShowEndPicker(false);
                      if (date) setEndTime(date);
                    }}
                  />
                )}
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.save}>
                  {loading ? "saving..." : "save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}


