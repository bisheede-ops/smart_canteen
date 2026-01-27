import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDoI4dQOqbvsZOgclfILQP6vY3GqvTaMzk",
  authDomain: "smartcanteen-d84d4.firebaseapp.com",
  projectId: "smartcanteen-d84d4",
  storageBucket: "smartcanteen-d84d4.firebasestorage.app",
  messagingSenderId: "929648620442",
  appId: "1:929648620442:web:48f576b0ff247faeca4023"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);

