import { getCookie, deleteCookie } from "@/lib/cookie";

const API_URL = "https://chronotes.yashikota.com/api/v1";
const REQUEST_LIMIT = 30; // 10リクエストまで
const TIME_WINDOW = 5000; // 5秒間

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiRequestOptions {
  method: RequestMethod;
  url: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

let requestCount = 0;
let firstRequestTime: number | null = null;

export const ApiHandler = () => {
  const token = getCookie("token");

  const apiRequest = async ({
    method,
    url,
    body,
    headers = {},
  }: ApiRequestOptions) => {
    const now = Date.now();

    // 最初のリクエスト時間が未設定なら設定
    if (!firstRequestTime) {
      firstRequestTime = now;
    }

    // 時間ウィンドウが過ぎたらカウントをリセット
    if (now - firstRequestTime > TIME_WINDOW) {
      requestCount = 0;
      firstRequestTime = now;
    }

    // リクエスト回数をチェック
    if (requestCount >= REQUEST_LIMIT) {
      console.error("リクエスト制限: 短期間でのリクエストが多すぎます。");
      throw new Error("Request limit exceeded. Please try again later.");
    }

    // リクエスト回数を増加
    requestCount++;

    const requestHeaders: HeadersInit = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...headers,
    };

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    };

    try {
      const response = await fetch(`${API_URL}${url}`, requestOptions);
      if (response.ok === true) {
        const data = await response.json();
        return data;
      } else {
        switch (response.status) {
          case 400:
            throw new Error("Bad Request");
          case 401:
            deleteCookie("token");
            window.location.href = "/login";
            throw new Error("Unauthorized");
          case 404:
            throw new Error("Not Found");
          case 500:
            throw new Error("Internal Server Error");
          default:
            throw new Error("Unknown Error");
        }
      }
    } catch (error) {
      console.error("API Request Error:", error);
      return null;
    }
  };

  return { apiRequest };
};
