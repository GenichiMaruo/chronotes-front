// /page.tsx
'use client'; // この行を追加

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // next/router ではなく next/navigation を使用
import { getCookie } from './lib/cookie'; // クッキー操作用の関数をインポート

const MainPage = () => {
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ログイン状態を管理
  const router = useRouter();

  useEffect(() => {
    const token = getCookie('token');
    if (token) {
      setIsLoggedIn(true);
      fetchDiaryEntries(token);
    }
  }, []);

  const fetchDiaryEntries = async (token: string) => {
    try {
      const res = await fetch('/api/diary', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setDiaryEntries(data.entries);
      }
    } catch (err) {
      console.error('Failed to fetch diary entries', err);
    }
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      {!isLoggedIn && (
        <div className="absolute top-5 left-5">
          <button
            onClick={handleLoginClick}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            ログイン
          </button>
        </div>
      )}

      <h1 className="text-4xl font-bold mb-6">日記帳アプリへようこそ</h1>

      {!isLoggedIn ? (
        <p className="text-lg text-gray-700">
          日記帳アプリでは、毎日の出来事を簡単に記録することができます。ログインして、あなたの日記を書き始めましょう。
        </p>
      ) : (
        <div>
          {diaryEntries.length > 0 ? (
            <ul className="space-y-4">
              {diaryEntries.map((entry: { id: number; content: string }) => (
                <li key={entry.id} className="bg-white p-4 rounded-lg shadow">
                  {entry.content}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-lg text-gray-700">日記はまだありません。</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MainPage;
