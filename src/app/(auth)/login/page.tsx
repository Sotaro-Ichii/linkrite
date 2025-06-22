"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signInWithRedirect, GoogleAuthProvider } from "firebase/auth";
import { auth, createGoogleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // クライアントサイドでのみ実行
  useEffect(() => {
    setIsClient(true);
  }, []);

  // コンポーネントマウント時にFirebaseの状態を確認
  useEffect(() => {
    if (!isClient) return;

    const checkFirebaseStatus = () => {
      const info = [];
      info.push(`Auth object exists: ${!!auth}`);
      info.push(`Auth currentUser: ${auth?.currentUser?.email || 'none'}`);
      info.push(`Window location: ${window.location.origin}`);
      setDebugInfo(info.join(' | '));
    };

    checkFirebaseStatus();
  }, [isClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home");
    } catch (error: any) {
      console.error("Email login error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      console.log("Starting Google login process...");
      
      const googleProvider = createGoogleProvider();
      if (!googleProvider) {
        const errorMsg = "Firebase設定が正しく初期化されていません。環境変数を確認してください。";
        console.error(errorMsg);
        setError(errorMsg);
        return;
      }

      console.log("Google provider created, attempting sign in...");
      
      // 現在のURLをログに出力
      console.log("Current URL:", window.location.href);
      console.log("Current origin:", window.location.origin);
      
      await signInWithRedirect(auth, googleProvider);
      console.log("Sign in with redirect called successfully");
      
    } catch (error: any) {
      console.error("Google login error details:", {
        code: error.code,
        message: error.message,
        email: error.email,
        credential: error.credential
      });
      
      let errorMessage = "Googleログイン中にエラーが発生しました。";
      
      // エラーコードに基づいてより具体的なメッセージを表示
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = "ログインポップアップが閉じられました。";
          break;
        case 'auth/popup-blocked':
          errorMessage = "ポップアップがブロックされました。ポップアップを許可してください。";
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = "ログインがキャンセルされました。";
          break;
        case 'auth/unauthorized-domain':
          errorMessage = "このドメインは認証に使用できません。";
          break;
        default:
          errorMessage = error.message || "Googleログイン中にエラーが発生しました。";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // クライアントサイドでのみレンダリング
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            アカウントにログイン
          </h2>
        </div>
        
        {/* デバッグ情報（開発環境のみ） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-xs text-yellow-800">{debugInfo}</p>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "ログイン中..." : "Googleでログイン"}
            </button>
          </div>

          <div className="text-center">
            <Link href="/signup" className="text-indigo-600 hover:text-indigo-500">
              アカウントをお持ちでない方はこちら
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
