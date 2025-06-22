"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

export default function EarnDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [showApplicants, setShowApplicants] = useState(false);
  const [myApplication, setMyApplication] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      const docRef = doc(db, "earnPosts", id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchPost();
  }, [id]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!post || !showApplicants) return;
    const q = query(collection(db, "applications"), where("postId", "==", post.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setApplications(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [post, showApplicants]);

  useEffect(() => {
    if (!post || !currentUser) return;
    const checkApplication = async () => {
      const q = query(
        collection(db, "applications"),
        where("postId", "==", post.id),
        where("applicantUid", "==", currentUser.uid)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setMyApplication({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      }
    };
    checkApplication();
  }, [post, currentUser]);

  const handleApply = async () => {
    if (!currentUser || !post) {
      alert("ログインが必要です");
      return;
    }
    try {
      await addDoc(collection(db, "applications"), {
        postId: post.id,
        applicantUid: currentUser.uid,
        applicantName: currentUser.displayName || "匿名",
        appliedAt: new Date(),
        status: "pending",
      });
      alert("応募が完了しました！");
    } catch (err) {
      alert("応募に失敗しました: " + (err as any).message);
    }
  };

  const handleUpdateStatus = async (appId: string, status: string) => {
    const ref = doc(db, "applications", appId);
    await updateDoc(ref, { status });
  };

  const handleDelete = async () => {
    if (!post || !currentUser || currentUser.uid !== post.authorId) {
      alert("権限がありません。");
      return;
    }

    if (window.confirm("本当にこの投稿を削除しますか？")) {
      try {
        await deleteDoc(doc(db, "earnPosts", post.id));
        alert("投稿を削除しました。");
        // router.push("/home");
      } catch (error) {
        alert("削除中にエラーが発生しました。");
        console.error("Error deleting document: ", error);
      }
    }
  };

  if (!post) return <div className="text-center p-10">読み込み中...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* 投稿者用の編集・削除ボタン */}
      {currentUser?.uid === post.authorId && (
        <div className="flex justify-end gap-2 mb-4">
          <Link href={`/earn/${post.id}/edit`} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
            編集
          </Link>
          <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            削除
          </button>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <div className="space-y-2 text-gray-700">
        <p><strong>仕事内容：</strong> {post.description}</p>
        <p><strong>バジェット：</strong> {post.budget}</p>
        <p><strong>プラットフォーム：</strong> {post.platform}</p>
        <p><strong>成果報酬：</strong> {post.reward}</p>
        <p>
          投稿者：{" "}
          <Link
            href={`/profile/${post.authorId}`}
            className="text-blue-400 underline hover:text-blue-600"
          >
            {post.authorName}
          </Link>
        </p>

        {currentUser?.uid !== post.authorId && (
          myApplication ? (
            <p className="text-green-500 font-semibold mb-4">
              あなたの応募ステータス: {myApplication.status === "pending"
                ? "審査中"
                : myApplication.status === "approved"
                ? "承認済み"
                : "却下"}
            </p>
          ) : (
            <button
              onClick={handleApply}
              className="bg-green-600 text-white px-4 py-2 rounded mb-4"
            >
              応募する
            </button>
          )
        )}

        {currentUser?.uid === post.authorId && (
          <>
            <button
              onClick={() => setShowApplicants(!showApplicants)}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              {showApplicants ? "応募者を隠す" : "応募者一覧を見る"}
            </button>

            {showApplicants && (
              <div className="mt-4 bg-gray-100 p-4 rounded">
                <h2 className="font-semibold mb-2">応募者リスト</h2>
                {applications.length === 0 ? (
                  <p>まだ応募者はいません。</p>
                ) : (
                  <ul className="space-y-2">
                    {applications.map((app) => (
                      <li key={app.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/profile/${app.applicantUid}`}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {app.applicantName}
                          </Link>
                          <span className="text-sm text-gray-600">（{app.status}）</span>
                        </div>
                        <div className="space-x-2">
                          <button
                            onClick={() => handleUpdateStatus(app.id, "approved")}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                          >
                            承認
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.id, "rejected")}
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                          >
                            却下
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
