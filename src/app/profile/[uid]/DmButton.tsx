"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

interface Props {
  targetUserId: string;
}

export default function DmButton({ targetUserId }: Props) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading || !currentUser) return null;
  if (currentUser.uid === targetUserId) return null;

  // DMルーム作成 or 既存ルーム遷移
  const handleDm = async () => {
    setProcessing(true);
    try {
      // 既存ルーム検索（members配列に両者が含まれるもの）
      const q = query(
        collection(db, "dmRooms"),
        where("members", "array-contains", currentUser.uid)
      );
      const snapshot = await getDocs(q);
      let roomId = "";
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (Array.isArray(data.members) && data.members.includes(targetUserId)) {
          roomId = doc.id;
        }
      });
      // なければ新規作成
      if (!roomId) {
        const newRoom = await addDoc(collection(db, "dmRooms"), {
          members: [currentUser.uid, targetUserId],
          lastMessage: "",
          lastMessageAt: serverTimestamp(),
          lastMessageSender: "",
          unreadCount: {
            [currentUser.uid]: 0,
            [targetUserId]: 0,
          },
        });
        roomId = newRoom.id;
      }
      router.push(`/dm/${roomId}`);
    } catch (e) {
      alert("DMルームの作成に失敗しました");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <button
      onClick={handleDm}
      className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 ml-2"
      disabled={processing}
    >
      {processing ? "移動中..." : "DMする"}
    </button>
  );
} 