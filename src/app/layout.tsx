// 'use client'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Sidebar from "./components/Sidebar";
import { getServerSession } from "next-auth";
import { isAuthenticated } from "./uiUtils";
import { Toaster } from "react-hot-toast";
import { useSession } from "next-auth/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "Engineers Camp",
//   description: "Technical and academic assessments",
// };

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const session = await getServerSession();
  const isLoggedIn = await isAuthenticated()
  console.log('layout session',session);
  console.log('isLoggedIn',isLoggedIn);

  const renderMainSection = async () => {
    // const { data: session, status } = useSession();
    const session = await getServerSession();
    console.log('session',session);
    return (
      <>
        {session ? (
          <div className="flex">
            <Sidebar />
            <main className="flex-1">{children}</main>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </>
    ) 
  }

  return (
    <html lang="en">
      <head>
        <title>Engineers Camp</title>
        <meta name="description" content="Technical and academic assessments" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Toaster position="top-center" reverseOrder={false} />
          <Providers>
            {session ? (
              <div className="flex">
                <Sidebar />
                <main className="flex-1">{children}</main>
              </div>
            ) : (
              <main>{children}</main>
            )}
            {/* {await renderMainSection()} */}
          </Providers>
      </body>
    </html>
  );
}
