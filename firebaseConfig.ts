import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDSCEMoX5C8MwNfCCZSsDoiE8coY-KpC-U",
  authDomain: "apf-gym.firebaseapp.com",
  projectId: "apf-gym",
  storageBucket: "apf-gym.firebasestorage.app",
  messagingSenderId: "443201238666",
  appId: "1:443201238666:web:c3031c3a79d91bed531f73",
  measurementId: "G-55JYW41KFM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app)