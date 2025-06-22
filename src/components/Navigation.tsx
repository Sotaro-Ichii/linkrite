"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <nav className={`fixed top-0 left-0 z-50 w-full shadow-sm border-b ${
      isHomePage ? 'bg-transparent' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link 
              href="/home" 
              className={`flex items-center space-x-2 transition-colors duration-200 ${
                isHomePage 
                  ? 'text-white hover:text-blue-200' 
                  : 'text-gray-900 hover:text-blue-600'
              }`}
            >
              <svg 
                className="w-6 h-6" 
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
              <span className="font-semibold">ホーム</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {!isHomePage && (
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
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