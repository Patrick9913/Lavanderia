// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBodTBaIWXlLt6tcYUXssL1DOHmFf--FQY",
  authDomain: "lavanderia-15c00.firebaseapp.com",
  projectId: "lavanderia-15c00",
  storageBucket: "lavanderia-15c00.firebasestorage.app",
  messagingSenderId: "687334290353",
  appId: "1:687334290353:web:41508d5dbb4a4e4bc18390"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const auth = getAuth(app)