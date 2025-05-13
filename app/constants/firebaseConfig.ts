// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration (replace with info from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyARDVp4S1gCqthn3VYpKTQJv--Sl_xaqD8",
  authDomain: "fir-project-esp32.firebaseapp.com",
  databaseURL: "https://fir-project-esp32-default-rtdb.firebaseio.com",
  projectId: "fir-project-esp32",
  storageBucket: "fir-project-esp32.firebasestorage.app",
  messagingSenderId: "656047656204",
  appId: "1:656047656204:web:0bde420be3a1f5d8dfcd29",
  measurementId: "G-RZR300WEJ2"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, auth, firestore };

