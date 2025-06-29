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
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
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
  const [feedPosts, setFeedPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [rewardCondition, setRewardCondition] = useState("");
  const [platform, setPlatform] = useState("YouTube");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [tab, setTab] = useState('feed');
  
  // フィード関連の状態
  const [feedContent, setFeedContent] = useState("");
  const [feedImage, setFeedImage] = useState<File | null>(null);
  const [feedImagePreview, setFeedImagePreview] = useState<string>("");
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});

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

  // フィード投稿の取得
  useEffect(() => {
    if (tab !== 'feed') return;
    const q = query(collection(db, "feedPosts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feedData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFeedPosts(feedData);
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

  // フィード投稿の作成
  const handleFeedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("ログインしてください。");
      return;
    }

    if (!feedContent.trim()) {
      alert("投稿内容を入力してください。");
      return;
    }

    try {
      const feedData: any = {
        content: feedContent,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || "匿名",
        authorPhotoURL: currentUser.photoURL || "",
        createdAt: serverTimestamp(),
        likes: [],
        comments: [],
        likeCount: 0,
        commentCount: 0,
      };

      // 画像がある場合はBase64エンコードして保存
      if (feedImage) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const imageData = e.target?.result as string;
          feedData.imageUrl = imageData;
          
          await addDoc(collection(db, "feedPosts"), feedData);
          setFeedContent("");
          setFeedImage(null);
          setFeedImagePreview("");
        };
        reader.readAsDataURL(feedImage);
      } else {
        await addDoc(collection(db, "feedPosts"), feedData);
        setFeedContent("");
        setFeedImage(null);
        setFeedImagePreview("");
      }
    } catch (error) {
      console.error("Error adding feed post: ", error);
    }
  };

  // 画像選択の処理
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFeedImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // いいねの処理
  const handleLike = async (postId: string) => {
    if (!currentUser) {
      alert("ログインしてください。");
      return;
    }

    const postRef = doc(db, "feedPosts", postId);
    const post = feedPosts.find(p => p.id === postId);
    
    if (post?.likes?.includes(currentUser.uid)) {
      // いいねを削除
      await updateDoc(postRef, {
        likes: arrayRemove(currentUser.uid),
        likeCount: increment(-1)
      });
    } else {
      // いいねを追加
      await updateDoc(postRef, {
        likes: arrayUnion(currentUser.uid),
        likeCount: increment(1)
      });
    }
  };

  // コメントの追加
  const handleComment = async (postId: string) => {
    if (!currentUser) {
      alert("ログインしてください。");
      return;
    }

    const commentContent = commentText[postId];
    if (!commentContent?.trim()) {
      alert("コメントを入力してください。");
      return;
    }

    const postRef = doc(db, "feedPosts", postId);
    const comment = {
      id: Date.now().toString(),
      text: commentContent,
      authorId: currentUser.uid,
      authorName: currentUser.displayName || "匿名",
      authorPhotoURL: currentUser.photoURL || "",
      createdAt: serverTimestamp(),
    };

    await updateDoc(postRef, {
      comments: arrayUnion(comment),
      commentCount: increment(1)
    });

    // コメント入力欄をクリア
    setCommentText(prev => ({
      ...prev,
      [postId]: ""
    }));
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

        {/* フィードタブのコンテンツ */}
        {tab === 'feed' && (
          <>
            {/* フィード投稿フォーム */}
            {currentUser && (
              <div className="card p-6 mb-8">
                <div className="flex items-start space-x-4">
                  <img 
                    src={currentUser.photoURL || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='12' fill='%23e5e7eb'/%3E%3Ctext x='12' y='16' text-anchor='middle' fill='%236b7280' font-size='12'%3E👤%3C/text%3E%3C/svg%3E"} 
                    alt="Profile" 
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <form onSubmit={handleFeedSubmit} className="space-y-4">
                      <textarea
                        value={feedContent}
                        onChange={(e) => setFeedContent(e.target.value)}
                        placeholder="何かシェアしましょう..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        required
                      />
                      
                      {/* 画像プレビュー */}
                      {feedImagePreview && (
                        <div className="relative">
                          <img 
                            src={feedImagePreview} 
                            alt="Preview" 
                            className="w-full max-w-md rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFeedImage(null);
                              setFeedImagePreview("");
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="hidden"
                            />
                            <div className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>画像を追加</span>
                            </div>
                          </label>
                        </div>
                        <button 
                          type="submit" 
                          className="btn-primary px-6 py-2"
                          disabled={!feedContent.trim()}
                        >
                          投稿する
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* フィード投稿一覧 */}
            <div className="space-y-6">
              {feedPosts.map((post) => (
                <div key={post.id} className="card p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <img 
                      src={post.authorPhotoURL || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='12' fill='%23e5e7eb'/%3E%3Ctext x='12' y='16' text-anchor='middle' fill='%236b7280' font-size='12'%3E👤%3C/text%3E%3C/svg%3E"} 
                      alt="Profile" 
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-900">{post.authorName}</span>
                        <span className="text-gray-500 text-sm">
                          {post.createdAt?.toDate ? 
                            new Date(post.createdAt.toDate()).toLocaleDateString('ja-JP') : 
                            '最近'
                          }
                        </span>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                      
                      {/* 画像表示 */}
                      {post.imageUrl && (
                        <img 
                          src={post.imageUrl} 
                          alt="Post image" 
                          className="w-full max-w-md rounded-lg mt-4"
                        />
                      )}
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 transition-colors ${
                        post.likes?.includes(currentUser?.uid) 
                          ? 'text-red-500' 
                          : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <svg className="w-5 h-5" fill={post.likes?.includes(currentUser?.uid) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{post.likeCount || 0}</span>
                    </button>
                    
                    <div className="flex items-center space-x-2 text-gray-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{post.commentCount || 0}</span>
                    </div>
                  </div>

                  {/* コメントセクション */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {/* コメント入力 */}
                    {currentUser && (
                      <div className="flex items-start space-x-3 mb-4">
                        <img 
                          src={currentUser.photoURL || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='12' fill='%23e5e7eb'/%3E%3Ctext x='12' y='16' text-anchor='middle' fill='%236b7280' font-size='12'%3E👤%3C/text%3E%3C/svg%3E"} 
                          alt="Profile" 
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1 flex space-x-2">
                          <input
                            type="text"
                            value={commentText[post.id] || ""}
                            onChange={(e) => setCommentText(prev => ({
                              ...prev,
                              [post.id]: e.target.value
                            }))}
                            placeholder="コメントを入力..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => handleComment(post.id)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            送信
                          </button>
                        </div>
                      </div>
                    )}

                    {/* コメント一覧 */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="space-y-3">
                        {post.comments.map((comment: any) => (
                          <div key={comment.id} className="flex items-start space-x-3">
                            <img 
                              src={comment.authorPhotoURL || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='12' fill='%23e5e7eb'/%3E%3Ctext x='12' y='16' text-anchor='middle' fill='%236b7280' font-size='12'%3E👤%3C/text%3E%3C/svg%3E"} 
                              alt="Profile" 
                              className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-semibold text-sm text-gray-900">{comment.authorName}</span>
                                <span className="text-gray-500 text-xs">
                                  {comment.createdAt?.toDate ? 
                                    new Date(comment.createdAt.toDate()).toLocaleDateString('ja-JP') : 
                                    '最近'
                                  }
                                </span>
                              </div>
                              <p className="text-gray-800 text-sm">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {feedPosts.length === 0 && (
                <div className="card p-12 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">まだ投稿がありません</h3>
                  <p className="text-gray-500">最初の投稿をしてみましょう！</p>
                </div>
              )}
            </div>
          </>
        )}

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

        {/* 学ぶタブのプレースホルダー */}
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
