import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDpveQ-a_mdeDZvCr8KDLuKNGJ7y4CEU4w",
  authDomain: "hay-f5.firebaseapp.com",
  projectId: "hay-f5",
  storageBucket: "hay-f5.firebasestorage.app",
  messagingSenderId: "186326537666",
  appId: "1:186326537666:web:1ff8e1254ffe9ad1d4f25b"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);