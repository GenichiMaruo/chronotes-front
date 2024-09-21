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
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { all, createLowlight } from 'lowlight'
import { PlusCircle, Trash, ChevronLeft, ChevronRight } from 'lucide-react'
// eslint-disable-next-line
import CodeBlockComponent from '@/components/code-block'
import Header from "@/components/header";
import SummaryBlock from "@/components/summary-block"; // Add this line to import SummaryBlock
import Toolbar from './toolbar'
import Floating from './floating'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import FloatingMenu from '@tiptap/extension-floating-menu'
import { Calendar } from '@/components/ui/calendar'

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
  title: string
  content: string
}

export default function Chronotes() {
  const [memos, setMemos] = useState<Memo[]>(() => {
    const savedMemos = localStorage.getItem('memos')
    return savedMemos
      ? JSON.parse(savedMemos)
      : [
        { id: 1, title: 'First Entry', content: 'This is my first diary entry.' },
        { id: 2, title: 'Ideas', content: 'Some ideas for my next project.' },
      ]
  })

  const [selectedMemo, setSelectedMemo] = useState<Memo>(memos[0])
  const [isSidebarVisible, setSidebarVisible] = useState(true) // 表示非表示の管理
  const [geminiSummary] = useState({
    today: 'aaaaa',
    thisWeek: 'aaaaaaa',
    thisMonth: 'aaaaaaaaaa',
    thisYear: 'aaaaaaaaa',
    q1: 'aaaaa',
    q2: 'aaaaaaa',
    q3: 'aaaaaaaaa',
    q4: 'aaaaaaaaaa',
  })
  const floatingToolbarRef = useRef<HTMLDivElement>(null)

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

  // 新しいメモを作成
  const createNewMemo = () => {
    const newMemo: Memo = { id: Date.now(), title: 'New Entry', content: '' }
    setMemos([newMemo, ...memos])
    setSelectedMemo(newMemo)
    editor?.commands.setContent('')
  }

  // メモを削除
  const deleteMemo = (id: number) => {
    const updatedMemos = memos.filter((memo) => memo.id !== id)
    setMemos(updatedMemos)
    localStorage.setItem('memos', JSON.stringify(updatedMemos))

    if (selectedMemo.id === id) {
      setSelectedMemo(updatedMemos[0] || { id: 0, title: '', content: '' })
      editor?.commands.setContent(updatedMemos[0]?.content || '')
    }
  }

  const [date, setDate] = React.useState<Date | undefined>(new Date())

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
      {/* サイドバーの表示非表示ボタン（小さい画面用） */}
      <Button
        onClick={() => setSidebarVisible(!isSidebarVisible)}
        className="absolute top-4 left-4 block lg:hidden p-2 z-50"  // スマホでの表示位置を改善
      >
        {isSidebarVisible ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
      </Button>

      <div className="flex flex-1 overflow-hidden relative">
        {/* サイドバー（エントリーリスト） */}
        <aside
          className={`lg:relative lg:block absolute top-0 left-0 h-full w-[30vw] max-w-[300px] transition-transform duration-300 border-r p-4 flex flex-col z-40 ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0`}
          style={{ backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)' }} // ダークモードの背景
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border flex justify-center"
          />
          <Button onClick={createNewMemo} className="mb-4">
            <PlusCircle className="mr-2 h-4 w-4" /> New Entry
          </Button>
          <ScrollArea className="flex-1 h-[50vh]">
            <div className="w-[30vw] max-w-[250px] truncate">
              {memos.map((memo) => (
                <div
                  key={memo.id}
                  className={`p-2 mb-2 cursor-pointer rounded group ${selectedMemo.id === memo.id ? 'bg-secondary' : 'hover:bg-secondary/50'
                    }`}
                >
                  <div className="flex justify-between items-center max-w-full">
                    <div
                      onClick={() => {
                        setSelectedMemo(memo);
                        editor?.commands.setContent(memo.content);
                      }}
                    >
                      <h3 className="font-medium truncate">{memo.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {typeof memo.content === 'string'
                          ? memo.content.replace(/<[^>]*>/g, '').slice(memo.title.length)
                          : ''}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => deleteMemo(memo.id)}
                    variant="ghost"
                    className="ml-2 text-red-500 hover:bg-red-100 hidden group-hover:block"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* メインエリア */}
        <main className="flex-1 max-w-[]">
          <Header isLoggedIn={true} />
          {/* Geminiのノートまとめ表示エリア */}
          <section className="mt-6 p-4 bg-gray-100 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Geminiによるノートのまとめ</h2>

            {/* 各期間のまとめを表示 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SummaryBlock title="今日のまとめ" summary={geminiSummary.today} />
              <SummaryBlock title="今週のまとめ" summary={geminiSummary.thisWeek} />
              <SummaryBlock title="今月のまとめ" summary={geminiSummary.thisMonth} />
              <SummaryBlock title="今年のまとめ" summary={geminiSummary.thisYear} />
              <SummaryBlock title="四半期まとめ (1-3月)" summary={geminiSummary.q1} />
              <SummaryBlock title="四半期まとめ (4-6月)" summary={geminiSummary.q2} />
              <SummaryBlock title="四半期まとめ (7-9月)" summary={geminiSummary.q3} />
              <SummaryBlock title="四半期まとめ (10-12月)" summary={geminiSummary.q4} />
            </div>
          </section>
          <Toolbar editor={editor} />
          <EditorContent
            editor={editor}
            className="prose h-[80vh] overflow-y-auto p-[1rem] focus:outline-none"
          />
          <div 
            id="floating-toolbar" 
            ref={floatingToolbarRef} 
            className="absolute hidden bg-white dark:bg-gray-700 z-10 border border-gray-300 rounded shadow-md "
          >
            <Floating editor={editor} />
          </div>
        </main>
      </div>
    </div>
  )
}