
import { useRouter } from "expo-router";
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocs
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../../firebaseConfig";
import { ORANGE, HomeStyles as styles } from "@/assets/src/styles/HomeStyles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [lowTokens, setLowTokens] = useState([]);
  const [notification, setNotification] = useState(null);

  const insets = useSafeAreaInsets();

  /* ---------- FETCH USER ---------- */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          console.warn("[HomeScreen] No authenticated user found.");
          return;
        }

        const docSnap = await getDoc(doc(db, "users", uid));

        if (docSnap.exists()) {
          setUser(docSnap.data());
        } else {
          console.warn("[HomeScreen] No user document found.");
        }
      } catch (error) {
        console.error("[HomeScreen] ERROR fetching user:", error);
      }
    };

    fetchUserData();
  }, []);

  /* ---------- FETCH LATEST NOTIFICATION ---------- */
  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const q = query(
          collection(db, "notification"),
          orderBy("createdAt", "desc"),
          limit(1)
        );

        const snapshot = await getDocs(q);

        snapshot.forEach((doc) => {
          setNotification(doc.data());
        });
      } catch (error) {
        console.error("[HomeScreen] Error fetching notification:", error);
      }
    };

    fetchNotification();
  }, []);

  /* ---------- REALTIME TOKEN LISTENER ---------- */
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "token"),
      (snapshot) => {
        const lowStockItems = [];

        snapshot.forEach((doc) => {
          const data = doc.data();

          if (data.remainingToken < 20) {
            lowStockItems.push({
              id: doc.id,
              meal: data.meal,
              remainingToken: data.remainingToken,
            });
          }
        });

        setLowTokens(lowStockItems);
      },
      (error) => {
        console.error("[HomeScreen] ERROR in token listener:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome,</Text>
          <Text style={styles.name}>{user?.name || ""}</Text>
        </View>

        {/* Notification Section */}
        {notification && (
          <View style={styles.noticeBox}>
            <Text style={styles.noticeTitle}>{notification.title}</Text>
            <Text style={styles.noticeMessage}>{notification.message}</Text>
          </View>
        )}

        {/* Action Cards Row 1 */}
        <View style={styles.actions}>
          <ActionCard
            icon="restaurant-outline"
            label="View Menu"
            onPress={() =>
              router.push("/is_signed_in/student_staff/ShowMenu")
            }
          />
          <ActionCard
            icon="receipt-outline"
            label="My Orders"
            onPress={() =>
              router.push("/is_signed_in/student_staff/MyOrders")
            }
          />
        </View>

        {/* Action Cards Row 2 */}
        <View style={styles.actions}>
          <ActionCard
            icon="wallet-outline"
            label="Tokens"
            onPress={() =>
              router.push("/is_signed_in/student_staff/Tokens")
            }
          />
          <ActionCard
            icon="time-outline"
            label="Order History"
            onPress={() =>
              router.push("/is_signed_in/student_staff/OrderHistory")
            }
          />
        </View>

        <View style={styles.actions}>
          <ActionCard
            icon="trophy-outline"
            label="Reward"
            onPress={() =>
              router.push("/is_signed_in/student_staff/UserRewardScreen")
            }
          />
          <ActionCard
            icon="calendar-outline"
            label="Weekly Subscription"
            onPress={() =>
              router.push("/is_signed_in/student_staff/Weekly")
            }
          />
        </View>

        {/* Token Stock Alerts */}
        {lowTokens.length > 0 && (
          <View style={styles.bannerContainer}>
            <Text style={styles.bannerTitle}>Stock Alerts</Text>

            {lowTokens.map((item) => {
              const isFinished = item.remainingToken === 0;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.banner,
                    isFinished
                      ? styles.bannerFinished
                      : styles.bannerLow,
                  ]}
                >
                  <View style={styles.bannerLeft}>
                    <Ionicons
                      name={
                        isFinished
                          ? "close-circle-outline"
                          : "alert-circle-outline"
                      }
                      size={18}
                      color={isFinished ? "#fff" : ORANGE}
                    />

                    <Text
                      style={[
                        styles.bannerMeal,
                        isFinished && styles.bannerTextWhite,
                      ]}
                    >
                      {item.meal || "Unknown Item"}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.bannerCount,
                      isFinished && styles.bannerTextWhite,
                    ]}
                  >
                    {isFinished ? "Sold Out" : `${item.remainingToken} left`}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>

      {/* Bottom Navbar */}
      <View style={styles.navbar}>
        <NavItem icon="home" label="Home" active />

        <NavItem
          icon="sparkles-outline"
          label="Special Food"
          onPress={() =>
            router.push("/is_signed_in/student_staff/SpecialFood")
          }
        />

        <NavItem
          icon="notifications-outline"
          label="Notification"
          onPress={() =>
            router.push("/is_signed_in/student_staff/Notification")
          }
        />

        <NavItem
          icon="person-outline"
          label="Profile"
          onPress={() =>
            router.push("/is_signed_in/student_staff/ProfileScreen")
          }
        />
      </View>
    </SafeAreaView>
  );
}

function ActionCard({ icon, label, onPress }) {
  return (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={30} color={ORANGE} />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

function NavItem({ icon, label, onPress, active, danger }) {
  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={24}
        color={danger ? "#E53935" : active ? ORANGE : "#888"}
      />

      <Text
        style={[
          styles.navText,
          active && { color: ORANGE, fontWeight: "bold" },
          danger && { color: "#E53935" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
