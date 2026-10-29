import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { QueryClientProvider } from "@/components/providers/QueryClientProvider";
import { Toaster } from "sonner";
import AuthSessionProvider from "@/components/providers/AuthSessionProvider";




export const metadata: Metadata = {
  title: "Elysia Admin Dashboard",
  description: "Elysia Admin Dashboard by Elysia ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans")}>
      <body
        className={` antialiased`}
      >
        <QueryClientProvider>
          <Toaster
            position="top-right"
            richColors
            theme="dark"
            closeButton
          />
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
// 