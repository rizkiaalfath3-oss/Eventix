'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Sparkles, 
  Music, 
  Flame, 
  Calendar, 
  ShieldCheck, 
  Zap, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/axios';
import { Event } from '@/types';
import { EventCard } from '@/components/EventCard';

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const fetchEvents = async (query = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Event[]>('/events', {
        params: query ? { search: query } : {},
      });
      setEvents(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch events:', err);
      setError(err?.response?.data?.message || 'Gagal memuat daftar konser dari server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEvents(searchQuery);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const filteredEvents = events.filter((event) => {
    if (filterStatus === 'ALL') return true;
    return event.status === filterStatus;
  });

  return (
    <div className="space-y-16 py-4">
      
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden p-8 sm:p-14 bg-gradient-to-b from-indigo-950/40 via-surface/80 to-surface-card/60 border border-indigo-500/20 backdrop-blur-xl">
        {/* Glow light background */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold tracking-wide uppercase shadow-glow">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            Platform Resmi Tiket Konser & Festival 2026
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Rasakan Detak Musik <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Live & Tak Terlupakan
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Dapatkan tiket konser musisi favoritmu secara resmi, aman, dan instan. Tiket langsung siap di ponselmu dengan QR Code terverifikasi.
          </p>

          {/* Search Box */}
          <div className="pt-2 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama konser, artis, atau lokasi..."
                className="w-full pl-12 pr-28 py-4 rounded-2xl bg-[#0E1524]/90 border border-surface-border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-gray-500 text-sm shadow-xl transition-all"
              />
              <button
                onClick={() => fetchEvents(searchQuery)}
                className="absolute right-2.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              >
                Cari
              </button>
            </div>
          </div>

          {/* Quick Features */}
          <div className="pt-6 grid grid-cols-3 gap-3 max-w-lg mx-auto text-left">
            <div className="p-3 rounded-xl bg-surface/50 border border-white/5 flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-[11px] text-gray-300 font-medium leading-tight">Proses Cepat & Mudah</span>
            </div>
            <div className="p-3 rounded-xl bg-surface/50 border border-white/5 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-[11px] text-gray-300 font-medium leading-tight">100% Tiket Resmi</span>
            </div>
            <div className="p-3 rounded-xl bg-surface/50 border border-white/5 flex items-center gap-2.5">
              <Flame className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span className="text-[11px] text-gray-300 font-medium leading-tight">Konser Terpopuler</span>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="space-y-6">
        
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Music className="w-6 h-6 text-indigo-400" />
              Daftar Konser Pilihan
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Temukan pengalaman musik terbaik langsung dari backend kami.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {['ALL', 'PUBLISHED', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterStatus === status
                    ? 'bg-indigo-600 text-white shadow-glow'
                    : 'bg-surface-card text-gray-400 hover:text-white border border-surface-border'
                }`}
              >
                {status === 'ALL' ? 'Semua Konser' : status === 'PUBLISHED' ? 'Tersedia' : 'Selesai'}
              </button>
            ))}

            <button
              onClick={() => fetchEvents(searchQuery)}
              title="Refresh Data"
              className="p-2 rounded-xl bg-surface-card border border-surface-border text-gray-400 hover:text-white hover:bg-surface-hover transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content State: Error, Loading, or Grid */}
        {error && (
          <div className="p-6 rounded-2xl bg-red-950/30 border border-red-800/40 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-sm font-semibold text-red-300">{error}</p>
            <button
              onClick={() => fetchEvents(searchQuery)}
              className="px-4 py-2 rounded-xl bg-red-800/60 hover:bg-red-700 text-white text-xs font-semibold"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-96 rounded-3xl bg-surface-card border border-surface-border animate-pulse p-4 space-y-4"
              >
                <div className="w-full h-48 bg-surface-border rounded-2xl" />
                <div className="h-5 bg-surface-border rounded-lg w-3/4" />
                <div className="h-4 bg-surface-border rounded-lg w-1/2" />
                <div className="pt-4 flex justify-between">
                  <div className="h-6 bg-surface-border rounded-lg w-1/3" />
                  <div className="h-6 bg-surface-border rounded-lg w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="p-16 rounded-3xl bg-surface-card border border-surface-border text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-800/30 mx-auto flex items-center justify-center">
              <Calendar className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Belum Ada Konser Ditemukan</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              {searchQuery 
                ? `Tidak ada konser yang cocok dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                : 'Saat ini belum ada konser aktif di platform. Jika kamu adalah organizer, silakan buat konser pertamamu!'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        )}

      </section>

    </div>
  );
}
