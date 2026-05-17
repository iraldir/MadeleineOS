import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import ClientLayout from '@/components/ClientLayout';

const schoolbell = localFont({
  src: '../public/fonts/Twinkl-webfont.woff',
  variable: '--font-schoolbell',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Madeleine's Learning Games",
  description: "Interactive educational games for children",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={schoolbell.variable}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
