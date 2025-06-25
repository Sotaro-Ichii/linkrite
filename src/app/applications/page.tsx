"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ApplicationsPage() {
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
    <div className="max-w-xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md text-center">
      <h1 className="text-2xl font-bold mb-6">応募一覧</h1>
      <p className="text-gray-600">まだ応募機能は未実装です。今後ここに自分が応募した案件一覧が表示されます。</p>
    </div>
  );
} 