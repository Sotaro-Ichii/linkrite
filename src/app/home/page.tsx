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
import { onAuthStateChanged, signInWithRedirect, signOut, GoogleAuthProvider } from "firebase/auth";
import Link from "next/link";
import EarnPostCard from "@/components/EarnPostCard";

export default function HomePage() {
  const [tab, setTab] = useState<"feed" | "earn" | "learn">("feed");
  const [showModal, setShowModal] = useState(false);
  const [showLearnModal, setShowLearnModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");

  const [form, setForm] = useState({
    title: "",
    budget: "",
    description: "",
    platform: "",
    reward: "",
    type: "Clipping",
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

  // フィルタリングされた投稿
  const filteredEarnPosts = earnPosts.filter((post) => {
    const matchesSearch = searchTerm === "" || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlatform = platformFilter === "" || post.platform === platformFilter;
    
    return matchesSearch && matchesPlatform;
  });

  // 利用可能なプラットフォーム一覧
  const availablePlatforms = Array.from(new Set(earnPosts.map(post => post.platform))).filter(Boolean);

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

  const handleGoogleLogin = async () => {
    const googleProvider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      console.error("Google login error:", error);
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
        uid: currentUser.uid,
        displayName: currentUser.displayName || "匿名",
        photoURL: currentUser.photoURL,
        email: currentUser.email,
      }, { merge: true });

      await addDoc(collection(db, "earnPosts"), {
        ...form,
        totalBudget: Number(form.budget) || 0,
        paidOut: 0,
        createdAt: serverTimestamp(),
        authorId: currentUser.uid,
        authorName: currentUser.displayName || "匿名",
        authorPhotoURL: currentUser.photoURL || "",
      });

      alert("案件が保存されました！");
      setShowModal(false);
      setForm({ title: "", budget: "", description: "", platform: "", reward: "", type: "Clipping" });
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
          <div className="flex items-center gap-4">
            <Link 
              href={`/profile/${currentUser.uid}`}
              className="text-blue-600 hover:underline"
            >
              プロフィール
            </Link>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-1 rounded">
              ログアウト
            </button>
          </div>
        ) : (
          <button onClick={handleGoogleLogin} className="bg-blue-600 text-white px-4 py-1 rounded">
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

          {/* 検索・フィルター */}
          <div className="mb-6 space-y-4">
            <div>
              <input
                type="text"
                placeholder="案件を検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべてのプラットフォーム</option>
                {availablePlatforms.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredEarnPosts.map((post) => (
            <EarnPostCard key={post.id} post={post} />
          ))}
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

      {/* 「稼ぐ」投稿モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">新しい案件を投稿</h2>
            <div className="space-y-4">
              <input type="text" placeholder="タイトル" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full p-2 border rounded" />
              <div>
                <label className="text-sm text-gray-600">タイプ</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full p-2 border rounded bg-white">
                  <option value="Clipping">切り抜き</option>
                  <option value="Editing">動画編集</option>
                  <option value="Thumbnail">サムネイル作成</option>
                  <option value="Translation">翻訳</option>
                  <option value="Other">その他</option>
                </select>
              </div>
              <input type="number" placeholder="予算" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full p-2 border rounded" />
              <textarea placeholder="仕事内容" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-2 border rounded" rows={3}></textarea>
              <input type="text" placeholder="プラットフォーム（例: YouTube, X）" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="w-full p-2 border rounded" />
              <input type="text" placeholder="成果報酬" value={form.reward} onChange={(e) => setForm({ ...form, reward: e.target.value })} className="w-full p-2 border rounded" />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">キャンセル</button>
              <button onClick={handlePost} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">投稿する</button>
            </div>
          </div>
        </div>
      )}

      {/* 「学ぶ」投稿モーダル */}
      {showLearnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">新しい教材を投稿</h2>
            <div className="space-y-4">
              <input type="text" placeholder="タイトル" value={learnForm.title} onChange={(e) => setLearnForm({ ...learnForm, title: e.target.value })} className="w-full p-2 border rounded" />
              <input type="text" placeholder="目次" value={learnForm.outline} onChange={(e) => setLearnForm({ ...learnForm, outline: e.target.value })} className="w-full p-2 border rounded" />
              <textarea placeholder="説明" value={learnForm.description} onChange={(e) => setLearnForm({ ...learnForm, description: e.target.value })} className="w-full p-2 border rounded" rows={4}></textarea>
              <input type="text" placeholder="値段" value={learnForm.price} onChange={(e) => setLearnForm({ ...learnForm, price: e.target.value })} className="w-full p-2 border rounded" />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setShowLearnModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">キャンセル</button>
              <button onClick={handleLearnPost} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">投稿する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
