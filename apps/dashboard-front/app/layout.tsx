import type { Metadata } from "next";
import { AppToaster } from "@/app/components/molecules/AppToaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Closed AI",
  description: "Role-based MVP workspaces for Closed AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
