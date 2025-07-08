// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDbEiHntp7lTPktQymM8_-AidubXENUpjw",
  authDomain: "g-remind-7aacb.firebaseapp.com",
  projectId: "g-remind-7aacb",
  storageBucket: "g-remind-7aacb.firebasestorage.app",
  messagingSenderId: "809725747088",
  appId: "1:809725747088:android:9b900e84bd17f962f25d15"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

