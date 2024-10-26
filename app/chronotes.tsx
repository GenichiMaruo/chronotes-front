import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import Header from "@/components/header";
import HeaderMobile from "@/components/header-mobile";
import SummaryBlock from "@/components/summary-block";
import MemoList from "@/components/memo-list";
import Editor from "@/components/editor";
import type { Memo } from "@/lib/types";
import { ApiHandler } from "@/hooks/use-api";
import { FaPen, FaCheck } from "react-icons/fa";

// カスタムフック：画面サイズがlg以下かどうかを判定
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

export default function Chronotes() {
  const [memos, setMemos] = useState<Memo[]>(() => {
    const savedMemos = localStorage.getItem("memos");
    return savedMemos ? JSON.parse(savedMemos) : [];
  });

  const [selectedMemo, setSelectedMemo] = useState<Memo>(memos[0]);
  const [isSidebarVisible, setSidebarVisible] = useState(true); // 表示非表示の管理
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const { apiRequest } = ApiHandler();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loadingDates, setLoadingDates] = useState<Date[]>([]); // 読み込み中の日付リスト
  const [editable, setEditable] = useState(false); // 編集可能かどうか

  // loadingDatesが変更されるたびにコンソールに出力
  useEffect(() => {
    console.log(loadingDates);
  }, [loadingDates]);

  useEffect(() => {
    const updateDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    updateDarkMode();

    const observer = new MutationObserver(updateDarkMode);
    observer.observe(document.documentElement, { attributes: true });

    const initializeData = async () => {
      localStorage.removeItem("memos"); // ローカルストレージをクリア
      setMemos([]); // メモリ上のデータもクリア
    };
    initializeData();

    return () => observer.disconnect();
  }, []);

  const [date, setDate] = React.useState<Date | undefined>(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set the time to 00:00:00
    return now;
  });

  useEffect(() => {
    const fetchMemoData = async (selectedDate: Date) => {
      // ローディング中であれば再びリクエストしない
      if (
        loadingDates.some((date) => date.getTime() === selectedDate.getTime())
      ) {
        return;
      }

      // ローカルストレージにあるか確認
      const savedMemos = localStorage.getItem("memos");
      const parsedMemos: Memo[] = savedMemos ? JSON.parse(savedMemos) : [];
      const existingMemo = parsedMemos.find(
        (memo) => memo.created_at === selectedDate.toISOString(),
      );

      if (existingMemo) {
        setSelectedMemo(existingMemo);
        setLoadingDates(
          loadingDates.filter(
            (date) => date.getTime() !== selectedDate.getTime(),
          ),
        ); // 読み込み中の日付を削除
      } else {
        setLoadingDates([...loadingDates, selectedDate]); // 読み込み中の日付を追加

        try {
          // APIからデータを取得
          const dateParam = encodeURIComponent(selectedDate.toISOString());
          const result = await apiRequest({
            method: "GET",
            url: `/notes?from=${dateParam}&to=${dateParam}&fields=note_id,user_id,title,content,length,tags,created_at,updated_at`,
          });
          const data = result.notes[0];

          if (data) {
            const tags = data.tags ? data.tags.split(",") : [];
            const newMemo: Memo = {
              note_id: data.note_id,
              user_id: data.user_id,
              title: data.title || "no title",
              content: data.content || "no contents",
              tags: tags || [],
              charCount: data.length,
              created_at: data.created_at || selectedDate.toISOString(),
              updated_at: data.updated_at,
            };
            console.log("Data fetched:", selectedDate.toISOString());

            // contentの先頭と最後の""を削除
            if (
              newMemo.content.startsWith('"') &&
              newMemo.content.endsWith('"')
            ) {
              newMemo.content = newMemo.content.slice(1, -1);
            }
            // contentの\nを改行に変換
            newMemo.content = newMemo.content.replace(/\\n/g, "\n");

            // idが一致するメモがあれば更新、なければ追加
            const index = parsedMemos.findIndex(
              (memo) => memo.note_id === newMemo.note_id,
            );
            if (index >= 0) {
              const updatedMemos = [...parsedMemos];
              updatedMemos[index] = newMemo;
              setMemos(updatedMemos);
              localStorage.setItem("memos", JSON.stringify(updatedMemos));
              setSelectedMemo(newMemo);
            } else {
              setMemos([...parsedMemos, newMemo]);
              localStorage.setItem(
                "memos",
                JSON.stringify([...parsedMemos, newMemo]),
              );
              setSelectedMemo(newMemo);
            }
          }
        } catch (error) {
          console.error("Error fetching notes:", error);
        } finally {
          setLoadingDates(
            loadingDates.filter(
              (date) => date.getTime() !== selectedDate.getTime(),
            ),
          ); // 読み込み中の日付を削除
        }
      }
    };

    if (date) {
      fetchMemoData(date);
    }
  }, [date]);

  useEffect(() => {
    const fetchWeeklyMemos = async (selectedDate: Date) => {
      // ローディング中であれば再びリクエストしない
      if (
        loadingDates.some((date) => date.getTime() === selectedDate.getTime())
      ) {
        return;
      }

      const now = new Date();
      const to = encodeURIComponent(now.toISOString());
      const from = new Date(now);
      from.setDate(now.getDate() - 30);
      const fromEncoded = encodeURIComponent(from.toISOString());

      try {
        // APIリクエストをuseApiフックで行う
        const response = await apiRequest({
          method: "GET",
          url: `/notes?from=${fromEncoded}&to=${to}&fields=note_id,user_id,title,content,length,tags,created_at,updated_at`,
        });

        // メモデータが取得できた場合に処理
        const data = response.notes || [];
        if (data.length > 0) {
          const newMemos = data.map(
            (item: {
              note_id: string;
              user_id: string;
              title: string;
              content: string;
              length: number;
              tags: string;
              created_at: string,
              updated_at: string;
            }) => {
              // タグがカンマ区切りかつ改行を含む場合、改行を除去
              const tags = item.tags
                ? item.tags.replace(/\\n/g, "").split(",")
                : [];

              return {
                note_id: item.note_id,
                user_id: item.user_id,
                title: item.title || "no title",
                content: item.content || "no contents",
                tags: tags || [],
                charCount: item.length,
                created_at: item.created_at,
                updated_at: item.updated_at,
              };
            },
          );

          setMemos(newMemos);
          localStorage.setItem("memos", JSON.stringify(newMemos)); // ローカルストレージに保存
        }
      } catch (error) {
        console.error("Error fetching weekly memos:", error);
      }
    };

    if (date) {
      fetchWeeklyMemos(date);
    }
  }, [date]);

  // 編集から閲覧モードに切り替わる際にAPIを呼び出してメモを保存
  useEffect(() => {
    const saveMemo = async (selectedMemo: Memo) => {
      try {
        await apiRequest({
          method: "PUT",
          url: `/notes`,
          body: {
            user_id: selectedMemo.user_id,
            note_id: selectedMemo.note_id,
            title: selectedMemo.title,
            content: selectedMemo.content,
            tags: selectedMemo.tags.join(","),
            createdAt: selectedMemo.created_at,
            updatedAt: new Date().toISOString(),
          },
        });
        console.log("Memo saved successfully.");
      } catch (error) {
        console.error("Error saving memo:", error);
      }
    };

    // 閲覧モードに戻ったときにAPIを呼び出す
    if (!editable) {
      saveMemo(selectedMemo);
    }
  }, [editable]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-1 overflow-hidden relative">
        {/* サイドバー（エントリーリスト） */}
        <aside
          className={`w-[300px] lg:relative lg:block absolute top-0 left-0 h-full transition-transform duration-300 border-r p-4 flex flex-col bg-white z-40 ${isSidebarVisible ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
          style={{
            backgroundColor: isDarkMode
              ? "rgba(31, 41, 55, 0.8)"
              : "rgba(255, 255, 255, 0.8)",
          }}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            memoData={memos}
            className={`rounded-md border flex justify-center transition-all duration-300 ${isMobile ? "mt-20" : ""}`}
          />
          <MemoList
            memos={memos}
            selectedMemo={selectedMemo}
            setSelectedMemo={setSelectedMemo}
          />
        </aside>

        <button
          onClick={() => setEditable(!editable)}
          className="fixed bottom-4 right-4 z-50 p-2 rounded-full bg-white shadow-md"
        >
          {editable ? <FaCheck size={24} /> : <FaPen size={24} />}
        </button>
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
              {/* ローディング中の日付が選択された場合はスピナーを表示 */}
              {loadingDates.some(
                (loadingDate) => loadingDate.getTime() === date?.getTime(),
              ) ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mr-4"></div>
                </div>
              ) : (
                <Editor
                  selectedMemo={selectedMemo}
                  setMemos={setMemos}
                  memos={memos}
                  isEditable={editable}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
