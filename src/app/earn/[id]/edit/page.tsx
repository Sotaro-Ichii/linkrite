"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

type Post = {
  id: string;
  title: string;
  description: string;
  budget: string;
  platform: string;
  authorId: string;
};

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [platform, setPlatform] = useState("YouTube");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      const docRef = doc(db, "earnPosts", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const postData = { id: docSnap.id, ...docSnap.data() } as Post;
        setPost(postData);
        setTitle(postData.title);
        setDescription(postData.description);
        setBudget(postData.budget);
        setPlatform(postData.platform);
      } else {
        setError("投稿が見つかりません。");
      }
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  useEffect(() => {
    if (post && currentUser && post.authorId !== currentUser.uid) {
        alert("権限がありません。");
        router.push(`/earn/${id}`);
    }
  }, [post, currentUser, id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    try {
      const postRef = doc(db, "earnPosts", id);
      await updateDoc(postRef, {
        title,
        description,
        budget,
        platform,
      });
      alert("投稿を更新しました。");
      router.push(`/earn/${id}`);
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("更新中にエラーが発生しました。");
    }
  };

  if (loading) return <div className="text-center p-10">読み込み中...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
  if (!post || !currentUser || post.authorId !== currentUser.uid) {
    return <div className="text-center p-10">権限がありません。</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">投稿を編集する</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">タイトル</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">仕事内容</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700">バジェット（円）</label>
          <input
            type="number"
            id="budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="platform" className="block text-sm font-medium text-gray-700">プラットフォーム</label>
          <select
            id="platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option>YouTube</option>
            <option>TikTok</option>
            <option>Instagram</option>
          </select>
        </div>
        <div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            更新する
          </button>
        </div>
      </form>
    </div>
  );
} 