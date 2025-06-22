"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { getRedirectResult, onAuthStateChanged, User } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ログインリダイレクト直後の処理
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // 認証情報があればホームページへ
          console.log("Redirect result obtained, redirecting to /home");
          router.push("/home");
        }
      })
      .catch((error) => {
        console.error("Error getting redirect result:", error);
      });

    // 認証状態の変更を監視するリスナー
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        // ユーザーがログインしている場合
        const authPages = ["/", "/login", "/signup"];
        if (authPages.includes(pathname)) {
            // 現在地がLPや認証ページなら、ホームページへ
            console.log("User is logged in on an auth page, redirecting to /home");
            router.push("/home");
        }
      }
    });

    // コンポーネントが使われなくなったら監視を解除
    return () => unsubscribe();
  }, [pathname, router]);

  return <>{children}</>;
} 