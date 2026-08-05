import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALXu3KkcdQLGjcnMP965WmOIEeHEL34YP0",
  authDomain: "stockflow-444d3.firebaseapp.com",
  projectId: "stockflow-444d3",
  storageBucket: "stockflow-444d3.firebasestorage.app",
  messagingSenderId: "371219189239",
  appId: "1:371219189239:web:0b827598685f0ca7bcb2f2",
  measurementId: "G-538V7WFJJ1",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
