import React, { useState, useRef, useEffect } from 'react'
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import Code from '@tiptap/extension-code'
import Highlight from '@tiptap/extension-highlight'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Heading from '@tiptap/extension-heading'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import Placeholder from '@tiptap/extension-placeholder'
import { ScrollArea } from "@/components/ui/scroll-area"
import { all, createLowlight } from 'lowlight'
// eslint-disable-next-line
import CodeBlockComponent from '@/components/code-block'
import Header from "@/components/header";
import SummaryBlock from "@/components/summary-block"; // Add this line to import SummaryBlock
import Toolbar from '@/components/toolbar'
import Floating from '@/components/floating'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import FloatingMenu from '@tiptap/extension-floating-menu'
import { Calendar } from '@/components/ui/calendar'
import HeaderMobile from '@/components/header-mobile'
import { useApiUrl } from '@/components/api-provider'
import { getCookie } from '@/lib/cookie'

// create a lowlight instance
const lowlight = createLowlight(all)

// you can also register individual languages
lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('ts', ts)

// Define the Memo type
interface Memo {
  id: number
  date: string
  title: string
  content: string
}

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
    return savedMemos
      ? JSON.parse(savedMemos)
      : [
        { id: 1, date: "2024-09-21T12:34:56+09:00", title: 'First Entry', content: 'This is my first diary entry.' },
        { id: 2, date: "2024-09-21T12:34:56+09:00", title: 'Ideas', content: 'Some ideas for my next project.' },
      ]
  })

  const [selectedMemo, setSelectedMemo] = useState<Memo>(memos[0])
  const [isSidebarVisible, setSidebarVisible] = useState(true) // 表示非表示の管理
  const floatingToolbarRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const apiUrl = useApiUrl()

  const editor = useEditor({
    extensions: [
      StarterKit,
      BulletList,
      OrderedList,
      ListItem,
      Bold,
      Italic,
      Underline,
      Code,
      Link,
      Highlight,
      Document,
      Paragraph,
      Text,
      TextStyle,
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent)
        },
      }).configure({ lowlight }),
      Color.configure({ types: [TextStyle.name, Highlight.name] }),
      Heading.configure({
        levels: [1, 2, 3, 4],
      }),
      Placeholder.configure({ placeholder: 'Start writing here...' }),
      TaskItem.configure({
        nested: true,
      }),
      TaskList,
      Link.configure({
        openOnClick: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      FloatingMenu.configure({
        element: floatingToolbarRef.current!,
        shouldShow: ({ state }) => {
          const { selection } = state
          return !selection.empty
        },
      }),
    ],
    content: selectedMemo.content,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML()
      const firstLine = editor.getText().split('\n')[0] || 'Untitled Entry'

      setSelectedMemo((prev) => ({ ...prev, content, title: firstLine }))

      setMemos((prevMemos) => {
        const updatedMemos = prevMemos.map((memo) =>
          memo.id === selectedMemo.id ? { ...selectedMemo, content, title: firstLine } : memo
        )
        localStorage.setItem('memos', JSON.stringify(updatedMemos))
        return updatedMemos
      })
    },
  })

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

    return () => observer.disconnect()
  }, [])

  const [date, setDate] = React.useState<Date | undefined>(new Date())

  useEffect(() => {
    if (date) {
      const fetchData = async () => {
        const token = getCookie('token') // トークン取得
        if (!token) return // トークンがない場合は処理しない

        const isoDate = date.toISOString() // 日付をISO 8601形式に変換
        const encodedDate = encodeURIComponent(isoDate) // エンコード

        try {
          const response = await fetch(`${apiUrl}/notes/note?date=${encodedDate}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`, // トークンをヘッダーに追加
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            const data = await response.json()

            // 取得したデータをMemo形式に変換
            const newMemo: Memo = {
              id: Date.now(), // 仮のIDとして現在時刻を使用
              title: new Date(data.data).toLocaleDateString(), // 日付をタイトルに
              content: data.content,
              date: ''
            }

            setMemos((prevMemos) => {
              const updatedMemos = [...prevMemos, newMemo]
              localStorage.setItem('memos', JSON.stringify(updatedMemos)) // ローカルストレージに保存
              return updatedMemos
            })
          } else {
            console.error('Failed to fetch notes')
          }
        } catch (error) {
          console.error('Error fetching notes:', error)
        }
      }

      fetchData()
    }
  }, [date])

  useEffect(() => {
    if (editor) {
      const updateFloatingMenuPosition = () => {
        const { selection } = editor.state
        const { from } = selection
        if (!editor.view.hasFocus() || selection.empty) {
          floatingToolbarRef.current!.style.display = 'none'
          return
        }
        const { top, left } = editor.view.coordsAtPos(from)
        const offset = 70 // 位置を調整するためのオフセット値
        floatingToolbarRef.current!.style.top = `${top - offset}px`
        floatingToolbarRef.current!.style.left = `${left}px`
        floatingToolbarRef.current!.style.display = 'block'
      }

      editor.on('selectionUpdate', updateFloatingMenuPosition)
      return () => {
        editor.off('selectionUpdate', updateFloatingMenuPosition)
      }
    }
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-1 overflow-hidden relative">
        {/* サイドバー（エントリーリスト） */}
        <aside
          className={`w-[300px] lg:relative lg:block absolute top-0 left-0 h-full transition-transform duration-300 border-r p-4 flex flex-col bg-white z-40 ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0`}
          style={{ backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)' }} // ダークモードの背景
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className={`rounded-md border flex justify-center transition-all duration-300 ${isMobile ? 'mt-20' : ''}`}
          />
          <ScrollArea className="flex-1 h-[50vh] my-10">
            <div className="w-[250px] truncate">
              {memos.map((memo) => (
                <div
                  key={memo.id}
                  className={`p-2 mb-2 cursor-pointer rounded group ${selectedMemo.id === memo.id ? 'bg-secondary' : 'hover:bg-secondary/50'
                    }`}
                >
                  <div className="flex justify-between items-center w-auto">
                    <div
                      onClick={() => {
                        setSelectedMemo(memo);
                        editor?.commands.setContent(memo.content);
                      }}
                      className="truncate"
                    >
                      <h3 className="font-medium truncate">{memo.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {typeof memo.content === 'string'
                          ? memo.content.replace(/<[^>]*>/g, '').slice(memo.title.length)
                          : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* メインエリア */}
        <main className="flex-1">
          {/* lg未満の場合はHeaderMobile、それ以上はHeaderを表示 */}
          {isMobile ? (
            <HeaderMobile
              isLoggedIn={true}
              isSidebarVisible={isSidebarVisible}
              setSidebarVisible={setSidebarVisible}
            />
          ) : (
            <Header isLoggedIn={true} />
          )}
          <div className="px-4 flex flex-col h-[90vh]">
            {/* SummaryBlock */}
            <div className="flex-none">
              <SummaryBlock />
            </div>

            {/* Toolbar */}
            <div className="flex-none">
              <Toolbar editor={editor} />
            </div>

            {/* EditorContent: 残りのスペースを占める */}
            <div className="flex-1 overflow-y-auto">
              <EditorContent
                editor={editor}
                className="prose p-5 focus:outline-none h-full"
              />
            </div>

            {/* Floating Toolbar */}
            <div
              id="floating-toolbar"
              ref={floatingToolbarRef}
              className="absolute hidden bg-white dark:bg-gray-700 z-10 border border-gray-300 rounded shadow-md"
            >
              <Floating editor={editor} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}