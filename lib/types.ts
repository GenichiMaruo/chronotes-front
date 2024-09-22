export type Memo = {
  id: number;
  date: string;
  title: string;
  content: string;
  tags: string[];
  charCount?: number;
}