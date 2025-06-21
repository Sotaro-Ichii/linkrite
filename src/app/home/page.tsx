"use client";

import { useEffect, useState } from "react";
import { db, auth, googleProvider } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  doc,
  where,
} from "firebase/firestore";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import Link from "next/link";

export default function HomePage() {
  const [tab, setTab] = useState<"feed" | "earn" | "learn">("feed");
  const [showModal, setShowModal] = useState(false);
  const [showLearnModal, setShowLearnModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [form, setForm] = useState({
    title: "",
    budget: "",
    description: "",
    platform: "",
    reward: "",
  });

  const [learnForm, setLearnForm] = useState({
    title: "",
    outline: "",
    description: "",
    price: "",
  });

  const [earnPosts, setEarnPosts] = useState<any[]>([]);
  const [learnPosts, setLearnPosts] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "earnPosts"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setEarnPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, "learnPosts"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setLearnPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "applications"),
      where("applicantUid", "==", currentUser.uid)
    );
    return onSnapshot(q, (snapshot) => {
      setApplications(snapshot.docs.map((doc) => doc.data()));
    });
  }, [currentUser]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      alert("ログインに失敗しました: " + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      alert("ログアウトに失敗しました: " + err.message);
    }
  };

  const handlePost = async () => {
    if (!currentUser) return alert("ログインが必要です。");

    try {
      await setDoc(doc(db, "users", currentUser.uid), {
        displayName: currentUser.displayName || "匿名",
      });

      await addDoc(collection(db, "earnPosts"), {
        ...form,
        createdAt: serverTimestamp(),
        authorId: currentUser.uid,
        authorName: currentUser.displayName || "匿名",
      });

      alert("案件が保存されました！");
      setShowModal(false);
      setForm({ title: "", budget: "", description: "", platform: "", reward: "" });
    } catch (err: any) {
      alert("エラー：" + err.message);
    }
  };

  const handleLearnPost = async () => {
    if (!currentUser) return alert("ログインが必要です。");

    try {
      await setDoc(doc(db, "users", currentUser.uid), {
        displayName: currentUser.displayName || "匿名",
      });

      await addDoc(collection(db, "learnPosts"), {
        ...learnForm,
        createdAt: serverTimestamp(),
        authorId: currentUser.uid,
        authorName: currentUser.displayName || "匿名",
      });

      alert("教材が保存されました！");
      setShowLearnModal(false);
      setLearnForm({ title: "", outline: "", description: "", price: "" });
    } catch (err: any) {
      alert("エラー：" + err.message);
    }
  };

  const handleApply = async (postId: string) => {
    if (!currentUser) return alert("ログインが必要です。");

    try {
      await addDoc(collection(db, "applications"), {
        postId,
        applicantUid: currentUser.uid,
        applicantName: currentUser.displayName || "匿名",
        appliedAt: new Date(),
        status: "pending",
      });
      alert("応募が完了しました！");
    } catch (err: any) {
      alert("応募に失敗しました: " + err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Linkrite ホーム</h1>
        {currentUser ? (
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-1 rounded">
            ログアウト
          </button>
        ) : (
          <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-1 rounded">
            Googleでログイン
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        {(["feed", "earn", "learn"] as const).map((name) => (
          <button
            key={name}
            className={`px-4 py-2 rounded ${tab === name ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setTab(name)}
          >
            {name === "feed" ? "フィード" : name === "earn" ? "稼ぐ" : "学ぶ"}
          </button>
        ))}
      </div>

      {/* フィード */}
      {tab === "feed" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">フィード投稿（例）</h2>
          <p>🌟 「クリエイターA」が新しい案件を投稿しました！</p>
        </div>
      )}

      {/* 稼ぐ */}
      {tab === "earn" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">案件一覧</h2>
            <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => setShowModal(true)}>
              ＋ 投稿
            </button>
          </div>

          {earnPosts.map((post) => {
            const application = applications.find((app) => app.postId === post.id);

            return (
              <div key={post.id} className="block border p-4 rounded mb-4 hover:bg-gray-100 dark:hover:bg-gray-800">
                <Link href={`/earn/${post.id}`} className="block">
                  <p><strong>タイトル：</strong> {post.title}</p>
                  <p><strong>報酬：</strong> {post.reward}</p>
                  <p><strong>プラットフォーム：</strong> {post.platform}</p>
                </Link>
                <p>
                  <strong>投稿者：</strong>{" "}
                  <Link href={`/profile/${post.authorId}`} className="text-blue-600 underline hover:text-blue-800">
                    {post.authorName}
                  </Link>
                </p>

                {currentUser?.uid !== post.authorId && (
                  application ? (
                    <p className="mt-2 text-sm text-yellow-400">
                      応募済み：{application.status === "approved"
                        ? "承認済み"
                        : application.status === "rejected"
                        ? "却下"
                        : "審査中"}
                    </p>
                  ) : (
                    <button className="mt-2 px-4 py-1 bg-green-600 text-white rounded" onClick={() => handleApply(post.id)}>
                      応募する
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 学ぶ */}
      {tab === "learn" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">教材一覧</h2>
            <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => setShowLearnModal(true)}>
              ＋ 投稿
            </button>
          </div>

          {learnPosts.map((post) => (
            <div key={post.id} className="border p-4 rounded mb-2 text-sm">
              <p><strong>タイトル：</strong> {post.title}</p>
              <p><strong>目次：</strong> {post.outline}</p>
              <p><strong>説明：</strong> {post.description}</p>
              <p><strong>値段：</strong> {post.price}</p>
              <p><strong>投稿者：</strong> <Link href={`/profile/${post.authorId}`} className="text-blue-600 underline hover:text-blue-800">{post.authorName}</Link></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
