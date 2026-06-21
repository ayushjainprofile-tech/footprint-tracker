import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "footprint-tracker-260621",
  appId: "1:930681159206:web:20301526b50f39f8ec70e7",
  storageBucket: "footprint-tracker-260621.firebasestorage.app",
  apiKey: "AIzaSyBtPrVwH6SvGnCZTMS75_bkLXwxc-AsV0U",
  authDomain: "footprint-tracker-260621.firebaseapp.com",
  messagingSenderId: "930681159206"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = getAuth(app);

export { db, auth };
