// TypeScript may complain about side-effect CSS imports in some setups.
// @ts-ignore
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Study Tracker",
  description:
    "Plan. Focus. Track. Achieve. Your intelligent exam preparation companion.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-[#070B14] text-white antialiased`}>
          {children}
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "#0F1629",
                border: "1px solid rgba(124,58,237,0.3)",
                color: "#e2e8f0",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}