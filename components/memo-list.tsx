import type React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Memo } from "@/lib/types";

interface MemoListProps {
  memos: Memo[];
  selectedMemo: Memo;
  setSelectedMemo: (memo: Memo) => void;
}

const MemoList: React.FC<MemoListProps> = ({
  memos,
  selectedMemo,
  setSelectedMemo,
}) => {
  return (
    <ScrollArea className="flex-1 h-[50vh] my-10">
      <div className="w-[250px] truncate">
        {memos
          .sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          )
          .map((memo) => (
            <div
              key={memo.note_id}
              className={`p-2 mb-2 cursor-pointer rounded group ${selectedMemo.note_id === memo.note_id ? "bg-secondary" : "hover:bg-secondary/50"}`}
              onClick={() => setSelectedMemo(memo)}
            >
              <div className="flex justify-between items-center w-auto">
                <div className="truncate">
                  <h3 className="font-medium truncate">{memo.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {typeof memo.content === "string"
                      ? memo.content.replace(/<[^>]*>/g, "")
                      : ""}
                  </p>
                  {/* タグの表示: tagsが配列か確認 */}
                  <div className="text-xs text-muted-foreground">
                    {Array.isArray(memo.tags) && memo.tags.length > 0 ? (
                      <p>
                        {memo.tags.map((tag, index) => (
                          <span key={index} className="text-blue-500">
                            #{tag}
                            {index < memo.tags.length - 1 && ", "}
                          </span>
                        ))}
                      </p>
                    ) : (
                      <p>No tags</p>
                    )}
                  </div>
                  {/* 時間の表示 */}
                  <div className="text-xs text-muted-foreground">
                    {new Date(memo.created_at).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                {/* 文字数の表示 */}
                <span className="text-xs text-gray-500">
                  {memo.charCount || 0}文字
                </span>
              </div>
            </div>
          ))}
      </div>
    </ScrollArea>
  );
};

export default MemoList;
