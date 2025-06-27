// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDjGC9K4cSbmDOwav1j9m4rx36oKB7FUjs",
  authDomain: "g-remind-41d9a.firebaseapp.com",
  projectId: "g-remind-41d9a",
  storageBucket: "g-remind-41d9a.firebasestorage.app",
  messagingSenderId: "961638120180",
  appId: "1:961638120180:android:a7a885255a6617a371bca1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
