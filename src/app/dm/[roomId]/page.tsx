"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc
} from "firebase/firestore";

export default function DMRoomPage() {
  const params = useParams();
  const roomId = params?.roomId as string;
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ログインユーザー取得
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // ルーム情報取得
  useEffect(() => {
    if (!roomId) return;
    const fetchRoom = async () => {
      const roomDoc = await getDoc(doc(db, "dmRooms", roomId));
      setRoom(roomDoc.exists() ? roomDoc.data() : null);
    };
    fetchRoom();
  }, [roomId]);

  // メッセージリアルタイム取得
  useEffect(() => {
    if (!roomId) return;
    const q = query(
      collection(db, "dmRooms", roomId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [roomId]);

  // スクロール自動追従
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // メッセージ送信
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentUser) return;
    setSending(true);
    try {
      await addDoc(collection(db, "dmRooms", roomId, "messages"), {
        senderId: currentUser.uid,
        text: input,
        createdAt: serverTimestamp(),
      });
      // ルーム情報も更新
      await updateDoc(doc(db, "dmRooms", roomId), {
        lastMessage: input,
        lastMessageAt: serverTimestamp(),
        lastMessageSender: currentUser.uid,
      });
      setInput("");
    } catch (e) {
      alert("送信に失敗しました");
    } finally {
      setSending(false);
    }
  };

  if (!currentUser) {
    return <div className="text-center py-20 text-gray-500">ログインしてください</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">チャットルーム</h1>
      <div className="bg-white rounded-lg shadow-md p-6 min-h-[400px] flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4" style={{ maxHeight: 400 }}>
          {messages.length === 0 ? (
            <div className="text-gray-600 text-center mt-10">メッセージ履歴がありません</div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === currentUser.uid ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[70%] break-words shadow text-sm ${
                      msg.senderId === currentUser.uid
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        <form className="flex space-x-2" onSubmit={handleSend} autoComplete="off">
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="メッセージを入力..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={sending}
            autoFocus
          />
          <button type="submit" className="btn-primary px-6 py-2" disabled={sending || !input.trim()}>
            送信
          </button>
        </form>
      </div>
    </div>
  );
} 