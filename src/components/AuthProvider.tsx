"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { getRedirectResult, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // リダイレクト後の認証結果を確認
    getRedirectResult(auth).then((result) => {
      if (result) {
        console.log("認証成功:", result.user.displayName);
        // 認証成功時にホームページに遷移
        router.push("/home");
      }
      setIsInitialized(true);
    }).catch((error) => {
      console.error("認証エラー:", error);
      setIsInitialized(true);
    });

    // 認証状態の変更を監視
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !isInitialized) {
        console.log("ユーザー認証状態確認:", user.displayName);
        // リダイレクト後の場合のみホームページに遷移
        if (window.location.pathname === "/" || window.location.pathname === "/login" || window.location.pathname === "/signup") {
          router.push("/home");
        }
      }
    });

    return () => unsubscribe();
  }, [router, isInitialized]);

  return <>{children}</>;
} 