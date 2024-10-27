import type React from "react";
import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import StarterKit from "@tiptap/starter-kit";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Code from "@tiptap/extension-code";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Heading from "@tiptap/extension-heading";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Image from '@tiptap/extension-image';
import { createLowlight } from "lowlight";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import type { Memo } from "@/lib/types";
import Toolbar from "@/components/toolbar";
import Link from "@tiptap/extension-link";
import GraphemeSplitter from "grapheme-splitter";
import Floating from "@/components/floating";
import { ApiHandler } from "@/hooks/use-api";

const lowlight = createLowlight();
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);

type EditorProps = {
  selectedMemo: Memo;
  setMemos: React.Dispatch<React.SetStateAction<Memo[]>>;
  memos: Memo[];
  isEditable: boolean;
};

export default function Editor({ selectedMemo, setMemos, memos, isEditable }: EditorProps) {
  const floatingToolbarRef = useRef<HTMLDivElement>(null);
  const { uploadImage } = ApiHandler();

  const handleImageUpload = async (file: File) => {
    try {
      const result = await uploadImage('/images', file);
      return result.url;
    } catch (error) {
      console.error('Image upload failed:', error);
      return null;
    }
  };

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
        placeholder: "内容をここに入力してください…",
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
      }),
    ],
    content: selectedMemo ? selectedMemo.content : "",
    editable: isEditable,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      const newCharCount = countCharacters(content);
      const updatedMemo = { ...selectedMemo, content, charCount: newCharCount };
      const updatedMemos = memos.map((memo) =>
        memo.note_id === selectedMemo.note_id ? updatedMemo : memo,
      );

      setMemos(updatedMemos);
      localStorage.setItem("memos", JSON.stringify(updatedMemos));
    },
  });

  const countCharacters = (content: string) => {
    const splitter = new GraphemeSplitter();
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const textContent = doc.body.textContent || "";
    const replaced = textContent.replace(/\n/g, "");
    const spaceRemoved = replaced.replace(/\s/g, "");
    const graphemes = splitter.splitGraphemes(spaceRemoved);
    return graphemes.length;
  };

  useEffect(() => {
    if (editor && selectedMemo) {
      editor.commands.setContent(selectedMemo.content || "");
      const initialCharCount = countCharacters(selectedMemo.content || "");
      const updatedMemo = { ...selectedMemo, charCount: initialCharCount };
      const updatedMemos = memos.map((memo) =>
        memo.note_id === selectedMemo.note_id ? updatedMemo : memo,
      );
      setMemos(updatedMemos);
      localStorage.setItem("memos", JSON.stringify(updatedMemos));
    }
  }, [selectedMemo, editor]);

  useEffect(() => {
    if (editor) {
      const updateFloatingMenuPosition = () => {
        const { selection } = editor.state;
        const { from } = selection;
        if (!editor.view.hasFocus() || selection.empty) {
          floatingToolbarRef.current!.style.display = "none";
          return;
        }
        const { top, left } = editor.view.coordsAtPos(from);
        const offset = 70;
        floatingToolbarRef.current!.style.top = `${top - offset}px`;
        floatingToolbarRef.current!.style.left = `${left}px`;
        floatingToolbarRef.current!.style.display = "block";
      };

      editor.on("selectionUpdate", updateFloatingMenuPosition);
      return () => {
        editor.off("selectionUpdate", updateFloatingMenuPosition);
      };
    }
  }, [editor]);

  // ドラッグ&ドロップハンドラーの追加
  useEffect(() => {
    if (editor && isEditable) {
      const handleDrop = async (event: DragEvent) => {
        event.preventDefault();

        const files = Array.from(event.dataTransfer?.files || []);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        // 画像ファイルがない場合は何もしない
        if (imageFiles.length === 0) return;
        for (const file of imageFiles) {
          const objectName = await handleImageUpload(file);
          if (objectName) {
            // エディターの現在のカーソル位置に画像を挿入
            editor.commands.setImage({ src: objectName });
          }
        }
      };

      const handlePaste = async (event: ClipboardEvent) => {
        const files = Array.from(event.clipboardData?.files || []);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) return;

        event.preventDefault();

        for (const file of imageFiles) {
          const objectName = await handleImageUpload(file);
          if (objectName) {
            editor.commands.setImage({ src: objectName });
          }
        }
      };

      const editorElement = document.querySelector('.ProseMirror');
      editorElement?.addEventListener('drop', handleDrop as unknown as EventListener);
      editorElement?.addEventListener('paste', handlePaste as unknown as EventListener);

      return () => {
        editorElement?.removeEventListener('drop', handleDrop as unknown as EventListener);
        editorElement?.removeEventListener('paste', handlePaste as unknown as EventListener);
      };
    }
  }, [editor, isEditable]);

  return (
    <>
      {editor && isEditable && <Toolbar editor={editor} />}
      <EditorContent editor={editor} className="p-5" />
      <div
        id="floating-toolbar"
        ref={floatingToolbarRef}
        className="absolute hidden z-10 bg-white border border-gray-300 rounded shadow-md"
      >
        {editor && isEditable && <Floating editor={editor} />}
      </div>
    </>
  );
}