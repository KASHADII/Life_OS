import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBq2BvMk-0EsKRdxS-f6eRLGLzJoN8wVjg",
  authDomain: "lifeos-a6e90.firebaseapp.com",
  databaseURL: "https://lifeos-a6e90-default-rtdb.firebaseio.com",
  projectId: "lifeos-a6e90",
  storageBucket: "lifeos-a6e90.firebasestorage.app",
  messagingSenderId: "1025418601282",
  appId: "1:1025418601282:web:6d8f3aef96b559ae111edb",
  measurementId: "G-M3BK29RBQN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const database = getDatabase(app);
