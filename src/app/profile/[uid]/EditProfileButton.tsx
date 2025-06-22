"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface Props {
  userId: string;
}

export default function EditProfileButton({ userId }: Props) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return null;
  }

  // 現在のユーザーがプロフィールの所有者でない場合は表示しない
  if (!currentUser || currentUser.uid !== userId) {
    return null;
  }

  return (
    <button
      onClick={() => router.push("/profile/edit")}
      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      プロフィール編集
    </button>
  );
} 