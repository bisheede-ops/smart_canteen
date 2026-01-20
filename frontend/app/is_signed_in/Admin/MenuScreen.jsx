import React, { useEffect, useState } from "react";
import {validateFoodName,validateSameTime,validateTimeOrder,validateNumber} from "../../../utils/validation.js" 
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
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

    const [loading, setLoading] = useState(false);

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

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

  const handleSave = async () => {
    if (loading) return;
    console.log("save clicked");
    setLoading(true);
    if (!name || !price) {
      Alert.alert("Error", "Fill all fields");
      console.log("field not filled");
      setLoading(false);
      return;
    }
    const foodnameError = validateFoodName(name);
    if (foodnameError) {
      Alert.alert("Error",foodnameError);
      console.log("food name error");
      setLoading(false);
      return;
    }

    const numberError = validateNumber(price);
    if (numberError) {
      Alert.alert("Error",`Price `+numberError);
      console.log("price error");
      setLoading(false);
      return;
    }

    if (
      (category === "Breakfast" || category === "Lunch") &&
      (!startTime || !endTime)
    ) {
      Alert.alert("Error", "Please select serving time");
      console.log("time not selected");
      setLoading(false);
      return;
    }

    if (category !== "Snack") {
      const timeError = validateSameTime(startTime, endTime)  || 
        validateTimeOrder(startTime, endTime);
    if (timeError) {
      Alert.alert("Error", timeError);
      console.log("the given two times are same or the time end time is less than start time");
      setLoading(false);
      return;
    }
  }

    const data = {
      name,
      price: Number(price),
      category,
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
      console.log("details added to database");
    } catch {
      Alert.alert("Error", "Operation failed");
      console.log("details added failed");
      setLoading(false);
    }
    setLoading(false);
  };

  const handleDelete = (id) => {
    Alert.alert("Confirm", "Delete this item?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "menu", id));
          fetchMenu();
          console.log("item deleted");
        },
      },
    ]);
  };

  const openAdd = () => {
    setEditingItem(null);
    setName("");
    setPrice("");
    setCategory("Snack");
    setStartTime(null);
    setEndTime(null);
    setModalVisible(true);
    console.log("add menu button clicked");
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(item.price.toString());
    setCategory(item.category);
    console.log("edit button clicked");

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
    console.log("cancel button clicked");
  };
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View>
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

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
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
        </View>
      </Modal>
    </View>
  );
}
