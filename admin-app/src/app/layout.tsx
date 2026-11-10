import type { Metadata } from 'next';
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
  title: "Snehal's Admin Console — The House of Aatmiya",
  description:
    'Admin dashboard for Order Concierge, 3-Mode Storefront Control, Kitchen Batch Prep, and Margin Tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${playfair.variable}`}>
      <body className="antialiased min-h-screen">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
