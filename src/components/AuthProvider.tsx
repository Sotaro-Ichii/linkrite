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
  const [isRedirectHandled, setIsRedirectHandled] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    console.log("AuthProvider mounted, pathname:", pathname);
    console.log("Auth object status:", {
      exists: !!auth,
      currentUser: auth?.currentUser?.email || 'none',
      isInitialized: auth?.app?.options?.projectId ? 'yes' : 'no'
    });

    // ログインリダイレクト直後の処理
    const handleRedirectResult = async () => {
      try {
        console.log("Checking for redirect result...");
        const result = await getRedirectResult(auth);
        console.log("getRedirectResult called, result:", result ? 'exists' : 'null');
        
        if (result) {
          console.log("Redirect result obtained for user:", result.user.displayName);
          console.log("User details:", {
            uid: result.user.uid,
            email: result.user.email,
            providerId: result.user.providerId
          });
          
          await saveUserToFirestore(result.user);
          console.log("Redirecting to /home after successful authentication");
          setIsRedirectHandled(true);
          router.push("/home");
        } else {
          console.log("No redirect result found");
          setIsRedirectHandled(true);
        }
      } catch (error: any) {
        console.error("Error getting redirect result:", error);
        // エラーの詳細をログに出力
        if (error.code) {
          console.error("Error code:", error.code);
        }
        if (error.message) {
          console.error("Error message:", error.message);
        }
        if (error.email) {
          console.error("Error email:", error.email);
        }
        if (error.credential) {
          console.error("Error credential:", error.credential);
        }
        setIsRedirectHandled(true);
      }
    };

    handleRedirectResult();
  }, [isClient, router]);

  useEffect(() => {
    if (!isClient || !isRedirectHandled) return;

    // 認証状態の変更を監視するリスナー
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      console.log("Auth state changed:", user ? `User: ${user.email}` : 'No user');
      
      if (user) {
        console.log("User authenticated:", user.displayName);
        console.log("User provider data:", user.providerData);
        
        await saveUserToFirestore(user);
        const authPages = ["/", "/login", "/signup"];
        if (authPages.includes(pathname)) {
            console.log("User is logged in on an auth page, redirecting to /home");
            router.push("/home");
        }
      } else {
        console.log("User signed out");
        // ログアウト時は認証ページにリダイレクト
        const authPages = ["/", "/login", "/signup"];
        if (!authPages.includes(pathname)) {
          console.log("User signed out, redirecting to login page");
          router.push("/login");
        }
      }
    });

    // コンポーネントが使われなくなったら監視を解除
    return () => {
      console.log("AuthProvider unmounting, cleaning up listeners");
      unsubscribe();
    };
  }, [pathname, router, isClient, isRedirectHandled]);

  // クライアントサイドでのみレンダリング
  if (!isClient) {
    return <>{children}</>;
  }

  return <>{children}</>;
} 