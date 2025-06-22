// src/lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Vercelのログで実際に使われている環境変数を確認するためのデバッグコード
console.log("Firebase Config Used:", {
  apiKey: firebaseConfig.apiKey ? "Loaded" : "NOT LOADED",
  authDomain: firebaseConfig.authDomain ? "Loaded" : "NOT LOADED",
  projectId: firebaseConfig.projectId ? "Loaded" : "NOT LOADED",
  storageBucket: firebaseConfig.storageBucket ? "Loaded" : "NOT LOADED",
  messagingSenderId: firebaseConfig.messagingSenderId ? "Loaded" : "NOT LOADED",
  appId: firebaseConfig.appId ? "Loaded" : "NOT LOADED",
});

let app;
if (getApps().length === 0) {
  if (
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  ) {
    app = initializeApp(firebaseConfig);
  } else {
    console.error("Firebase config is missing or incomplete. Firebase has not been initialized.");
  }
} else {
  app = getApp();
}

// Firebaseの各サービス
// appが初期化されている場合のみエクスポート
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = app ? new GoogleAuthProvider() : null;
