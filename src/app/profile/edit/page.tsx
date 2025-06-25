"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    country: "",
    city: "",
    website: "",
    linkedin: "",
    twitter: "",
    instagram: "",
    github: "",
    youtube: "",
    tiktok: "",
    occupation: "",
    skills: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
      
      // 既存のプロフィール情報を取得
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setFormData({
            displayName: userData.displayName || user.displayName || "",
            bio: userData.bio || "",
            country: userData.country || "",
            city: userData.city || "",
            website: userData.website || "",
            linkedin: userData.linkedin || "",
            twitter: userData.twitter || "",
            instagram: userData.instagram || "",
            github: userData.github || "",
            youtube: userData.youtube || "",
            tiktok: userData.tiktok || "",
            occupation: userData.occupation || "",
            skills: userData.skills || "",
          });
        } else {
          // ユーザードキュメントが存在しない場合は、デフォルト値を設定
          setFormData({
            displayName: user.displayName || "",
            bio: "",
            country: "",
            city: "",
            website: "",
            linkedin: "",
            twitter: "",
            instagram: "",
            github: "",
            youtube: "",
            tiktok: "",
            occupation: "",
            skills: "",
          });
        }
      } catch (error) {
        console.error("プロフィール情報の取得に失敗しました:", error);
        // エラーが発生した場合もデフォルト値を設定
        setFormData({
          displayName: user.displayName || "",
          bio: "",
          country: "",
          city: "",
          website: "",
          linkedin: "",
          twitter: "",
          instagram: "",
          github: "",
          youtube: "",
          tiktok: "",
          occupation: "",
          skills: "",
        });
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!formData.displayName.trim()) {
      alert("ユーザー名は必須です");
      return;
    }
    if (!formData.skills.trim()) {
      alert("スキルは必須です");
      return;
    }
    
    setSaving(true);
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      
      // ユーザードキュメントが存在するかチェック
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        // 既存のドキュメントを更新
        await updateDoc(userDocRef, {
          ...formData,
          updatedAt: new Date(),
        });
      } else {
        // 新規ドキュメントを作成
        await setDoc(userDocRef, {
          ...formData,
          email: user.email,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      alert("プロフィールを更新しました！");
      router.push(`/profile/${user.uid}`);
    } catch (error) {
      console.error("プロフィール更新に失敗しました:", error);
      alert("プロフィールの更新に失敗しました。もう一度お試しください。");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">プロフィール編集</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
              ユーザー名 *
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ユーザー名を入力してください"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              自己紹介
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="自己紹介を入力してください"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                居住国
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 日本"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                都市名
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 東京"
              />
            </div>
          </div>

          <div>
            <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-2">
              職業
            </label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 動画編集者"
            />
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
              スキル（カンマ区切りで入力）*
            </label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: Premiere Pro, After Effects, Photoshop"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
              ウェブサイト
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <input
                type="text"
                id="linkedin"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="LinkedInのユーザー名またはURL"
              />
            </div>
            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-2">
                X（旧Twitter）
              </label>
              <input
                type="text"
                id="twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="@username"
              />
            </div>
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <input
                type="text"
                id="instagram"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Instagramのユーザー名"
              />
            </div>
            <div>
              <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub
              </label>
              <input
                type="text"
                id="github"
                name="github"
                value={formData.github}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="GitHubのユーザー名"
              />
            </div>
            <div>
              <label htmlFor="youtube" className="block text-sm font-medium text-gray-700 mb-2">
                YouTube
              </label>
              <input
                type="text"
                id="youtube"
                name="youtube"
                value={formData.youtube}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="YouTubeのチャンネルURL"
              />
            </div>
            <div>
              <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700 mb-2">
                TikTok
              </label>
              <input
                type="text"
                id="tiktok"
                name="tiktok"
                value={formData.tiktok}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="TikTokのユーザー名"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </form>
      </div>
    </div>
  );
} 