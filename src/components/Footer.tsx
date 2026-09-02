import React from 'react';
import Link from 'next/link';
import { 
  Ticket, 
  ShieldCheck, 
  Heart, 
  HelpCircle, 
  PhoneCall, 
  Mail, 
  CheckCircle2, 
  CreditCard, 
  Lock, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-traveloka-navy text-slate-300 mt-20 border-t border-slate-800">
      {/* 1. Trust & Highlights Bar */}
      <div className="bg-slate-900/60 border-b border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-traveloka-blue/20 text-traveloka-blue flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">100% Tiket Resmi</p>
              <p className="text-xs text-slate-400">Langsung dari promotor terverifikasi</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-traveloka-orange flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Pembayaran Mudah & Aman</p>
              <p className="text-xs text-slate-400">Transfer bank & e-wallet lengkap</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">E-Tiket Instan QR Code</p>
              <p className="text-xs text-slate-400">Siap dipindai langsung di pintu masuk</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Bantuan Pelanggan 24/7</p>
              <p className="text-xs text-slate-400">Layanan ramah siap membantu kamu</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-traveloka-blue flex items-center justify-center text-white shadow-md">
                <Ticket className="w-5 h-5 -rotate-12" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                event<span className="text-traveloka-blue">ix</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Platform pemesanan tiket konser musik, panggung festival, dan pertunjukan seni nomor satu di Indonesia. Solusi hiburan live terpercaya dengan jaminan keaslian tiket 100%.
            </p>

            <div className="space-y-2 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-traveloka-blue" />
                <span>Hotline: +62 21 5080 8899</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-traveloka-yellow" />
                <span>Email: support@eventix.id</span>
              </div>
            </div>
          </div>

          {/* Col 2: Kategori Konser */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Kategori Acara
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-traveloka-blue transition-colors">
                  Konser Pop & Indie
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-traveloka-blue transition-colors">
                  Festival Musik Outdoor
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-traveloka-blue transition-colors">
                  Rock & Metal Live
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-traveloka-blue transition-colors">
                  Jazz & Soul Night
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-traveloka-blue transition-colors">
                  Stand Up Comedy Tour
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Layanan & Informasi */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Bantuan & Panduan
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/my-tickets" className="hover:text-traveloka-blue transition-colors">
                  Cara Klaim E-Tiket
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-traveloka-blue transition-colors">
                  Pusat Bantuan & FAQ
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-traveloka-blue transition-colors">
                  Ketentuan Refund & Reschedule
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-traveloka-blue transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-traveloka-blue transition-colors">
                  Syarat & Ketentuan Umum
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Mitra Promotor */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Mitra Penyelenggara
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/auth/register" className="text-amber-400 font-semibold hover:underline flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Daftar Organizer Baru
                </Link>
              </li>
              <li>
                <Link href="/dashboard/organizer" className="hover:text-traveloka-blue transition-colors">
                  Portal Extranet Mitra
                </Link>
              </li>
              <li>
                <Link href="/dashboard/organizer" className="hover:text-traveloka-blue transition-colors">
                  Kelola Rekening Bank
                </Link>
              </li>
              <li>
                <Link href="/dashboard/organizer" className="hover:text-traveloka-blue transition-colors">
                  Verifikasi Bukti Bayar
                </Link>
              </li>
            </ul>

            <div className="pt-3">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Railway API Connected</span>
                </div>
                <p className="text-slate-400 truncate">
                  Backend Production Live
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Payment Methods & Security Icons Strip (Traveloka Style) */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Metode Pembayaran Resmi
            </span>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-1 bg-white text-slate-800 text-[11px] font-bold rounded shadow-sm">BCA</span>
              <span className="px-2.5 py-1 bg-white text-slate-800 text-[11px] font-bold rounded shadow-sm">MANDIRI</span>
              <span className="px-2.5 py-1 bg-white text-slate-800 text-[11px] font-bold rounded shadow-sm">BNI</span>
              <span className="px-2.5 py-1 bg-white text-slate-800 text-[11px] font-bold rounded shadow-sm">BRI</span>
              <span className="px-2.5 py-1 bg-white text-slate-800 text-[11px] font-bold rounded shadow-sm">QRIS</span>
              <span className="px-2.5 py-1 bg-white text-slate-800 text-[11px] font-bold rounded shadow-sm">GOPAY</span>
              <span className="px-2.5 py-1 bg-white text-slate-800 text-[11px] font-bold rounded shadow-sm">OVO</span>
            </div>
          </div>

          <div className="space-y-2 text-center md:text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Keamanan Transaksi
            </span>
            <div className="flex items-center justify-center md:justify-end gap-3 text-xs text-emerald-400 font-semibold">
              <div className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <Lock className="w-3.5 h-3.5" />
                <span>256-Bit SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-traveloka-blue" />
                <span>Verified Partner</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-10 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PT Eventix Global Indonesia. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-1">
            <span>Dibuat dengan dedikasi untuk penikmat panggung konser musik</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
