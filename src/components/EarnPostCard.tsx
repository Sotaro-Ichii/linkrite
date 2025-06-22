"use client";

import Link from "next/link";
import { useState } from "react";

export default function EarnPostCard({ post }: { post: any }) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "YouTube":
        return "🔴";
      case "TikTok":
        return "⚫";
      case "Instagram":
        return "📷";
      default:
        return "📱";
    }
  };

  const getPlatformBadgeClass = (platform: string) => {
    switch (platform) {
      case "YouTube":
        return "platform-badge platform-youtube";
      case "TikTok":
        return "platform-badge platform-tiktok";
      case "Instagram":
        return "platform-badge platform-instagram";
      default:
        return "platform-badge bg-gray-500";
    }
  };

  const budget = Number(post.budget) || 0;
  const currentAmount = Number(post.currentAmount) || 0;
  const progressPercentage = budget > 0 ? Math.min((currentAmount / budget) * 100, 100) : 0;

  return (
    <div className="card card-hover overflow-hidden">
      <div className="p-6">
        {/* ヘッダー */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Link href={`/profile/${post.authorId}`}>
              <img
                src={imageError ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e5e7eb'/%3E%3Ctext x='20' y='25' text-anchor='middle' fill='%236b7280' font-size='16'%3E👤%3C/text%3E%3C/svg%3E" : (post.authorPhotoURL || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e5e7eb'/%3E%3Ctext x='20' y='25' text-anchor='middle' fill='%236b7280' font-size='16'%3E👤%3C/text%3E%3C/svg%3E")}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
                onError={handleImageError}
              />
            </Link>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{post.authorName || "匿名"}</h3>
              <p className="text-xs text-gray-500">{post.platform}</p>
            </div>
          </div>
          <div className={getPlatformBadgeClass(post.platform)}>
            {getPlatformIcon(post.platform)}
          </div>
        </div>

        {/* タイトルと説明 */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h2>
          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">{post.description}</p>
        </div>

        {/* 予算と進捗 */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">予算</span>
            <span className="font-bold text-lg gradient-text">¥{budget.toLocaleString()}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>進捗</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-2 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${progressPercentage}%`,
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>現在: ¥{currentAmount.toLocaleString()}</span>
              <span>目標: ¥{budget.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : "日付不明"}
          </span>
          <Link 
            href={`/earn/${post.id}`}
            className="btn-primary text-sm px-4 py-2"
          >
            詳細を見る
          </Link>
        </div>
      </div>
    </div>
  );
} 