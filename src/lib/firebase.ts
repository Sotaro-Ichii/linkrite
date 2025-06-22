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

// 環境変数が一つでも欠けているかチェック
const isConfigMissing = Object.values(firebaseConfig).some(value => !value);

let app;

if (isConfigMissing) {
  console.error("🔴 FATAL ERROR: Firebase environment variables are missing or incomplete. Please check your Vercel project settings.");
  // 意図的にエラーを発生させるか、何もしないことで、後続の処理でエラーを発生させる
} else {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

// @ts-ignore
export const auth = getAuth(app);
// @ts-ignore
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
