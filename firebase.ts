// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyASNeFiwuiIH-nnFKnUmEbbYWno0CcGFKc",
  authDomain: "rerun-38ff8.firebaseapp.com",
  projectId: "rerun-38ff8",
  storageBucket: "rerun-38ff8.firebasestorage.app",
  messagingSenderId: "171318693972",
  appId: "1:171318693972:web:7a1ad926ed1e6751411dc1",
  measurementId: "G-LNFET02CLP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);