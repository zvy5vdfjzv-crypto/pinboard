import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/common/Header";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white">
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
