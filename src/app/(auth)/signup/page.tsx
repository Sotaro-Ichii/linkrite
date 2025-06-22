"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    if (!username) {
      setError("ユーザー名を入力してください。");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: username });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: username,
        createdAt: new Date(),
      });

      router.push("/home");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      // Firestoreにユーザーが存在しない場合のみ新規作成
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
        });
      }

      router.push("/home");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto mt-20 p-6 border rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-4">アカウント作成</h1>
      <input
        type="text"
        placeholder="ユーザー名"
        className="border p-3 rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="メールアドレス"
        className="border p-3 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="パスワード"
        className="border p-3 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleSignUp}
        className="bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
      >
        メールアドレスで登録
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">または</span>
        </div>
      </div>

      <button
        onClick={handleGoogleSignUp}
        className="bg-red-600 text-white py-3 rounded hover:bg-red-700 transition"
      >
        Googleで登録
      </button>

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      <p className="text-center text-sm text-gray-600 mt-4">
        すでにアカウントをお持ちですか？{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          ログイン
        </Link>
      </p>
    </div>
  );
}
