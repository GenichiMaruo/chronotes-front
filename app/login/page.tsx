"use client"; // Client Componentとして宣言

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation"; // app routerではuseRouterではなくuseNavigationを使用
import Link from "next/link";
import { setCookie } from "@/lib/cookie";
import { ApiHandler } from "@/hooks/use-api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// メールバリデーション関数
const isEmail = (value: string) => {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return re.test(value.replace(/\s+/g, "").trim()); // 不可視文字を削除
};

// 全角を半角に変換する関数
const toHalfWidth = (value: string) => {
  return value.replace(/[！-～]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0),
  );
};

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { apiRequest } = ApiHandler();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    if (!identifier || !password) {
      setError("Enter email / userID and password");
      setLoading(false);
      return;
    }

    try {
      const body = {
        email: isEmail(identifier) ? identifier : "",
        user_id: isEmail(identifier) ? "" : identifier,
        password,
      };

      console.log(isEmail(identifier));

      // APIリクエストを送信
      const data = await apiRequest({
        method: "POST",
        url: "/auth/login",
        body,
      });

      if (data) {
        const { token } = await data;
        // トークンをCookieにセット
        setCookie("token", token, 7); // トークンをCookieにセット
        // ログイン後のリダイレクト
        router.push("/"); // ダッシュボードなどログイン後のページへリダイレクト
      } else {
        throw new Error("Failed to login");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  // identifierが更新されると表示
  // console.log(identifier);
  // console.log(isEmail(identifier));

  return (
    <div className="flex flex-col h-screen">
      <header className="flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">
          <Link href="/">Chronotes</Link>
        </h1>
      </header>

      <main className="flex flex-col items-center justify-center flex-grow px-4 sm:px-6">
        <h1 className="text-2xl mb-4">Login</h1>
        <div className="w-full max-w-md">
          <Label htmlFor="email">Email / UserID</Label>
          <Input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(toHalfWidth(e.target.value))}
            onKeyDown={handleKeyDown}
            className="mb-4"
            placeholder="Enter email / userID"
          />

          <Label htmlFor="password">Password</Label>
          <div className="relative mb-4">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(toHalfWidth(e.target.value))}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              onKeyDown={handleKeyDown}
              className="mb-4"
              placeholder="Enter password"
            />
            {isPasswordFocused && (
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            )}
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <Button onClick={handleLogin} disabled={loading} className="w-full">
            {loading ? "Loading..." : "Login"}
          </Button>

          <div className="mt-4">
            <Link href="/signup" className="text-blue-500">
              Signup
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
