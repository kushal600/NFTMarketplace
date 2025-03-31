import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAOLWYKXtuWX1-E90yScmLnJP1pN2j4CWU",
  authDomain: "nftproject-64e6b.firebaseapp.com",
  projectId: "nftproject-64e6b",
  storageBucket: "nftproject-64e6b.firebasestorage.app",
  messagingSenderId: "521442071283",
  appId: "1:521442071283:web:b3c4e4c5175cb020cd5d86",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
