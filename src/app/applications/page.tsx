"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import Link from "next/link";

interface Application {
  id: string;
  postId: string;
  postTitle: string;
  postBudget: number;
  postPlatform: string;
  applicantId: string;
  applicantName: string;
  applicantPhotoURL: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message: string;
  appliedAt: any;
  updatedAt: any;
}

export default function ApplicationsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'completed'>('all');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 応募データの取得
  useEffect(() => {
    if (!currentUser) return;

    // インデックスエラーを避けるため、シンプルなクエリを使用
    const q = query(
      collection(db, "applications"),
      where("applicantId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const applicationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Application[];
      
      // クライアントサイドでソート
      applicationsData.sort((a, b) => {
        const dateA = a.appliedAt?.toDate ? a.appliedAt.toDate() : new Date(a.appliedAt);
        const dateB = b.appliedAt?.toDate ? b.appliedAt.toDate() : new Date(b.appliedAt);
        return dateB.getTime() - dateA.getTime(); // 降順（新しい順）
      });
      
      setApplications(applicationsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 応募の取り消し
  const handleCancelApplication = async (applicationId: string) => {
    if (!confirm("この応募を取り消しますか？")) return;

    try {
      await deleteDoc(doc(db, "applications", applicationId));
    } catch (error) {
      console.error("Error canceling application:", error);
      alert("応募の取り消しに失敗しました。");
    }
  };

  // フィルタリングされた応募一覧
  const filteredApplications = applications.filter(app => 
    filter === 'all' || app.status === filter
  );

  // ステータスの日本語表示
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '審査中';
      case 'accepted': return '採用';
      case 'rejected': return '不採用';
      case 'completed': return '完了';
      default: return status;
    }
  };

  // ステータスの色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 日付のフォーマット
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '不明';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="card p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* ヘッダー */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">応募一覧</h1>
              <p className="text-gray-600">あなたが応募した案件の一覧です</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/home" className="btn-ghost">
                ← ホームに戻る
              </Link>
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="card p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              すべて ({applications.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              審査中 ({applications.filter(app => app.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('accepted')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'accepted'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              採用 ({applications.filter(app => app.status === 'accepted').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              不採用 ({applications.filter(app => app.status === 'rejected').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              完了 ({applications.filter(app => app.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* 応募一覧 */}
        <div className="space-y-6">
          {filteredApplications.map((application) => (
            <div key={application.id} className="card p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {application.postPlatform === 'YouTube' ? 'YT' : 
                           application.postPlatform === 'TikTok' ? 'TT' : 'IG'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {application.postTitle}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {getStatusText(application.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">プラットフォーム:</span> {application.postPlatform}
                        </div>
                        <div>
                          <span className="font-medium">予算:</span> ¥{application.postBudget?.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">応募日:</span> {formatDate(application.appliedAt)}
                        </div>
                        <div>
                          <span className="font-medium">更新日:</span> {formatDate(application.updatedAt)}
                        </div>
                      </div>

                      {application.message && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">応募メッセージ:</h4>
                          <p className="text-gray-700 whitespace-pre-wrap">{application.message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
                  <Link
                    href={`/earn/${application.postId}`}
                    className="btn-ghost text-center"
                  >
                    案件詳細を見る
                  </Link>
                  {application.status === 'pending' && (
                    <button
                      onClick={() => handleCancelApplication(application.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      応募を取り消す
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredApplications.length === 0 && (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {filter === 'all' ? 'まだ応募がありません' : `${getStatusText(filter)}の応募がありません`}
              </h3>
              <p className="text-gray-500 mb-4">
                {filter === 'all' 
                  ? '案件に応募すると、ここに表示されます。' 
                  : 'このステータスの応募はありません。'
                }
              </p>
              {filter === 'all' && (
                <Link href="/home" className="btn-primary">
                  案件を探す
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 