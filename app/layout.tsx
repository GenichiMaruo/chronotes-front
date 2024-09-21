import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { ApiProvider } from "@/components/api-provider";

const title = "Chronotes";
const description = "Chronotes";
const imageUrl = "/icon.png";

export const metadata: Metadata = {
  title: title,
  description: description,
  openGraph: {
    images: [imageUrl],
  },
  icons: {
    icon: imageUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <ApiProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ApiProvider>
      </body>
    </html>
  );
}
