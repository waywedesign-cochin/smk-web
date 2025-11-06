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
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1e293b",
                color: "#f1f5f9",
                border: "1px solid rgba(148, 163, 184, 0.1)",
                borderRadius: "12px",
                padding: "16px 20px",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
                backdropFilter: "blur(10px)",
                maxWidth: "500px",
              },
              success: {
                style: {
                  background:
                    "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  color: "#d1fae5",
                },
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#d1fae5",
                },
              },
              error: {
                style: {
                  background:
                    "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#fee2e2",
                },
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fee2e2",
                },
              },
            }}
          />{" "}
        </StoreProvider>
      </body>
    </html>
  );
}
