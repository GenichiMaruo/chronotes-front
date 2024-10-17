"use client"; // Client Componentとして宣言

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setCookie } from "@/lib/cookie";
import { ApiHandler } from "@/hooks/use-api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUserName] = useState("");
  const [userid, setUserId] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused1, setIsPasswordFocused1] = useState(false);
  const [isPasswordFocused2, setIsPasswordFocused2] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { apiRequest } = ApiHandler();

  const handleSignup = async () => {
    setLoading(true);
    setError("");

    // バリデーションチェック
    if (!username || !userid || !email || !password || !confirmPassword) {
      setError("Enter all fields");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // APIリクエストを送信
      const data = await apiRequest({
        method: "POST",
        url: "/auth/register",
        body: { email, password, user_name: username, user_id: userid },
      });

      if (data) {
        const { token } = await data;
        // トークンをCookieにセット
        setCookie("token", token, 7); // トークンをCookieにセット
        // サインアップ後のリダイレクト
        router.push("/"); // ダッシュボードなどサインアップ後のページへリダイレクト
      } else {
        throw new Error("Failed to sign up");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to sign up");
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
        <h1 className="text-2xl mb-4">Sign Up</h1>
        <div className="w-full max-w-md">
          <Label htmlFor="userName">UserName</Label>
          <Input
            id="userName"
            type="text"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
            className="mb-4"
            placeholder="Enter username"
          />

          <Label htmlFor="user_id">User ID</Label>
          <Input
            id="user_id"
            type="text"
            value={userid}
            onChange={(e) => setUserId(e.target.value)}
            className="mb-4"
            placeholder="Enter user id"
          />

          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4"
            placeholder="Enter email"
          />

          <Label htmlFor="password">Password</Label>
          <div className="relative mb-4">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused1(true)}
              onBlur={() => setIsPasswordFocused1(false)}
              className="mb-4"
              placeholder="Enter password"
            />
            {isPasswordFocused1 && (
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

          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative mb-4">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused2(true)}
              onBlur={() => setIsPasswordFocused2(false)}
              className="mb-4"
              placeholder="Enter password"
            />
            {isPasswordFocused2 && (
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

          <Button onClick={handleSignup} disabled={loading} className="w-full">
            {loading ? "Loading..." : "Sign Up"}
          </Button>

          <div className="mt-4">
            <Link href="/login" className="text-blue-500">
              Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
