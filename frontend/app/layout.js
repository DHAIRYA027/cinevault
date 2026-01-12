import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
// ❌ The theme import is REMOVED

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CineVault",
  description: "The Ultimate Movie Database",
};

export default function RootLayout({ children }) {
  return (
    // 👇 REMOVED "baseTheme: dark" to fix the error
    <ClerkProvider
      appearance={{
        variables: { 
            colorPrimary: '#22d3ee', 
            colorBackground: '#111',
            colorText: 'white' 
        }
      }}
    >
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}