
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDGfL79llIdN7m_aeaULqOq9CSRBnuiIjA",
  authDomain: "dsa-tracker-f073c.firebaseapp.com",
  projectId: "dsa-tracker-f073c",
  storageBucket: "dsa-tracker-f073c.firebasestorage.app",
  messagingSenderId: "53124076710",
  appId: "1:53124076710:web:82bc32f111d12c2ab0d067",
  measurementId: "G-5GKXDSYWM3"
};

// Initialize Firebase
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

export { app, db, auth };

