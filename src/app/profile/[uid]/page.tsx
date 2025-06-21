import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
} from "firebase/firestore";
import Link from "next/link";

interface Props {
  params: {
    uid: string;
  };
}

export default async function ProfilePage({ params }: Props) {
  const { uid } = params;

  // ユーザー情報を取得
  const userDocRef = doc(db, "users", uid);
  const userDocSnap = await getDoc(userDocRef);
  const userData = userDocSnap.exists() ? userDocSnap.data() : null;

  // 投稿を取得
  const q = query(
    collection(db, "earnPosts"),
    where("authorId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as any[];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {userData?.displayName || "ユーザー"} のプロフィール
      </h1>

      <h2 className="text-lg font-semibold mb-4">投稿した案件一覧</h2>
      {posts.length === 0 ? (
        <p className="text-gray-600">まだ投稿がありません。</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="border p-4 rounded mb-4">
            <Link href={`/earn/${post.id}`} className="text-blue-600 hover:underline">
              <p className="font-bold text-lg mb-1">{post.title}</p>
            </Link>
            <p className="text-sm text-gray-700">
              <strong>報酬：</strong> {post.reward} ／ <strong>プラットフォーム：</strong> {post.platform}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
