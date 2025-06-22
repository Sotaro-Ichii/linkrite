"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    // ログインリダイレクト直後の処理
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          console.log("Redirect result obtained for user:", result.user.displayName);
          await saveUserToFirestore(result.user);
          console.log("Redirecting to /home");
          router.push("/home");
        }
      })
      .catch((error) => {
        console.error("Error getting redirect result:", error);
        // エラーの詳細をログに出力
        if (error.code) {
          console.error("Error code:", error.code);
        }
        if (error.message) {
          console.error("Error message:", error.message);
        }
      });

    // 認証状態の変更を監視するリスナー
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        console.log("User authenticated:", user.displayName);
        await saveUserToFirestore(user);
        const authPages = ["/", "/login", "/signup"];
        if (authPages.includes(pathname)) {
            console.log("User is logged in on an auth page, redirecting to /home");
            router.push("/home");
        }
      } else {
        console.log("User signed out");
      }
    });

    // コンポーネントが使われなくなったら監視を解除
    return () => unsubscribe();
  }, [pathname, router]);

  return <>{children}</>;
} 