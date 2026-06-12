import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // 新增
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBCGchSZL0fRFl1aANhZHtL1hBVDY1wdjM",
  authDomain: "app-midterm-da9d5.firebaseapp.com",
  projectId: "app-midterm-da9d5",
  storageBucket: "app-midterm-da9d5.firebasestorage.app",
  messagingSenderId: "779981896475",
  appId: "1:779981896475:web:2559b87e54f526ae1531be",
  measurementId: "G-W13NL558E0"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app); // 初始化 Firestore

export { auth, db };