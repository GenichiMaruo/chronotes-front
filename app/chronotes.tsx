import { useState } from 'react'
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
import { PlusCircle } from 'lucide-react'
// eslint-disable-next-line
import CodeBlockComponent from '@/components/code-block'

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
    // Load from localStorage
    const savedMemos = localStorage.getItem('memos')
    return savedMemos
      ? JSON.parse(savedMemos)
      : [
        { id: 1, title: 'First Entry', content: 'This is my first diary entry.' },
        { id: 2, title: 'Ideas', content: 'Some ideas for my next project.' },
      ]
  })

  const [selectedMemo, setSelectedMemo] = useState<Memo>(memos[0])

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
    ],
    content: selectedMemo.content,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML()
      const firstLine = editor.getText().split('\n')[0] || 'Untitled Entry'

      // Update the selected memo
      setSelectedMemo((prev) => ({ ...prev, content, title: firstLine }))

      // Save memos to localStorage for offline support
      setMemos((prevMemos) => {
        const updatedMemos = prevMemos.map((memo) =>
          memo.id === selectedMemo.id ? { ...selectedMemo, content, title: firstLine } : memo
        )
        localStorage.setItem('memos', JSON.stringify(updatedMemos))
        return updatedMemos
      })
    },
  })

  const createNewMemo = () => {
    const newMemo: Memo = { id: Date.now(), title: 'New Entry', content: '' }
    setMemos([newMemo, ...memos])
    setSelectedMemo(newMemo)
    editor?.commands.setContent('')
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-1/3 border-r p-4 flex flex-col">
          <Button onClick={createNewMemo} className="mb-4">
            <PlusCircle className="mr-2 h-4 w-4" /> New Entry
          </Button>
          <ScrollArea className="flex-1">
            {memos.map((memo) => (
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
                <p className="text-sm text-muted-foreground truncate">
                  {typeof memo.content === 'string'
                    ? memo.content.replace(/<[^>]*>/g, '').slice(memo.title.length)
                    : ''}
                </p>
              </div>
            ))}
          </ScrollArea>
        </aside>
        <main className="flex-1 p-4">
          <EditorContent
            editor={editor}
            className="prose max-w-none h-full focus:outline-none"
          />
        </main>
      </div>
    </div>
  )
}
