import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

export default function AdminMenu() {
  const [menu, setMenu] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Snack");
  const [time, setTime] = useState("");

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

  /* ---------- SAVE ---------- */
  const handleSave = async () => {
    if (!name || !price) {
      Alert.alert("Error", "Fill all fields");
      return;
    }

    if ((category === "Breakfast" || category === "Lunch") && !time) {
      Alert.alert("Error", "Please enter serving time");
      return;
    }

    const data = {
      name,
      price: Number(price),
      category,
      time: category === "Snack" ? "" : time,
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
    } catch (err) {
      Alert.alert("Error", "Operation failed");
    }
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

  /* ---------- MODAL ---------- */
  const openAdd = () => {
    setEditingItem(null);
    setName("");
    setPrice("");
    setCategory("Snack");
    setTime("");
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(item.price.toString());
    setCategory(item.category);
    setTime(item.time || "");
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  /* ---------- ITEM UI ---------- */
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
      {/* ---------- FIXED HEADER ---------- */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Admin Menu</Text>

        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addText}>Add Menu Item</Text>
        </TouchableOpacity>
      </View>

      {/* ---------- SCROLLABLE LIST ---------- */}
      <FlatList
        data={menu}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No menu items added yet</Text>
        }
      />

      {/* ---------- MODAL ---------- */}
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

            {/* CATEGORY */}
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

            {/* TIME */}
            {(category === "Breakfast" || category === "Lunch") && (
              <TextInput
                placeholder="Serving Time (eg. 8:00 - 10:00 AM)"
                style={styles.input}
                value={time}
                onChangeText={setTime}
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.save}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 20,
    marginTop:20,
  },

  headerContainer: {
    paddingBottom: 10,
    backgroundColor: "#f9f9f9",
  },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff7a00",
    textAlign: "center",
    marginBottom: 10,
  },

  addBtn: {
    flexDirection: "row",
    backgroundColor: "#ff7a00",
    padding: 12,
    borderRadius: 10,
    justifyContent: "center",
  },

  addText: {
    color: "#fff",
    marginLeft: 5,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  name: { fontSize: 18, fontWeight: "bold" },
  price: { color: "#ff7a00" },
  category: { fontSize: 14 },
  time: { fontSize: 13, color: "#555" },

  actions: { justifyContent: "space-between" },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#999",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },

  modal: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 15,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  label: { fontWeight: "600", marginBottom: 5 },

  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  categoryBtn: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    width: "30%",
    alignItems: "center",
  },

  activeCategory: {
    backgroundColor: "#ff7a00",
    borderColor: "#ff7a00",
  },

  categoryText: { color: "#333" },
  activeText: { color: "#fff", fontWeight: "600" },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cancel: { color: "red", fontWeight: "600" },
  save: { color: "#4caf50", fontWeight: "600" },
});
