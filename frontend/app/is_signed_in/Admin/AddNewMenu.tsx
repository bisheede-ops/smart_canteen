import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity
} from 'react-native';

export default function MenuScreen() {
  const [foodItem, setFoodItem] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');

  /* ---------- SUBMIT HANDLER ---------- */
  const handleSubmit = () => {
    if (!foodItem || !price || !category) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    // 🔹 DATA OBJECT (to be sent to database)
    const menuData = {
      foodItem,
      price,
      category
    };

    // 🔹 TEMPORARY: simulate database submission
    console.log('Submitted to database:', menuData);

    Alert.alert('Success', 'Menu item submitted successfully');

    // Clear inputs after submit
    setFoodItem('');
    setPrice('');
    setCategory('');
  };

  return (
    <View style={styles.container}>

      {/* APP NAME */}
      <Text style={styles.appName}>SmartCanteen</Text>
      <View style={styles.divider} />

      {/* TITLE */}
      <Text style={styles.title}>MENU</Text>

      {/* FOOD ITEM */}
      <Text style={styles.label}>PLEASE ENTER THE FOOD ITEM</Text>
      <TextInput
        style={styles.input}
        value={foodItem}
        onChangeText={setFoodItem}
      />

      {/* PRICE */}
      <Text style={styles.label}>PLEASE ENTER THE PRICE</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      {/* CATEGORY */}
      <Text style={styles.label}>ENTER THE CATEGORY</Text>
      <TextInput
        style={styles.input}
        value={category}
        onChangeText={setCategory}
        placeholder="SNACKS / BREAKFAST / LUNCH"
        placeholderTextColor="#de9148ff"
      />

      {/* SMALL SUBMIT BUTTON */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>SUBMIT</Text>
      </TouchableOpacity>

    </View>
    
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({

    divider: {
    height: 4,                 // thickness of line
    width: '100%',
    backgroundColor: '#FF7A00', // orange theme
    marginVertical: 12,
    borderRadius: 2
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 40
  },

  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FF7A00',
    textAlign: 'center',
    marginBottom: 20
  },

  title: {
    fontWeight: '600',
    fontSize: 26,
    textAlign: 'center',
    color: '#FF7A00',
    marginBottom: 40
  },

  label: {
    fontSize: 14,
    marginTop: 20,
    marginBottom: 8
  },

  input: {
    height: 42,
    width : 250, 
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    paddingHorizontal: 10
  },

  /* SMALL SUBMIT BUTTON */
  submitButton: {
    marginTop: 35,
    alignSelf: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8
  },

  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  }
});
