"use client"; // Client Componentとして宣言

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { setCookie } from "@/lib/cookie";
import Link from "next/link";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    setLoading(true);
    setError("");

    // バリデーションチェック
    if (!email || !password || !confirmPassword) {
      setError("すべてのフィールドを入力してください");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      setLoading(false);
      return;
    }

    try {
      // APIリクエストを送信
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("サインアップに失敗しました");
      }

      const { token } = await response.json();

      // トークンをCookieに保存
      setCookie("token", token, 7); // トークンを7日間保持

      // サインアップ後のリダイレクト
      router.push("/"); // ダッシュボードなどサインアップ後のページへリダイレクト
    } catch (error: any) {
      setError(error.message || "サインアップに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">
          <Link href="/">Chronotes</Link>
        </h1>
      </header>

      <main className="flex flex-col items-center justify-center flex-grow">
        <h1 className="text-2xl mb-4">サインアップ</h1>
        <div className="w-full max-w-md">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4"
            placeholder="メールアドレスを入力してください"
          />

          <Label htmlFor="password">パスワード</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
            placeholder="パスワードを入力してください"
          />

          <Label htmlFor="confirmPassword">パスワード確認</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mb-4"
            placeholder="パスワードを再度入力してください"
          />

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <Button onClick={handleSignup} disabled={loading} className="w-full">
            {loading ? "サインアップ中..." : "サインアップ"}
          </Button>

          <div className="mt-4">
            <a href="/login" className="text-blue-500">
              ログインはこちら
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
