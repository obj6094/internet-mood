import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Internet Mood",
  description:
    "Vote a mood and watch the internet's collective expression shift through one live globe snapshot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
