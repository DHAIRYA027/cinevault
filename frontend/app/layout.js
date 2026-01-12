import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CineVault",
  description: "The ultimate collection of cinema.",
};

// 👇 THIS IS THE PART THAT WAS MISSING/BROKEN
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}