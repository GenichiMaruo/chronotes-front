'use client';

import { useState, useEffect } from "react";
import { getCookie } from "@/lib/cookie";
import HomeContent from "@/app/home";
import Header from "@/components/header";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ログイン状態を管理

  useEffect(() => {
    const token = getCookie('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />
      <HomeContent isLoggedIn={isLoggedIn} />
    </>
  );
}
