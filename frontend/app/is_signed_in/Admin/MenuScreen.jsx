import React, { useRef } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";

/* ---------- 3D BUTTON PROPS ---------- */
type ThreeDButtonProps = {
  title: string;
  onPress?: () => void;
  small?: boolean;
};

/* ---------- 3D BUTTON COMPONENT ---------- */
function ThreeDButton({ title, onPress, small = false }: ThreeDButtonProps) {
  const pressAnim = useRef(new Animated.Value(0)).current;

  const pressIn = () => {
    Animated.timing(pressAnim, {
      toValue: 1,
      duration: 80,
      useNativeDriver: false,
    }).start();
  };

  const pressOut = () => {
    Animated.timing(pressAnim, {
      toValue: 0,
      duration: 80,
      useNativeDriver: false,
    }).start(() => {
      onPress && onPress();
    });
  };

  const translateY = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });

  const shadowSize = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 2],
  });

  return (
    <Animated.View
      style={[
        styles.button,
        small && styles.smallButton,
        {
          transform: [{ translateY }],
          shadowOffset: { width: 0, height: shadowSize },
        },
      ]}
    >
      <TouchableWithoutFeedback onPressIn={pressIn} onPressOut={pressOut}>
        <View>
          <Text style={styles.buttonText}>{title}</Text>
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}

/* ---------- MENU SCREEN ---------- */
export default function MenuScreen() {
  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.appName}>SmartCanteen</Text>
        <View style={styles.divider} />
        <Text style={styles.menuTitle}>MENU</Text>
      </View>

      {/* BUTTONS */}
      <ThreeDButton 
        title="SHOW THE MENU" 
        onPress={() => router.push("/is_signed_in/s;tudent_staff/ShowMenu")}
      />

      <ThreeDButton
        title="ADD NEW MENU"
        onPress={() => router.push("/is_signed_in/Admin/AddNewMenu")}
      />
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  /* HEADER */
  header: {
    position: "absolute",
    top: 40,
    width: "100%",          // needed for long divider
    alignItems: "center",
  },

  appName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FF7A00",
  },

  divider: {
    width: "90%",           // 🔥 VERY LONG BAR
    height: 4,
    backgroundColor: "#FF7A00",
    borderRadius: 2,
    marginVertical: 10,
  },

  menuTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FF7A00",
  },

  /* BUTTONS */
  button: {
    backgroundColor: "#FF7A00",
    width: 220,
    paddingVertical: 14,
    borderRadius: 30,
    marginVertical: 12,

    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },

  smallButton: {
    paddingVertical: 12,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
    textAlign: "center",
  },
});
