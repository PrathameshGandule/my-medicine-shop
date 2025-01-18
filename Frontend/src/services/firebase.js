import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBiZg7GzxwBvUbVPxKE38ys53e9rbKZ8_c",
  authDomain: "authphoneotp-a7bff.firebaseapp.com",
  projectId: "authphoneotp-a7bff",
  storageBucket: "authphoneotp-a7bff.firebasestorage.app",
  messagingSenderId: "866799131142",
  appId: "1:866799131142:web:881ddba0023d0936a30187",
  measurementId: "G-MZL3ELK5C1",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Enable Firestore offline persistence (useful for offline functionality)
enableIndexedDbPersistence(db)
  .catch((err) => {
    console.error("Persistence error:", err);
  });

// Optional: Configure Firebase Authentication settings
auth.languageCode = "en"; // Set language code
auth.settings.appVerificationDisabledForTesting = false; // Set true only for testing

// Set persistence for authentication (use browserLocalPersistence to maintain the session even after browser reload)
setPersistence(auth, browserLocalPersistence)
  .catch((err) => {
    console.error("Persistence error in auth:", err);
  });

export default app;
