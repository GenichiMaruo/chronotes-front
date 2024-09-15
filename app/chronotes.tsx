import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import AppSettings from '@/components/app-settings' // 設定コンポーネントのインポート
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, Settings, LogOut } from 'lucide-react'
import { deleteCookie } from "@/lib/cookie"
import { useRouter } from 'next/navigation'

export default function Chronotes() {
  const [memos, setMemos] = useState([
    { id: 1, title: 'First Entry', content: 'This is my first diary entry.' },
    { id: 2, title: 'Ideas', content: 'Some ideas for my next project.' },
  ])
  const [selectedMemo, setSelectedMemo] = useState(memos[0])
  const [isSettingsOpen, setIsSettingsOpen] = useState(false) // 設定画面の状態管理
  const router = useRouter()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing here...' }),
    ],
    content: selectedMemo.content,
    onUpdate: ({ editor }) => {
      setSelectedMemo(prev => ({ ...prev, content: editor.getHTML() }))
    },
  })

  const createNewMemo = () => {
    const newMemo = { id: Date.now(), title: 'New Entry', content: '' }
    setMemos([newMemo, ...memos])
    setSelectedMemo(newMemo)
    editor?.commands.setContent('')
  }

  const handleLogout = () => {
    deleteCookie('token')  // トークンを削除
    router.push('/login')  // ログイン画面へリダイレクト
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold">Chronotes</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-1/3 border-r p-4 flex flex-col">
          <Button onClick={createNewMemo} className="mb-4">
            <PlusCircle className="mr-2 h-4 w-4" /> New Entry
          </Button>
          <ScrollArea className="flex-1">
            {memos.map(memo => (
              <div
                key={memo.id}
                className={`p-2 mb-2 cursor-pointer rounded ${selectedMemo.id === memo.id ? 'bg-secondary' : 'hover:bg-secondary/50'
                  }`}
                onClick={() => {
                  setSelectedMemo(memo)
                  editor?.commands.setContent(memo.content)
                }}
              >
                <h3 className="font-medium">{memo.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{memo.content.replace(/<[^>]*>/g, '')}</p>
              </div>
            ))}
          </ScrollArea>
        </aside>
        <main className="flex-1 p-4">
          <input
            type="text"
            value={selectedMemo.title}
            onChange={(e) => setSelectedMemo(prev => ({ ...prev, title: e.target.value }))}
            className="w-full mb-4 text-2xl font-bold bg-transparent border-none outline-none"
            placeholder="Entry Title"
          />
          <EditorContent editor={editor} className="prose max-w-none" />
        </main>
      </div>

      {/* 設定モーダル */}
      <AppSettings open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}
