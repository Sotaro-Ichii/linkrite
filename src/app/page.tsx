// src/app/page.tsx
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="gradient-bg min-h-screen relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-20 text-center">
        {/* ヘッダー */}
        <div className="mb-8 animate-fadeInUp">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
            <span className="text-white/90 text-sm font-medium">✨ クリエイターと編集者のマッチングプラットフォーム</span>
          </div>
        </div>

        {/* メインコンテンツ */}
        <main className="flex flex-col items-center justify-center flex-1 max-w-4xl">
          <img src="/logo.png" alt="LinqLet ロゴ" className="h-24 w-auto mb-6 mx-auto" />
          <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 animate-fadeInUp">
            <span className="gradient-text">LinqLet</span>へようこそ！
          </h1>

          <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mb-8 leading-relaxed animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            あなたのプロジェクトに最適なパートナーを見つけ、<br className="hidden sm:block" />
            <span className="font-semibold">素晴らしいコンテンツを共に創り上げましょう</span>
          </p>

          {/* 特徴 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 w-full max-w-4xl animate-fadeInUp" style={{animationDelay: '0.4s'}}>
            <div className="glass-effect p-6 rounded-2xl text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">マッチング</h3>
              <p className="text-white/70 text-sm">最適なパートナーをAIが自動マッチング</p>
            </div>
            
            <div className="glass-effect p-6 rounded-2xl text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">安全な取引</h3>
              <p className="text-white/70 text-sm">エスクロー機能で安心の決済</p>
            </div>
            
            <div className="glass-effect p-6 rounded-2xl text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">品質保証</h3>
              <p className="text-white/70 text-sm">レビューシステムで品質を保証</p>
            </div>
          </div>

          {/* CTAボタン */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fadeInUp" style={{animationDelay: '0.6s'}}>
            <Link href="/signup" className="btn-primary text-lg px-8 py-4">
              無料で始める
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-8 py-4">
              ログイン
            </Link>
          </div>
        </main>

        {/* フッター */}
        <footer className="w-full py-8 border-t border-white/20">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-white/60">
              &copy; {new Date().getFullYear()} LinqLet. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
