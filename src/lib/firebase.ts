// src/lib/firebase.ts

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// デバッグ用：環境変数の確認
console.log("Firebase Config Check:", {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId,
});

let app: FirebaseApp | undefined;
const apps = getApps();

if (apps.length === 0) {
  // 環境変数がすべて存在する場合のみ初期化
  if (Object.values(firebaseConfig).every(Boolean)) {
    try {
      app = initializeApp(firebaseConfig);
      console.log("Firebase app initialized successfully");
    } catch (error) {
      console.error("Error initializing Firebase app:", error);
    }
  } else {
    console.error("Firebase config is missing or incomplete. Firebase has not been initialized.");
    console.error("Missing environment variables:", Object.entries(firebaseConfig).filter(([key, value]) => !value).map(([key]) => key));
  }
} else {
  app = getApp();
  console.log("Using existing Firebase app");
}

// appが初期化されている場合のみエクスポート
export const auth = app ? getAuth(app) : ({} as any);
export const db = app ? getFirestore(app) : ({} as any);

// 開発環境でのエミュレーター接続（必要に応じて）
if (process.env.NODE_ENV === 'development' && app) {
  // エミュレーターを使用する場合は以下のコメントを外す
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

// Google認証プロバイダーの設定を改善
export const createGoogleProvider = () => {
  if (!app) {
    console.error("Firebase app is not initialized");
    return null;
  }
  
  try {
    const provider = new GoogleAuthProvider();
    // 追加のスコープを設定
    provider.addScope('email');
    provider.addScope('profile');
    
    // カスタムパラメータを設定（必要に応じて）
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    console.log("Google provider created successfully");
    return provider;
  } catch (error) {
    console.error("Error creating Google provider:", error);
    return null;
  }
};
