import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { Playfair_Display } from 'next/font/google';
import './globals.css';
import StoreProvider from '@/store/StoreProvider';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The House of Aatmiya — Crafted Like Family',
  description:
    'Premium pure cotton clothing for adults, small-batch clean kids snacks, and bespoke gift hampers founded by Arun & Snehal, inspired by Saharsha & Sreeja.',
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
    <html lang="en" className={`${GeistSans.variable} ${playfair.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
