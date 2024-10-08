import { getCookie, deleteCookie } from "@/lib/cookie";

const API_URL = 'https://chronotes.yashikota.com/api/v1';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiRequestOptions {
  method: RequestMethod;
  url: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export const ApiHandler = () => {
  const token = getCookie('token');

  const apiRequest = async ({ method, url, body, headers = {} }: ApiRequestOptions) => {
    const requestHeaders: HeadersInit = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...headers,
    };

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    };

    try {
      const response = await fetch(`${API_URL}${url}`, requestOptions);

      // 401エラーの場合の処理
      if (response.status === 401) {
        deleteCookie('token');
        window.location.href = '/login';
        return null;
      }

      // 204 No Content の場合の処理
      if (response.status === 204) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      return null;
    }
  };

  return { apiRequest };
};
