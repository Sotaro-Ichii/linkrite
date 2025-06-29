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
import DmButton from "./DmButton";

interface Props {
  params: Promise<{
    uid: string;
  }>;
}

export default async function ProfilePage({ params }: Props) {
  const { uid } = await params;

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
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {userData?.displayName || "ユーザー"} のプロフィール
          </h1>
          {/* 編集ボタンとDMボタンを横並びで表示 */}
          <div className="flex items-center">
            {userData && <EditProfileButton userId={uid} />}
            {userData && <DmButton targetUserId={uid} />}
          </div>
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
            {/* 居住地・職業 */}
            {(userData?.country || userData?.city || userData?.occupation) && (
              <div className="flex flex-wrap gap-6">
                {(userData?.country || userData?.city) && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">居住地</h3>
                    <p className="text-gray-600">
                      {[userData?.country, userData?.city].filter(Boolean).join("・")}
                    </p>
                  </div>
                )}
                {userData?.occupation && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">職業</h3>
                    <p className="text-gray-600">{userData.occupation}</p>
                  </div>
                )}
              </div>
            )}
            {/* スキル */}
            {userData?.skills && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">スキル</h3>
                <div className="flex flex-wrap gap-2">
                  {userData.skills.split(',').map((skill: string, i: number) => (
                    <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{skill.trim()}</span>
                  ))}
                </div>
              </div>
            )}
            {/* ウェブサイト・SNS */}
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
              {userData?.linkedin && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">LinkedIn</h3>
                  <a
                    href={userData.linkedin.startsWith('http') ? userData.linkedin : `https://www.linkedin.com/in/${userData.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {userData.linkedin}
                  </a>
                </div>
              )}
              {userData?.twitter && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">X（旧Twitter）</h3>
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
              {userData?.instagram && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Instagram</h3>
                  <a
                    href={`https://instagram.com/${userData.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {userData.instagram}
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
              {userData?.youtube && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">YouTube</h3>
                  <a
                    href={userData.youtube.startsWith('http') ? userData.youtube : `https://www.youtube.com/${userData.youtube}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {userData.youtube}
                  </a>
                </div>
              )}
              {userData?.tiktok && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">TikTok</h3>
                  <a
                    href={userData.tiktok.startsWith('http') ? userData.tiktok : `https://www.tiktok.com/@${userData.tiktok.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {userData.tiktok}
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
    </div>
  );
}
