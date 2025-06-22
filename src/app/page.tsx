// src/app/page.tsx
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-white">
          Linkriteへようこそ！
        </h1>

        <p className="mt-4 text-lg sm:text-xl text-blue-100 max-w-2xl">
          クリエイターと編集者をつなぐプラットフォーム。
          あなたのプロジェクトに最適なパートナーを見つけ、素晴らしいコンテンツを共に創り上げましょう。
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/signup"
            className="px-8 py-3 text-lg font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            無料で始める
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 text-lg font-semibold rounded-md text-blue-700 bg-white border border-blue-600 hover:bg-gray-100 transition"
          >
            ログイン
          </Link>
        </div>
      </main>

      <footer className="w-full h-20 flex items-center justify-center border-t border-blue-800">
        <p className="text-blue-200">
          &copy; {new Date().getFullYear()} Linkrite. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
