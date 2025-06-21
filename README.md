This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Linkrite（リンクライト）

日本版Whopを目指した、案件マッチング・教育コンテンツ販売プラットフォーム。

## 🔧 技術スタック
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Firebase（Auth, Firestore）
- Stripe（予定）

## 🔑 主な機能
- Googleログイン
- 案件投稿（稼ぐタブ）
- 教材投稿（学ぶタブ）
- 応募・承認機能
- 応募ステータス表示
- 投稿者プロフィール表示
- ログイン／ログアウト制御

## 📌 今後の追加予定（優先順）
1. プロフィール編集
2. 応募者プロフィール閲覧リンク
3. 検索・フィルター機能
4. 教材課金機能（Stripe）
5. 投稿編集・削除
6. 通知機能
7. Google以外のログイン手段

## 🔗 構成ファイル
- `/app/home/page.tsx`: メインページ（タブ切替、投稿一覧）
- `/app/earn/[id]/page.tsx`: 案件詳細ページ（応募・承認など）
- `/app/profile/[uid]/page.tsx`: 投稿者プロフィールページ
- `/lib/firebase.ts`: Firebase接続設定

## 🧠 補足
このアプリは、日本国内のYouTube編集者やコンテンツクリエイターが報酬型で案件を見つけ、教材を販売・購入できることを目的に構築されています。
