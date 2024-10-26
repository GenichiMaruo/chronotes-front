"use client";

import type * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { Memo } from "@/lib/types";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  memoData: Memo[];
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  memoData,
  ...props
}: CalendarProps) {


  // 文字数に応じた背景色を生成
  const getBackgroundColor = (charCount: number) => {
    if (charCount === 0) {
      return "transparent";
    }
    let intensity = Math.min(charCount / 1000, 1);
    intensity += 0.2;
    const color = `rgba(0, 100, 0, ${intensity})`;
    return color;
  };

  // 各メモの日付を modifiers に一日ずつ追加
  const modifiers: Record<string, Date[]> = memoData.reduce(
    (acc, memo) => {
      const date = new Date(memo.created_at);
      if (isNaN(date.getTime())) {
        return acc;
      }
      const key = date.toISOString().split("T")[0]; // 日付を "YYYY-MM-DD" 形式に変換
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(date);
      return acc;
    },
    {} as Record<string, Date[]>,
  );

  // 文字数に応じたスタイルを生成
  const modifiersStyles: Record<string, React.CSSProperties> = memoData.reduce(
    (styles, memo) => {
      const date = new Date(memo.created_at);
      if (isNaN(date.getTime())) {
        return styles;
      }
      const dateKey = new Date(memo.created_at).toISOString().split("T")[0];
      const bkg = getBackgroundColor(memo.charCount ?? 0);
      styles[dateKey] = { backgroundColor: bkg };
      return styles;
    },
    {} as Record<string, React.CSSProperties>,
  );

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-white dark:bg-gray-700", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-red-500 text-white",
        day_outside:
          "day-outside text-muted-foreground opacity-50  aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({}) => <ChevronLeftIcon className="h-4 w-4" />,
        IconRight: ({}) => <ChevronRightIcon className="h-4 w-4" />,
      }}
      modifiers={modifiers}
      modifiersStyles={modifiersStyles}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
