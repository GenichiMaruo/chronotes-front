"use client"; // Client Componentとして宣言

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setCookie } from "@/lib/cookie";
import { ApiHandler } from "@/hooks/use-api";
import ErrorPopup from "@/components/error-popup";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  validateUsername,
  validateUserId,
  validateEmail,
  validatePassword,
  validateRequired,
} from "@/lib/validation";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUserName] = useState("");
  const [userid, setUserId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused1, setIsPasswordFocused1] = useState(false);
  const [isPasswordFocused2, setIsPasswordFocused2] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { apiRequest } = ApiHandler();
  const [usernameError, setUsernameError] = useState("");
  const [userIdError, setUserIdError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async () => {
    setLoading(true);
    setError("");
    setUsernameError("");
    setUserIdError("");
    setEmailError("");
    setPasswordError("");

    // バリデーションチェック
    const usernameErr = validateUsername(username, 1, 20);
    const userIdErr = validateUserId(userid, 3, 10);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password, confirmPassword);
    const requiredErr = validateRequired(username, userid, email, password, confirmPassword);
    
    if (requiredErr) {
      setError(requiredErr);
      setLoading(false);
      return;
    }else if (usernameErr || userIdErr || emailErr || passwordErr) {
      setUsernameError(usernameErr || "");
      setUserIdError(userIdErr || "");
      setEmailError(emailErr || "");
      setPasswordError(passwordErr || "");
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

          {/* UserName */}
          <div className="relative mb-6">
            <Label htmlFor="userName">UserName</Label>
            {usernameError && <ErrorPopup message={usernameError} />}
            <Input
              id="userName"
              type="text"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              className="mb-4"
              placeholder="Enter username"
            />
          </div>

          {/* UserID */}
          <div className="relative mb-6">
            <Label htmlFor="user_id">User ID</Label>
            {userIdError && <ErrorPopup message={userIdError} />}
            <Input
              id="user_id"
              type="text"
              value={userid}
              onChange={(e) => setUserId(e.target.value)}
              className="mb-4"
              placeholder="Enter user id"
            />
          </div>

          {/* Email */}
          <div className="relative mb-6">
            <Label htmlFor="email">Email</Label>
            {emailError && <ErrorPopup message={emailError} />}
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4"
              placeholder="Enter email"
            />
          </div>

          {/* Password */}
          <div className="relative mb-6">
            <Label htmlFor="password">Password</Label>
            {passwordError && <ErrorPopup message={passwordError} />}
            <div className="relative">
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
          </div>

          {/* Confirm Password */}
          <div className="relative mb-6">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            {passwordError && <ErrorPopup message={passwordError} />}
            <div className="relative">
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
          </div>  

          {/* Error Message */}
          <div className="relative mb-6">
            {error && <ErrorPopup message={error} />}
            <Button onClick={handleSignup} disabled={loading} className="w-full">
              {loading ? "Loading..." : "Sign Up"}
            </Button>
          </div>

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
