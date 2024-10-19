import type React from "react";
import { useEffect, useState, useRef } from "react";
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

const lowlight = createLowlight();
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);

type EditorProps = {
  selectedMemo: Memo;
  setMemos: React.Dispatch<React.SetStateAction<Memo[]>>;
  memos: Memo[];
};

export default function Editor({ selectedMemo, setMemos, memos }: EditorProps) {
  const [charCount, setCharCount] = useState(selectedMemo?.charCount || 0); // 初期値をメモの文字数に設定
  const floatingToolbarRef = useRef<HTMLDivElement>(null);

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
    ],
    content: selectedMemo ? selectedMemo.content : "", // selectedMemoが存在する場合のみ
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();

      // 文字数をカウント
      const newCharCount = countCharacters(content);
      setCharCount(newCharCount);

      console.log(charCount);

      // selectedMemo に文字数を保存
      const updatedMemo = { ...selectedMemo, content, charCount: newCharCount };
      const updatedMemos = memos.map((memo) =>
        memo.id === selectedMemo.id ? updatedMemo : memo,
      );

      setMemos(updatedMemos);
      localStorage.setItem("memos", JSON.stringify(updatedMemos));
    },
  });

  const countCharacters = (content: string) => {
    const splitter = new GraphemeSplitter();
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const textContent = doc.body.textContent || ""; // タグを除いたテキストを取得
    const replaced = textContent.replace(/\n/g, ""); // 改行文字を削除
    const spaceRemoved = replaced.replace(/\s/g, ""); // 空白文字を削除

    const graphemes = splitter.splitGraphemes(spaceRemoved); // グラフェームで分割
    return graphemes.length; // グラフェームの数をカウント
  };

  useEffect(() => {
    if (editor && selectedMemo) {
      editor.commands.setContent(selectedMemo.content || "");
      const initialCharCount = countCharacters(selectedMemo.content || "");
      setCharCount(initialCharCount); // 初期文字数を設定

      // selectedMemo に文字数を保存
      const updatedMemo = { ...selectedMemo, charCount: initialCharCount };
      const updatedMemos = memos.map((memo) =>
        memo.id === selectedMemo.id ? updatedMemo : memo,
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
        const offset = 70; // 位置を調整するためのオフセット値
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

  return (
    <>
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} className="p-5" />
      <div
        id="floating-toolbar"
        ref={floatingToolbarRef}
        className="absolute hidden z-10 bg-white border border-gray-300 rounded shadow-md "
      >
        {editor && <Floating editor={editor} />}
      </div>
    </>
  );
}
