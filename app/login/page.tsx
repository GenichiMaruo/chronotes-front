"use client"; // Client Componentとして宣言

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation"; // app routerではuseRouterではなくuseNavigationを使用
import Link from "next/link";
import { useApiUrl } from "@/components/api-provider";
import { setCookie } from "@/lib/cookie";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const apiUrl = useApiUrl();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    // バリデーションチェック
    if (!email || !password) {
      setError("すべてのフィールドを入力してください");
      setLoading(false);
      return;
    }

    try {
      // APIリクエストを送信
      const response = await fetch(`${apiUrl}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("ログインに失敗しました");
      }
      const { token } = await response.json();
      // トークンをCookieにセット
      setCookie("token", token, 7); // トークンをCookieにセット
      // ログイン後のリダイレクト
      router.push("/"); // ダッシュボードなどログイン後のページへリダイレクト

    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("ログインに失敗しました");
      }
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

      <main className="flex flex-col items-center justify-center flex-grow px-4 sm:px-6">
        <h1 className="text-2xl mb-4">ログイン</h1>
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

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <Button onClick={handleLogin} disabled={loading} className="w-full">
            {loading ? "ログイン中..." : "ログイン"}
          </Button>

          <div className="mt-4">
            <Link href="/signup" className="text-blue-500">
              サインアップはこちら
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
