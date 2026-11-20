import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
export const metadata: Metadata = { title: 'Study Journal — SSLC 2027', description: 'A focused study command centre for SSLC 2027.' };
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) { return <html lang="en" suppressHydrationWarning><body>{children}</body></html>; }
