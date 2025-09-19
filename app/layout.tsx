import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// import { Provider } from "react-redux";
// import { store } from "@/redux/store";
import StoreProvider from "./StoreProvider";
import { Toaster } from "react-hot-toast";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "STOCK MARKET DASHBOARD",
  description: "Stock Market institute dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <Provider store={store}> {children} </Provider> */}
        <StoreProvider>
          {children}

          <Toaster position="top-center" reverseOrder={false} />
        </StoreProvider>
      </body>
    </html>
  );
}
