import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Shopify Virtual Try-On",
  description: "Experience products virtually before you buy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-gray-100`}
      >
        <div className="min-h-screen flex flex-col">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-gray-900">Shopify Virtual Try-On</h1>
            </div>
          </header>
          <main className="flex-grow max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-gray-500">© 2023 Shopify Virtual Try-On App</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
