import React, { useState, useEffect } from "react";
import { View, Button, Image, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import { storage } from "../firebaseConfig";

export default function ImageUploader() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) uploadImage(result.assets[0].uri);
  };

  const uploadImage = async (uri) => {
    setUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = uri.substring(uri.lastIndexOf("/") + 1);
      const storageRef = ref(storage, `images/${filename}`);
      await uploadBytes(storageRef, blob);
      alert("Image uploaded successfully!");
      fetchImages();
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    }
    setUploading(false);
  };

  const fetchImages = async () => {
    const listRef = ref(storage, "images/");
    const res = await listAll(listRef);
    const urls = await Promise.all(res.items.map(item => getDownloadURL(item)));
    setImages(urls);
  };

  useEffect(() => { fetchImages(); }, []);

  return (
    <View style={styles.container}>
      <Button title="Pick & Upload Image" onPress={pickImage} />
      {uploading && <ActivityIndicator size="large" color="blue" />}
      <FlatList
        data={images}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Image source={{ uri: item }} style={styles.image} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  image: { width: 100, height: 100, marginVertical: 10 }
});
