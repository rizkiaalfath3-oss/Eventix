import Link from 'next/link';
import { Ticket, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 min-h-[65vh] flex flex-col items-center justify-center text-center space-y-6 py-16">
      
      <div className="bg-white rounded-3xl p-10 max-w-md mx-auto space-y-5 border border-slate-200 shadow-floating">
        
        <div className="w-16 h-16 rounded-2xl bg-traveloka-sky text-traveloka-blue flex items-center justify-center mx-auto">
          <Ticket className="w-8 h-8 -rotate-12" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-extrabold text-traveloka-blue">
            404
          </span>
          <h2 className="text-lg font-bold text-slate-900">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Halaman atau konser yang Anda cari tidak tersedia atau tautan telah dipindahkan.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="traveloka-btn-orange text-xs py-2.5 px-6 inline-flex items-center gap-2 font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

      </div>

    </div>
  );
}
