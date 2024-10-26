export type Memo = {
  user_id: number;
  note_id: number;
  title: string;
  content: string;
  tags: string[];
  charCount?: number;
  created_at: string;
  updated_at: string;
};
