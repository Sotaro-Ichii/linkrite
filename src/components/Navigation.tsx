"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Navigation() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isFeedPage = pathname === "/home" || pathname.includes("/feed");
  const isApplicationsPage = pathname === "/applications";
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  return (
    <nav className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
      isHomePage 
        ? 'glass-effect' 
        : 'bg-white/95 backdrop-blur-md border-b border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {currentUser && (
              <Link href="/settings" className="mr-2 p-2 rounded-full hover:bg-gray-200 transition-colors" title="設定">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.142-.854-.108-1.204l-.527-.738c.32.447.269 1.06-.12 1.45l.774-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.149-.894z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
            )}
            <Link 
              href="/home" 
              className={`flex items-center space-x-2 transition-all duration-200 group ${
                isHomePage 
                  ? 'text-white hover:text-purple-200 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.4)]' 
                  : 'text-gray-900 hover:text-purple-600'
              }`}
            >
              <img src="/logo-icon.png" alt="LinqLet ロゴ" className="h-7 w-7 mr-1 inline-block align-middle" />
              <span className="font-bold text-lg align-middle tracking-tight">LinqLet</span>
              <div className={`p-2 rounded-xl transition-all duration-200 ${
                isHomePage 
                  ? 'bg-white/20 group-hover:bg-white/30' 
                  : 'bg-purple-100 group-hover:bg-purple-200'
              }`}>
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                  />
                </svg>
              </div>
              <span className="font-semibold text-lg">ホーム</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {!isHomePage && (
              <>
                <Link
                  href="/dm"
                  className="p-2 rounded-lg transition-all duration-200 hover:bg-purple-50"
                  title="ダイレクトメッセージ"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-purple-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 21l16.5-9L3.75 3v7.5l11.25 1.5-11.25 1.5V21z"
                    />
                  </svg>
                </Link>
                <Link 
                  href="/home" 
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    isFeedPage
                      ? 'bg-purple-100 text-purple-600 font-medium'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  フィード
                </Link>
                {currentUser && (
                  <Link 
                    href="/applications" 
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      isApplicationsPage
                        ? 'bg-purple-100 text-purple-600 font-medium'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    応募一覧
                  </Link>
                )}
                <Link 
                  href="/" 
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    isAuthPage 
                      ? 'text-gray-600 hover:text-purple-600 hover:bg-purple-50' 
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  トップページ
                </Link>
              </>
            )}
            {currentUser && (
              <button
                onClick={handleLogout}
                className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-red-500 hover:text-white transition"
              >
                ログアウト
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 