"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { getRedirectResult } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // リダイレクト後の認証結果を確認
    getRedirectResult(auth).then((result) => {
      if (result) {
        console.log("認証成功:", result.user.displayName);
        // 認証成功時にホームページに遷移
        router.push("/home");
      }
    }).catch((error) => {
      console.error("認証エラー:", error);
    });
  }, [router]);

  return <>{children}</>;
} 