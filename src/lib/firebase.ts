// src/lib/firebase.ts

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
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

let app: FirebaseApp | undefined;
const apps = getApps();
if (apps.length === 0) {
  // 環境変数がすべて存在する場合のみ初期化
  if (Object.values(firebaseConfig).every(Boolean)) {
    app = initializeApp(firebaseConfig);
  } else {
    console.error("Firebase config is missing or incomplete. Firebase has not been initialized.");
    console.error("Missing environment variables:", Object.entries(firebaseConfig).filter(([key, value]) => !value).map(([key]) => key));
  }
} else {
  app = getApp();
}

// appが初期化されている場合のみエクスポート
export const auth = app ? getAuth(app) : ({} as any);
export const db = app ? getFirestore(app) : ({} as any);

// Google認証プロバイダーの設定を改善
export const createGoogleProvider = () => {
  if (!app) {
    console.error("Firebase app is not initialized");
    return null;
  }
  const provider = new GoogleAuthProvider();
  // 追加のスコープを設定（必要に応じて）
  provider.addScope('email');
  provider.addScope('profile');
  return provider;
};
