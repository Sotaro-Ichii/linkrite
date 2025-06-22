"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { getRedirectResult } from "firebase/auth";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // リダイレクト後の認証結果を確認
    getRedirectResult(auth).then((result) => {
      if (result) {
        console.log("認証成功:", result.user.displayName);
      }
    }).catch((error) => {
      console.error("認証エラー:", error);
    });
  }, []);

  return <>{children}</>;
} 