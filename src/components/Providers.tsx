'use client';

import { EveProvider } from "@/context/EveContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EveProvider>
      {children}
    </EveProvider>
  );
}
