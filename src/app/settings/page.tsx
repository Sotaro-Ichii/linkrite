"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="max-w-xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">設定</h1>
      <ul className="space-y-4">
        <li>
          <Link href="/profile/edit" className="block px-4 py-3 bg-blue-50 rounded hover:bg-blue-100 text-blue-700 font-semibold transition">
            プロフィール編集
          </Link>
        </li>
        <li>
          <Link href="/applications" className="block px-4 py-3 bg-blue-50 rounded hover:bg-blue-100 text-blue-700 font-semibold transition">
            応募一覧
          </Link>
        </li>
      </ul>
    </div>
  );
} 