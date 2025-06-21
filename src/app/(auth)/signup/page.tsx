"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        username,
        createdAt: new Date(),
      });

      router.push("/home");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto mt-20 p-4 border rounded">
      <h1 className="text-xl font-bold">Sign Up</h1>
      <input
        type="text"
        placeholder="Username"
        className="border p-2 rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        className="border p-2 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleSignUp}
        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Create Account
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
