import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyACitjGNZKiolYr4pJgO6OBjLrYDi7ZVak",
  authDomain: "project-3474244849912746648.firebaseapp.com",
  databaseURL: "https://project-3474244849912746648-default-rtdb.firebaseio.com",
  projectId: "project-3474244849912746648",
  storageBucket: "project-3474244849912746648.firebasestorage.app",
  messagingSenderId: "474883506244",
  appId: "1:474883506244:web:fd5172c9d716704a177c11",
  measurementId: "G-J24STPM2MN"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getDatabase(app);
