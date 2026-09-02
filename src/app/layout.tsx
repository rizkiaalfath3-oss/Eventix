import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Eventix — Platform Tiket Konser & Festival Musik Terpercaya',
  description: 'Beli tiket konser musik, panggung festival, dan pertunjukan live resmi se-Indonesia dengan harga terbaik, aman, dan bergaransi 100% di Eventix.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body className="bg-[#f7f9fa] text-slate-900 min-h-screen flex flex-col antialiased selection:bg-[#0194f3] selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
