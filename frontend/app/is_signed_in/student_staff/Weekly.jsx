import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal
} from "react-native";

import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

import { db } from "../../../firebaseConfig";

export default function WeeklySubscription() {

  const [lunchItems, setLunchItems] = useState([]);
  const [isSunday, setIsSunday] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch lunch items
  const fetchLunchItems = async () => {

    try {

      const q = query(
        collection(db, "menu"),
        where("category", "==", "Lunch")
      );

      const querySnapshot = await getDocs(q);

      const items = [];

      querySnapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setLunchItems(items);

    } catch (error) {
      console.log("Error fetching lunch:", error);
    }

  };

  useEffect(() => {

    fetchLunchItems();

    const today = new Date().getDay();
    setIsSunday(today === 4);

  }, []);

  const renderItem = ({ item }) => (

    <View style={styles.card}>

      <Image source={{ uri: item.image }} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text>₹ {item.price}</Text>
        <Text>{item.time}</Text>
      </View>

      <TouchableOpacity
        style={[styles.tokenButton, !isSunday && styles.disabledButton]}
        disabled={!isSunday}
        onPress={() => {
          setSelectedItem(item);
          setShowModal(true);
        }}
      >
        <Text style={styles.tokenText}>Get Token</Text>
      </TouchableOpacity>

    </View>

  );

  return (

    <View style={styles.container}>

      {!isSunday && (
        <Text style={styles.warning}>
          Can only get tokens on Sunday's
        </Text>
      )}

      <Text style={styles.title}>Lunch Menu</Text>

      <FlatList
        data={lunchItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      {/* Payment Modal */}

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
      >

        <View style={styles.modalContainer}>

          <View style={styles.modalBox}>

            {selectedItem && (
              <>
                <Text style={styles.modalTitle}>
                  {selectedItem.name}
                </Text>

                <Text style={styles.p}>Price: ₹{selectedItem.price} x 5</Text>

                <Text style={styles.total}>
                  Total: ₹{selectedItem.price * 5}
                </Text>

                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => {
                    console.log("Payment clicked");
                    setShowModal(false);
                  }}
                >
                  <Text style={styles.payText}>Pay</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                >
                  <Text style={{ marginTop: 10 }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </>
            )}

          </View>

        </View>

      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20
  },

  warning: {
    color: "red",
    fontSize: 48,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold"
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#FF9800"
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 8
  },

  info: {
    flex: 1,
    marginLeft: 10
  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF9800"
  },

  tokenButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6
  },

  disabledButton: {
    backgroundColor: "#ccc"
  },

  tokenText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold"
  },

  p:{
    fontSize: 18
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)"
  },

  modalBox: {
    width: 260,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center"
  },

  modalTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FF9800"
  },

  total: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10
  },

  payButton: {
    width: 110,
    marginTop: 15,
    backgroundColor: "#FF9800",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6
  },

  payText: {
    textAlign: "center",
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold"
  }

});