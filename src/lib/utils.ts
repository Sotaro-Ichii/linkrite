import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: Date | null | undefined): string {
  if (!date) return "日付不明";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}秒前`;
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分前`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}時間前`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}日前`;
  }
  
  return date.toLocaleDateString("ja-JP");
}

export const timeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + "年前";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + "ヶ月前";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + "日前";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + "時間前";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + "分前";
  }
  return Math.floor(seconds) + "秒前";
}; 