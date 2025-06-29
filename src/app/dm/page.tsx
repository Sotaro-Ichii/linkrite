"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, getDoc, doc } from "firebase/firestore";

export default function DMListPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "dmRooms"),
      where("members", "array-contains", currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const roomsData: any[] = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        // 相手ユーザーID
        const otherUid = (data.members || []).find((uid: string) => uid !== currentUser.uid);
        // 相手ユーザー情報取得
        let otherUser = null;
        if (otherUid) {
          const userDoc = await getDoc(doc(db, "users", otherUid));
          otherUser = userDoc.exists() ? userDoc.data() : null;
        }
        return {
          id: docSnap.id,
          ...data,
          otherUser,
        };
      }));
      // 最新メッセージ順にソート
      roomsData.sort((a, b) => b.lastMessageAt?.toDate?.() - a.lastMessageAt?.toDate?.());
      setRooms(roomsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  if (!currentUser) {
    return <div className="text-center py-20 text-gray-500">ログインしてください</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">ダイレクトメッセージ</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        {loading ? (
          <div className="text-center text-gray-500">読み込み中...</div>
        ) : rooms.length === 0 ? (
          <div className="text-center text-gray-500">DM履歴がありません</div>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <Link
                key={room.id}
                href={`/dm/${room.id}`}
                className="flex items-center justify-between p-3 border rounded hover:bg-purple-50 transition"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={room.otherUser?.photoURL || "/logo-icon.png"}
                    alt="user"
                    className="w-10 h-10 rounded-full object-cover bg-gray-200"
                  />
                  <div>
                    <div className="font-semibold">{room.otherUser?.displayName || "ユーザー"}</div>
                    <div className="text-xs text-gray-500 line-clamp-1 max-w-[180px]">
                      {room.lastMessage || "まだメッセージがありません"}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {room.lastMessageAt?.toDate ?
                    room.lastMessageAt.toDate().toLocaleString("ja-JP", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) :
                    ""
                  }
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 