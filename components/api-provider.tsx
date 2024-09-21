"use client";

// api-provider.tsx
import React, { createContext, useContext } from 'react';

// APIのURLを設定
const API_URL = 'https://chronotes.yashikota.com/api/v1';

// Contextの作成
const ApiContext = createContext<string | undefined>(undefined);

// ApiProviderコンポーネントの定義
export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ApiContext.Provider value={API_URL}>
      {children}
    </ApiContext.Provider>
  );
};

// API URLを取得するためのカスタムフック
export const useApiUrl = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApiUrl must be used within an ApiProvider');
  }
  return context;
};
