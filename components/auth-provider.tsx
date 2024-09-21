import React, { createContext, useContext, useState, ReactNode } from "react";

// トークン管理用のContextを作成
interface AuthContextType {
  apiUrl: string;
  token: string | null;
  setToken: (token: string | null) => void;
}

// 初期値はトークンがnull、関数は空
const AuthContext = createContext<AuthContextType>({
  apiUrl: "https://chronotes.yashikota.com/api/v1",
  token: null,
  setToken: () => { },
});

// プロバイダーを作成して、トークンの状態を提供
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const apiUrl = "https://chronotes.yashikota.com/api/v1";
  const [token, setToken] = useState<string | null>(() => {
    // 初期値をlocalStorageから取得
    return localStorage.getItem("token");
  });

  // トークンを変更するときにlocalStorageにも保存
  const handleSetToken = (newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
  };

  return (
    <AuthContext.Provider value={{ apiUrl, token, setToken: handleSetToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// フックを使って簡単にトークン情報にアクセスできるように
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
