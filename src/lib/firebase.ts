// src/lib/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQxRNPpFascM-VThU0cGmddhKOLY3h4dc",
  authDomain: "xcodevault.firebaseapp.com",
  projectId: "xcodevault",
  storageBucket: "xcodevault.firebasestorage.app",
  messagingSenderId: "866677200340",
  appId: "1:866677200340:web:05b37e95c1023d8cb47241",
  measurementId: "G-1XKG83QQ1C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db }
