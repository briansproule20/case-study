import Header from '@/app/_components/header';
import { Providers } from '@/providers';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Case Study',
  description: 'AI-powered case study application',
  openGraph: {
    title: 'Case Study',
    description: 'AI-powered case study application',
    images: [
      {
        url: '/casestudy-favicon.png',
        width: 512,
        height: 512,
        alt: 'Case Study',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Case Study',
    description: 'AI-powered case study application',
    images: ['/casestudy-favicon.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex h-screen flex-col antialiased`}
      >
        <Providers>
          <Header title="Case Study" />
          <div className="min-h-0 flex-1">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
