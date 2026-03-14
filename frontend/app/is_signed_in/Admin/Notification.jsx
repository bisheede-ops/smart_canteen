import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

export default function OwnerNotification() {

  const router = useRouter();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const sendNotification = async () => {

    if (!title || !message) {
      Alert.alert("Error", "Enter title and message");
      return;
    }

     Alert.alert(
    "Confirm Notification",
    "Are you sure you want to send this notification?",
    [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "OK",
        onPress: async () => {
          try {

            await addDoc(collection(db, "notification"), {
              title,
              message,
              createdAt: serverTimestamp()
            });

            Alert.alert("Success", "Notification sent");

            setTitle("");
            setMessage("");

            router.push("/is_signed_in/Admin/HomeScreen");

          } catch (error) {
            console.log("Error:", error);
          }
        }
      }
    ]
  );

};

  return (
    <View style={styles.container}>

      <Text style={styles.header}>Send Notification</Text>

      <TextInput
        style={styles.input}
        placeholder="Notification Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Notification Message"
        multiline
        value={message}
        onChangeText={setMessage}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={sendNotification}
      >
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15
  },

  button: {
    backgroundColor: "#FF9800",
    padding: 15,
    borderRadius: 8
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold"
  }

});