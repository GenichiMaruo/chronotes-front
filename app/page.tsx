"use client";

import { useState, useEffect } from "react";
import { getCookie } from "@/lib/cookie";
import { setCookie } from "@/lib/cookie";
import { Suspense } from "react";
import HomeContent from "@/app/home";

import { useRouter, useSearchParams } from "next/navigation";
import { ApiHandler } from "@/hooks/use-api";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ログイン状態を管理
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, setError] = useState("");
  const { apiRequest } = ApiHandler();
  
  const isDemo = searchParams.get("demo") !== null; // URLパラメータからデモユーザーかどうかを取得

  useEffect(() => {
    const token = getCookie("token");
    
    // isDemoがtrueで、トークンが無ければデモユーザーでのログインを実行
    if (isDemo && !token) {
      (async () => {
        try {
          const body = {
            user_id: "demo",
            password: "demoryouga",
          };

          // APIリクエストを送信
          const data = await apiRequest({
            method: "POST",
            url: "/auth/login",
            body,
          });

          if (data) {
            const { token } = data;
            // トークンをCookieにセット
            setCookie("token", token, 7);
            setIsLoggedIn(true);
            // ログイン後のリダイレクト
            router.push("/"); 
          } else {
            throw new Error("Failed to login");
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError("Failed to login");
          }
        }
      })();
    } else if (token) {
      setIsLoggedIn(true); // トークンが存在する場合、ログイン状態に設定
    }
  }, [apiRequest, isDemo, router]);

  return (
    <div className="h-screen w-full flex justify-center items-center">
      <Suspense fallback={<div>Loading...</div>}>
        <HomeContent isLoggedIn={isLoggedIn}/>
      </Suspense>
    </div>
  );
}
