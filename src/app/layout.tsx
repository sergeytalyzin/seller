import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ozon Seller Analytics",
    template: "%s — Ozon Seller Analytics",
  },
  description:
    "Аналитика Ozon-магазина: чистая прибыль по каждому товару, убыточные SKU, контроль расходов.",
};

// Выставляет светлую тему до первой отрисовки, чтобы страница не мигала
const themeInitScript = `try{if(localStorage.theme==="light")document.documentElement.classList.add("light")}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
