import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth-provider";
import { TopNavbar } from "@/components/top-navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "StickyYT",
  description: "Track what you watch. Stay intentional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <TopNavbar />
          <div className="flex-1">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
