"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { getRedirectResult, onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";

const saveUserToFirestore = async (user: User) => {
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // Firestoreにユーザーが存在しない場合のみ新規作成
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
      }, { merge: true });
      console.log("New user saved to Firestore:", user.displayName);
    }
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
  }
};

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    console.log("=== AuthProvider mounted ===");
    console.log("Pathname:", pathname);
    console.log("Auth object status:", {
      exists: !!auth,
      currentUser: auth?.currentUser?.email || 'none',
      isInitialized: auth?.app?.options?.projectId ? 'yes' : 'no',
      authDomain: auth?.app?.options?.authDomain,
      projectId: auth?.app?.options?.projectId
    });

    let isInitialized = false;

    // 認証状態の変更を監視するリスナー
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      console.log("=== Auth state changed ===");
      console.log("User:", user ? `Email: ${user.email}, UID: ${user.uid}` : 'No user');
      
      if (!isInitialized) {
        // 初回のみリダイレクト結果を確認
        isInitialized = true;
        
        try {
          console.log("=== Checking for redirect result ===");
          const result = await getRedirectResult(auth);
          console.log("getRedirectResult result:", result ? 'exists' : 'null');
          
          if (result) {
            console.log("=== Redirect result found ===");
            console.log("User details:", {
              uid: result.user.uid,
              email: result.user.email,
              providerId: result.user.providerId,
              displayName: result.user.displayName
            });
            
            await saveUserToFirestore(result.user);
            console.log("=== Redirecting to /home after successful authentication ===");
            router.push("/home");
            return; // リダイレクト結果がある場合は、ここで処理を終了
          } else {
            console.log("=== No redirect result found ===");
          }
        } catch (error: any) {
          console.error("=== Error getting redirect result ===", error);
          if (error.code) {
            console.error("Error code:", error.code);
          }
          if (error.message) {
            console.error("Error message:", error.message);
          }
        }
      }
      
      // 通常の認証状態変更処理
      if (user) {
        console.log("=== User authenticated ===");
        console.log("User details:", {
          displayName: user.displayName,
          email: user.email,
          providerData: user.providerData
        });
        
        await saveUserToFirestore(user);
        const authPages = ["/login", "/signup"];
        if (authPages.includes(pathname)) {
            console.log("=== User is logged in on an auth page, redirecting to /home ===");
            router.push("/home");
        }
      } else {
        console.log("=== User signed out ===");
        // ログアウト時は認証ページにリダイレクト
        /*
        const authPages = ["/login", "/signup"];
        if (!authPages.includes(pathname)) {
          console.log("=== User signed out, redirecting to login page ===");
          router.push("/login");
        }
        */
      }
    });

    // コンポーネントが使われなくなったら監視を解除
    return () => {
      console.log("=== AuthProvider unmounting, cleaning up listeners ===");
      unsubscribe();
    };
  }, [pathname, router, isClient]);

  // クライアントサイドでのみレンダリング
  if (!isClient) {
    return <>{children}</>;
  }

  return <>{children}</>;
} 