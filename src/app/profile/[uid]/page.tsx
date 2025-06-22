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
import EditProfileButton from "./EditProfileButton";

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {userData?.displayName || "ユーザー"} のプロフィール
        </h1>
        <EditProfileButton userId={uid} />
      </div>

      {/* プロフィール情報セクション */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          {userData?.bio && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">自己紹介</h3>
              <p className="text-gray-600">{userData.bio}</p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-4">
            {userData?.website && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">ウェブサイト</h3>
                <a 
                  href={userData.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {userData.website}
                </a>
              </div>
            )}
            
            {userData?.twitter && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Twitter</h3>
                <a 
                  href={`https://twitter.com/${userData.twitter.replace('@', '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {userData.twitter}
                </a>
              </div>
            )}
            
            {userData?.github && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">GitHub</h3>
                <a 
                  href={`https://github.com/${userData.github}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {userData.github}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

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
