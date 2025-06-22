"use client";

import Image from "next/image";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { FaYoutube, FaTwitter, FaInstagram, FaTiktok } from 'react-icons/fa';
import { useState } from "react";

const platformIcons: { [key: string]: React.ReactNode } = {
  YouTube: <FaYoutube className="text-red-500" />,
  Twitter: <FaTwitter className="text-blue-400" />,
  X: <FaTwitter className="text-gray-800" />,
  Instagram: <FaInstagram className="text-pink-500" />,
  Tiktok: <FaTiktok className="text-black" />,
};

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

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "YouTube":
        return "bg-red-500";
      case "TikTok":
        return "bg-black";
      case "Instagram":
        return "bg-gradient-to-r from-purple-500 to-pink-500";
      default:
        return "bg-gray-500";
    }
  };

  const paidOut = post.paidOut ?? 0;
  const totalBudget = post.totalBudget ?? Number(post.budget) ?? 0;
  const percentage = totalBudget > 0 ? (paidOut / totalBudget) * 100 : 0;
  const createdAtDate = post.createdAt?.toDate();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center mb-3">
        <Link href={`/profile/${post.authorId}`}>
          <Image
            src={imageError ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e5e7eb'/%3E%3Ctext x='20' y='25' text-anchor='middle' fill='%236b7280' font-size='16'%3E👤%3C/text%3E%3C/svg%3E" : (post.authorPhotoURL || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e5e7eb'/%3E%3Ctext x='20' y='25' text-anchor='middle' fill='%236b7280' font-size='16'%3E👤%3C/text%3E%3C/svg%3E")}
            alt={post.authorName}
            width={40}
            height={40}
            className="rounded-full mr-3"
            onError={handleImageError}
          />
        </Link>
        <div className="flex-grow">
          <p className="font-bold text-gray-800 dark:text-gray-200">{post.title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <Link href={`/profile/${post.authorId}`} className="hover:underline">
              {post.authorName}
            </Link>
          </p>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {createdAtDate ? timeAgo(createdAtDate) : ""}
        </p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center text-sm mb-1">
          <p className="text-gray-600 dark:text-gray-300">
            ${paidOut.toLocaleString()} of ${totalBudget.toLocaleString()} paid out
          </p>
          <p className="font-semibold text-gray-700 dark:text-gray-200">{percentage.toFixed(0)}%</p>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center mb-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type</p>
          <p className="font-semibold text-gray-800 dark:text-gray-200">{post.type}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Platform</p>
          <div className="flex justify-center items-center text-2xl">
            {platformIcons[post.platform] || <p className="font-semibold text-sm">{post.platform}</p>}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reward</p>
          <div className="bg-blue-600 text-white text-sm font-bold rounded-md px-3 py-1 inline-block">
            {post.reward}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-center">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <Link href={`/earn/${post.id}`} className="hover:underline">
            詳細と応募はこちら
          </Link>
        </p>
        {/*
        <div className="flex items-center">
          <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
          <p className="text-xs text-gray-500">0 online</p>
        </div>
        */}
      </div>
    </div>
  );
} 