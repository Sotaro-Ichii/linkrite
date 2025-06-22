// src/app/layout.tsx
"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { getRedirectResult } from "firebase/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Linkrite",
  description: "Connect creators and editors in Japan",
};

export default function RootLayout({
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

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}

