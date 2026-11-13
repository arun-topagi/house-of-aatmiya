import type { Metadata, Viewport } from 'next';
import { GeistMono } from 'geist/font/mono';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import StoreProvider from '@/store/StoreProvider';

const credDisplay = Outfit({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-cred-display',
  display: 'swap',
});

const credSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cred-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The House of Aatmiya — Crafted Like Family',
  description:
    'Premium pure cotton clothing for adults, small-batch clean kids snacks, and bespoke gift hampers.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${credDisplay.variable} ${credSans.variable} ${GeistMono.variable} h-full antialiased dark`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface font-body-md text-on-surface antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
