import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3C Search",
  description: "Get the top 3 results for anything you search",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white antialiased">{children}</body>
    </html>
  );
}
