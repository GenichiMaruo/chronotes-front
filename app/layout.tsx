import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ThemeProvider } from "@/components/theme-provider";

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
    <html lang="ja" suppressHydrationWarning={true}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId="G-R13JG02Z2F" />
    </html>
  );
}
