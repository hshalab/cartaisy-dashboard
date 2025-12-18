import type { Metadata } from "next";
import localFont from "next/font/local";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";

const geistSans = localFont({
  src: "../public/fonts/Geist-VariableFont_wght.ttf",
  variable: "--font-geist-sans",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Cartaisy - Transform Your Shopify Store Into a Mobile App",
  description: "The complete dashboard to design, manage, and optimize your Shopify mobile app. Drag-and-drop components, real-time analytics, and instant updates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable} suppressHydrationWarning>
      <body
        className="font-sans antialiased"
        suppressHydrationWarning
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
