import Link from 'next/link';
import { Ticket, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 py-12">
      <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400 shadow-glow">
        <Ticket className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-white">404</h1>
        <h2 className="text-xl font-bold text-gray-200">Halaman Tidak Ditemukan</h2>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          Halaman konser atau rute yang Anda cari tidak ditemukan atau telah dipindahkan.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>
    </div>
  );
}
