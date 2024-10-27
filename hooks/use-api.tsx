import { getCookie, deleteCookie } from "@/lib/cookie";

const API_URL = "https://chronotes.yashikota.com/api/v1";
const REQUEST_LIMIT = 30;
const TIME_WINDOW = 5000;

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiRequestOptions {
  method: RequestMethod;
  url: string;
  body?: Record<string, unknown> | FormData;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  isFormData?: boolean;
}

let requestCount = 0;
let firstRequestTime: number | null = null;

export const ApiHandler = () => {
  const token = getCookie("token");

  const handleRateLimit = () => {
    const now = Date.now();
    if (!firstRequestTime) {
      firstRequestTime = now;
    }

    if (now - firstRequestTime > TIME_WINDOW) {
      requestCount = 0;
      firstRequestTime = now;
    }

    if (requestCount >= REQUEST_LIMIT) {
      console.error("リクエスト制限: 短期間でのリクエストが多すぎます。");
      throw new Error("Request limit exceeded. Please try again later.");
    }

    requestCount++;
  };

  const apiRequest = async ({
    method,
    url,
    body,
    headers = {},
    isFormData = false,
  }: ApiRequestOptions) => {
    handleRateLimit();

    const requestHeaders: HeadersInit = {
      Authorization: `Bearer ${token}`,
      ...headers,
    };

    // FormDataの場合はContent-Typeを設定しない（ブラウザが自動的に設定する）
    if (!isFormData) {
      requestHeaders["Content-Type"] = "application/json";
    }

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
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

  // 画像アップロード専用の関数
  const uploadImage = async (url: string, image: File, additionalData?: Record<string, string>) => {
    const formData = new FormData();
    formData.append("image", image);

    // 追加のデータがある場合はFormDataに追加
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return apiRequest({
      method: "POST",
      url,
      body: formData,
      isFormData: true,
    });
  };

  const getImage = async (url: string) => {
    const returnData = await apiRequest({
      method: "GET",
      url,
    });
    // urlが返ってくるのでそこにアクセスして画像を取得
    const image = await fetch(`${returnData.url}`);
    return image;
  }

  return { apiRequest, uploadImage, getImage };
};