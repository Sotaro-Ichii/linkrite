"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/home");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto mt-20 p-6 border rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-4">ログイン</h1>
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
        onClick={handleLogin}
        className="bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
      >
        メールアドレスでログイン
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
        onClick={handleGoogleLogin}
        className="bg-red-600 text-white py-3 rounded hover:bg-red-700 transition"
      >
        Googleでログイン
      </button>

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );
}
