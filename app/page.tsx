"use client";

import { useState, useEffect, Suspense } from "react";
import { getCookie } from "@/lib/cookie";
import { setCookie } from "@/lib/cookie";
import HomeContent from "@/app/home";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiHandler } from "@/hooks/use-api";

// SearchParamsを使用するコンポーネントを分離
function HomeWithSearchParams() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, setError] = useState("");
  const { apiRequest } = ApiHandler();

  useEffect(() => {
    const isDemo = searchParams.get("demo") !== null;
    const token = getCookie("token");

    if (isDemo && !token) {
      (async () => {
        try {
          const body = {
            user_id: "demo",
            password: "demoryouga",
          };

          const data = await apiRequest({
            method: "POST",
            url: "/auth/login",
            body,
          });

          if (data) {
            const { token } = data;
            setCookie("token", token, 7);
            setIsLoggedIn(true);
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
      setIsLoggedIn(true);
    }
  }, [apiRequest, searchParams, router]);

  return <HomeContent isLoggedIn={isLoggedIn} />;
}

// メインコンポーネント
export default function Home() {
  return (
    <div className="h-screen w-full flex justify-center items-center">
      <Suspense fallback={<div>Loading...</div>}>
        <HomeWithSearchParams />
      </Suspense>
    </div>
  );
}
