"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <nav className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
      isHomePage 
        ? 'glass-effect' 
        : 'bg-white/95 backdrop-blur-md border-b border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link 
              href="/home" 
              className={`flex items-center space-x-3 transition-all duration-200 group ${
                isHomePage 
                  ? 'text-white hover:text-purple-200 [text-shadow:0_1px_3px_rgb(0_0_0_/_0.4)]' 
                  : 'text-gray-900 hover:text-purple-600'
              }`}
            >
              <img src="/logo.png" alt="LinqLet ロゴ" className="h-8 w-auto mr-2 inline-block align-middle" />
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
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 