import React from 'react';
import Link from 'next/link';
import { Ticket, Heart, Shield, Music, Disc, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#080B12] border-t border-surface-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px]">
                <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                EVENT<span className="text-indigo-400">IX</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Platform resmi penjualan tiket konser musik terbaik di Indonesia. Transaksi instan, aman dengan tiket digital ber-QR Code.
            </p>
            <div className="flex items-center gap-3 text-gray-500 pt-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-surface-card border border-surface-border text-gray-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> 100% Verified
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Jelajahi</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/" className="hover:text-indigo-400 transition-colors">Semua Konser</Link>
              </li>
              <li>
                <Link href="/my-tickets" className="hover:text-indigo-400 transition-colors">Tiket Saya</Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-indigo-400 transition-colors">Daftar Akun</Link>
              </li>
            </ul>
          </div>

          {/* Organizer */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Untuk Organizer</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/dashboard/organizer" className="hover:text-purple-400 transition-colors">Dashboard Organizer</Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-purple-400 transition-colors">Buat Event Konser</Link>
              </li>
              <li>
                <Link href="/dashboard/organizer" className="hover:text-purple-400 transition-colors">Kelola Metode Pembayaran</Link>
              </li>
            </ul>
          </div>

          {/* Backend Info / Live Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Live Backend</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Terhubung langsung ke Railway Production API.
            </p>
            <div className="p-3 rounded-xl bg-surface-card border border-surface-border space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-[11px] font-semibold text-emerald-400">Railway API Connected</span>
              </div>
              <p className="text-[10px] text-gray-500 truncate">
                eventix-backend-production.up.railway.app
              </p>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Eventix Inc. Hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-1 text-gray-400">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>untuk pecinta musik</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
