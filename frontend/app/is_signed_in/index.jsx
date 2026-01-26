import { Text, View, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Toast from "react-native-toast-message";

import { auth, db } from "../../firebaseConfig";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setTimeout(async () => {
        try {
          if (!user) {
            router.replace("/is_signed_out/LoginScreen");
            return;
          }

          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            Toast.show({
              type: "error",
              text1: "User data not found",
            });
            router.replace("/is_signed_out/LoginScreen");
            return;
          }

          const { role } = userSnap.data();

          switch (role) {
            case "admin":
              router.replace("/is_signed_in/Admin/HomeScreen");
              break;

            case "delivery_agent":
              router.replace("/is_signed_in/Delivery/HomeScreen");
              break;

            case "student":
            case "staff":
            case "teacher":
              router.replace("/is_signed_in/student_staff/HomeScreen");
              break;

            default:
              Toast.show({
                type: "error",
                text1: "Invalid user",
              });
              router.replace("/is_signed_out/LoginScreen");
          }
        } catch (error) {
          console.error("Routing error:", error);
          Toast.show({
            type: "error",
            text1: "Something went wrong",
          });
        }
      }, 400);
    });

    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/icon.png")}
        style={styles.logo}
        accessibilityLabel="Smart Canteen Logo"
      />
      {/* <Text style={styles.title}>Smart Canteen</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    borderRadius: 25,
  },
  title: {
    color: "#FF8C00",
    fontSize: 42,
    fontWeight: "700",
  },
});
