import { getCookie, deleteCookie } from "@/lib/cookie";

const API_URL = "https://chronotes.yashikota.com/api/v1";

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiRequestOptions {
  method: RequestMethod;
  url: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export const ApiHandler = () => {
  const token = getCookie("token");

  const apiRequest = async ({
    method,
    url,
    body,
    headers = {},
  }: ApiRequestOptions) => {
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
