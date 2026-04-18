import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "پروفایل کاربری",
  description: "اپلیکیشن پروفایل کاربری فارسی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
