import React, { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import StarterKit from '@tiptap/starter-kit'
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
import Placeholder from '@tiptap/extension-placeholder'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import FloatingMenu from '@tiptap/extension-floating-menu'
import { createLowlight } from 'lowlight'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import { Memo } from '@/lib/types'
import Toolbar from '@/components/toolbar'

const lowlight = createLowlight()
lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('ts', ts)

type EditorProps = {
  selectedMemo: Memo
  setMemos: React.Dispatch<React.SetStateAction<Memo[]>>
  memos: Memo[]
}

export default function Editor({ selectedMemo, setMemos, memos }: EditorProps) {
  const [charCount, setCharCount] = useState(0); // 文字数を管理するステート
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
      Highlight,
      TextStyle,
      Color,
      Heading.configure({ levels: [1, 2, 3] }),
      Placeholder.configure({
        placeholder: '内容をここに入力してください…',
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      FloatingMenu,
    ],
    content: selectedMemo.content || '',
    onUpdate: ({ editor }) => {
      const content = editor.getHTML()
      const updatedMemo = { ...selectedMemo, content }
      const updatedMemos = memos.map((memo) => (memo.id === selectedMemo.id ? updatedMemo : memo))
      setMemos(updatedMemos)
      localStorage.setItem('memos', JSON.stringify(updatedMemos))

      // 文字数カウントを更新
      countCharacters(content);
    },
  })

  const countCharacters = (content: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const paragraphs = doc.querySelectorAll('p');
    const codeBlocks = doc.querySelectorAll('code');
    
    let count = 0;

    paragraphs.forEach(p => {
      count += p.textContent ? p.textContent.length : 0;
    });
    codeBlocks.forEach(code => {
      count += code.textContent ? code.textContent.length : 0;
    });

    setCharCount(count);
  };

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(selectedMemo.content || '');
      countCharacters(selectedMemo.content || ''); // 初期カウント
    }
  }, [selectedMemo, editor]);

  return (
    <>
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} className='p-5' />
      <div
        className="absolute top-0 right-0 p-2 bg-white shadow-md rounded"
        style={{ zIndex: 10 }} // z-indexを設定して他の要素より上に表示
      >
        文字数: {charCount}
      </div>
    </>
  )
}
