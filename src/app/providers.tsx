"use client";
import { SessionProvider } from "next-auth/react";
// import { RecoilRoot } from 'recoil'
import { Provider as JotaiProvider } from 'jotai';

export function Providers({ children }: { children: React.ReactNode }) {
  return <JotaiProvider>
          <SessionProvider>{children}</SessionProvider>
        </JotaiProvider>;
}