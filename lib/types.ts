export type Memo = {
  id: number;
  date: string;
  title: string;
  content: string;
  tags: string[];
  length?: number;
  charCount?: number;
};
