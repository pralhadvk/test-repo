import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "3C Search",
  description: "Get the top 3 results for anything you search",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#080c14] text-white antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
