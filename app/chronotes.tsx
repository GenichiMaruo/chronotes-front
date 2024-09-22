import React, { useState, useEffect } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from '@/components/ui/calendar'
import Header from "@/components/header";
import HeaderMobile from '@/components/header-mobile'
import SummaryBlock from "@/components/summary-block";
import { useApiUrl } from '@/components/api-provider'
import { getCookie } from '@/lib/cookie'
import Editor from '@/components/editor'
import { Memo } from '@/lib/types'

// カスタムフック：画面サイズがlg以下かどうかを判定
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

export default function Chronotes() {
  const [memos, setMemos] = useState<Memo[]>(() => {
    const savedMemos = localStorage.getItem('memos')
    return savedMemos ? JSON.parse(savedMemos) : []
  })

  const [selectedMemo, setSelectedMemo] = useState<Memo>(memos[0])
  const [isSidebarVisible, setSidebarVisible] = useState(true) // 表示非表示の管理
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const apiUrl = useApiUrl()

  const [isDarkMode, setIsDarkMode] = useState(false)
  useEffect(() => {
    const updateDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }

    // 初期チェック
    updateDarkMode()

    // MutationObserverを使ってテーマの変更を監視
    const observer = new MutationObserver(updateDarkMode)
    observer.observe(document.documentElement, { attributes: true })
    // 画面初回表示時にデータを消去し、APIから再取得
    const initializeData = async () => {
      localStorage.removeItem('memos')  // ローカルストレージをクリア
      setMemos([])  // メモリ上のデータもクリア
    }
    initializeData()

    return () => observer.disconnect()
  }, [])

  const [date, setDate] = React.useState<Date | undefined>(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set the time to 00:00:00
    return now;
  });

  useEffect(() => {
    const fetchMemoData = async (selectedDate: Date) => {
      console.log('fetchMemoData', selectedDate);
      // 選択された日付がローカルにあるか確認
      const savedMemos = localStorage.getItem('memos');
      const parsedMemos: Memo[] = savedMemos ? JSON.parse(savedMemos) : [];
      const existingMemo = parsedMemos.find(memo => memo.date === selectedDate.toISOString());

      if (existingMemo) {
        setSelectedMemo(existingMemo);
      } else {
        // 存在しない場合はAPIから取得
        const token = getCookie('token');
        if (!token) return;

        try {
          const response = await fetch(`${apiUrl}/fake`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            const newMemo: Memo = {
              id: selectedDate.getTime(),
              date: selectedDate.toISOString(),
              title: selectedDate.toLocaleDateString(),
              content: data.content || 'no contents',
            };

            const updatedMemos = [...parsedMemos, newMemo];
            setMemos(updatedMemos);
            localStorage.setItem('memos', JSON.stringify(updatedMemos));
            setSelectedMemo(newMemo);
          } else {
            console.error('Failed to fetch notes');
          }
        } catch (error) {
          console.error('Error fetching notes:', error);
        }
      }
    };

    if (date) {
      fetchMemoData(date);
    }
  }, [date]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-1 overflow-hidden relative">
        {/* サイドバー（エントリーリスト） */}
        <aside
          className={`w-[300px] lg:relative lg:block absolute top-0 left-0 h-full transition-transform duration-300 border-r p-4 flex flex-col bg-white z-40 ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
          style={{ backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            memoData={memos.map(memo => ({ date: memo.date, charcount: memo.content.length }))}
            className={`rounded-md border flex justify-center transition-all duration-300 ${isMobile ? 'mt-20' : ''}`}
          />
          <ScrollArea className="flex-1 h-[50vh] my-10">
            <div className="w-[250px] truncate">
              {memos
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((memo) => (
                  <div
                    key={memo.id}
                    className={`p-2 mb-2 cursor-pointer rounded group ${selectedMemo.id === memo.id ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
                    onClick={() => setSelectedMemo(memo)}
                  >
                    <div className="flex justify-between items-center w-auto">
                      <div className="truncate">
                        <h3 className="font-medium truncate">{memo.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {typeof memo.content === 'string'
                            ? memo.content.replace(/<[^>]*>/g, '').slice(memo.title.length)
                            : ''}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">{memo.charCount || 0}文字</span> {/* 文字数を表示 */}
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </aside>

        {/* メインエリア */}
        <main className="flex-1">
          {isMobile ? (
            <HeaderMobile
              isLoggedIn={true}
              isSidebarVisible={isSidebarVisible}
              setSidebarVisible={setSidebarVisible}
            />
          ) : (
            <Header isLoggedIn={true} />
          )}
          {/* メインエリアのコンテンツ 最大幅60 */}
          <div className="px-4 flex flex-col h-[90vh] max-w-[60rem] mx-auto">
            <div className="flex-none">
              <SummaryBlock />
            </div>
            <div className="flex-1 overflow-y-auto">
              {/* Editorコンポーネントを使用 */}
              <Editor selectedMemo={selectedMemo} setMemos={setMemos} memos={memos} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}