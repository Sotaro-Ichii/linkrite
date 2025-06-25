"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import Link from "next/link";
import EarnPostCard from "@/components/EarnPostCard";
import { createGoogleProvider } from "@/lib/firebase";

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [rewardCondition, setRewardCondition] = useState("");
  const [platform, setPlatform] = useState("YouTube");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [tab, setTab] = useState('earn');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (tab !== 'earn') return;
    const q = query(collection(db, "earnPosts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, [tab]);

  const handleGoogleLogin = async () => {
    const googleProvider = createGoogleProvider();
    if (!googleProvider) {
      console.error("Failed to create google provider.");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Google login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("ログインしてください。");
      return;
    }

    try {
      await addDoc(collection(db, "earnPosts"), {
        title,
        description,
        budget: parseInt(budget),
        rewardCondition,
        platform,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || "匿名",
        authorPhotoURL: currentUser.photoURL || "",
        createdAt: serverTimestamp(),
        currentAmount: 0,
      });

      setTitle("");
      setDescription("");
      setBudget("");
      setRewardCondition("");
      setPlatform("YouTube");
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = selectedPlatform === "all" || post.platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* ヘッダー */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">LinqLet</h1>
              <p className="text-gray-600">クリエイターと編集者をつなぐプラットフォーム</p>
            </div>
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <Link href={`/profile/${currentUser.uid}`} className="btn-ghost">
                  <div className="flex items-center space-x-2">
                    <img 
                      src={currentUser.photoURL || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='12' fill='%23e5e7eb'/%3E%3Ctext x='12' y='16' text-anchor='middle' fill='%236b7280' font-size='12'%3E👤%3C/text%3E%3C/svg%3E"} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full"
                    />
                    <span>{currentUser.displayName}</span>
                  </div>
                </Link>
                <button onClick={handleLogout} className="btn-secondary">
                  ログアウト
                </button>
              </div>
            ) : (
              <button onClick={handleGoogleLogin} className="btn-primary">
                Googleでログイン
              </button>
            )}
          </div>
        </div>

        {/* タブ */}
        <div className="mb-8">
          <div className="flex space-x-2 border-b border-gray-200">
            <button
              onClick={() => setTab('feed')}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                tab === 'feed'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              フィード
            </button>
            <button
              onClick={() => setTab('earn')}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                tab === 'earn'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              稼ぐ
            </button>
            <button
              onClick={() => setTab('learn')}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                tab === 'learn'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              学ぶ
            </button>
          </div>
        </div>

        {/* 稼ぐタブのコンテンツ */}
        {tab === 'earn' && (
          <>
            {/* 検索・フィルター */}
            <div className="card p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="search-term" className="block text-sm font-medium text-gray-700 mb-2">検索</label>
                  <input
                    type="text"
                    id="search-term"
                    name="search-term"
                    placeholder="案件を検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="platform-select" className="block text-sm font-medium text-gray-700 mb-2">プラットフォーム</label>
                  <select
                    id="platform-select"
                    name="platform-select"
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">すべて</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Instagram">Instagram</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <div className="text-sm text-gray-600">
                    {filteredPosts.length}件の案件が見つかりました
                  </div>
                </div>
              </div>
            </div>

            {/* 投稿フォーム */}
            {currentUser && (
              <div className="card p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">新しい案件を投稿</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">タイトル</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">プラットフォーム</label>
                      <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option>YouTube</option>
                        <option>TikTok</option>
                        <option>Instagram</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">仕事内容</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">予算（円）</label>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">報酬条件</label>
                    <input
                      type="text"
                      value={rewardCondition}
                      onChange={(e) => setRewardCondition(e.target.value)}
                      placeholder="例: 1000再生あたり"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <button type="submit" className="btn-primary">
                    投稿する
                  </button>
                </form>
              </div>
            )}

            {/* 案件一覧 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <EarnPostCard key={post.id} post={post} />
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-500">条件に一致する案件が見つかりませんでした</p>
              </div>
            )}
          </>
        )}

        {/* フィードと学ぶタブのプレースホルダー */}
        {tab === 'feed' && (
          <div className="card p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-700">フィード機能</h2>
            <p className="text-gray-500 mt-2">この機能は現在開発中です。お楽しみに！</p>
          </div>
        )}
        {tab === 'learn' && (
          <div className="card p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-700">学ぶ機能</h2>
            <p className="text-gray-500 mt-2">この機能は現在開発中です。お楽しみに！</p>
          </div>
        )}

      </div>
    </div>
  );
}
