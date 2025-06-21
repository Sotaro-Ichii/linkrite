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

  if (!post) return <p>読み込み中...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
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
                      <span>{app.applicantName}（{app.status}）</span>
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
  );
}
