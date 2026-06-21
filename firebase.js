import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCSqDnx7juzisvEq2wFvBnxO-AWoCXqILM",
  authDomain: "rakutan-checker.firebaseapp.com",
  projectId: "rakutan-checker",
  storageBucket: "rakutan-checker.firebasestorage.app",
  messagingSenderId: "1000257457532",
  appId: "1:1000257457532:web:9482fe6c29bf81babd28f9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };