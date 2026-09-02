'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, 
  Sparkles, 
  Music, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  AlertCircle,
  MapPin,
  Flame,
  Tag,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  HelpCircle,
  CreditCard,
  QrCode,
  Music2,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import api from '@/lib/axios';
import { Event } from '@/types';
import { EventCard } from '@/components/EventCard';

const CATEGORIES = [
  { name: 'Semua Konser', icon: Music2, filter: '' },
  { name: 'Pop & Indie', icon: Music, filter: 'pop' },
  { name: 'Festival Outdoor', icon: Sparkles, filter: 'festival' },
  { name: 'Rock & Metal', icon: Flame, filter: 'rock' },
  { name: 'Jazz & Soul', icon: Tag, filter: 'jazz' },
];

const LOCATIONS = ['Semua Lokasi', 'Jakarta', 'Bandung', 'Bali', 'Surabaya', 'Yogyakarta'];

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Semua Lokasi');
  const [activeCategory, setActiveCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
    }, 350);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Filter events based on Status, Category, and Location
  const filteredEvents = events.filter((event) => {
    const matchesStatus = filterStatus === 'ALL' || event.status === filterStatus;
    const matchesLocation = 
      selectedLocation === 'Semua Lokasi' || 
      event.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesCat = 
      !activeCategory || 
      event.title.toLowerCase().includes(activeCategory.toLowerCase()) || 
      event.description.toLowerCase().includes(activeCategory.toLowerCase());

    return matchesStatus && matchesLocation && matchesCat;
  });

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. Traveloka Style Hero Section with Search Box */}
      <section className="relative w-full bg-gradient-to-b from-traveloka-navy to-slate-900 pt-10 pb-28 sm:pb-36 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Image with Atmospheric Lighting */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1800&auto=format&fit=crop"
            alt="Live Concert Crowd"
            fill
            priority
            className="object-cover object-center opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-traveloka-navy/90" />
        </div>

        {/* Hero Title & Subtitle */}
        <div className="relative z-10 max-w-7xl mx-auto text-center space-y-4 pt-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-traveloka-yellow" />
            <span>Platform Tiket Konser Resmi Terpercaya se-Indonesia</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Temukan & Pesan Tiket Konser Favoritmu di <span className="text-traveloka-blue">Eventix</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Jaminan 100% tiket resmi langsung dari promotor terverifikasi. Transaksi aman, instan e-ticket, siap dipindai di pintu gerbang panggung.
          </p>
        </div>

        {/* 2. Interactive Traveloka Search Box (Floating Box) */}
        <div className="relative z-20 max-w-5xl mx-auto mt-10">
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-floating border border-slate-100 space-y-5">
            
            {/* Category Tabs along Top of Search Box */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-100">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = activeCategory === cat.filter;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setActiveCategory(cat.filter)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-traveloka-blue text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-traveloka-sky hover:text-traveloka-blue'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input Bar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              
              {/* Field 1: Lokasi / Kota */}
              <div className="md:col-span-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Lokasi Venue
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-rose-500" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-xs font-semibold text-slate-800 outline-none focus:border-traveloka-blue focus:ring-2 focus:ring-traveloka-blue/20 transition-all appearance-none cursor-pointer"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Search Artist / Concert Name */}
              <div className="md:col-span-6">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Nama Konser / Artis / Festival
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="mis. Coldplay, Dewa 19, Java Jazz, Soundrenaline..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-xs font-semibold text-slate-800 outline-none focus:border-traveloka-blue focus:ring-2 focus:ring-traveloka-blue/20 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Field 3: CTA Button */}
              <div className="md:col-span-3 pt-5 md:pt-4">
                <button
                  type="button"
                  onClick={() => fetchEvents(searchQuery)}
                  className="w-full traveloka-btn-orange py-3 text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Cari Tiket</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Main Event Listing & Explorer Grid */}
      <section id="daftar-konser" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Header with Status Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-6 bg-traveloka-blue rounded-full" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Pilihan Konser & Panggung Musik Terpopuler
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 pl-4.5">
              Pilih panggung musik favoritmu dan dapatkan tiket resmi dengan mudah
            </p>
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterStatus === 'ALL'
                  ? 'bg-traveloka-blue text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Semua Konser
            </button>

            <button
              onClick={() => setFilterStatus('PUBLISHED')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterStatus === 'PUBLISHED'
                  ? 'bg-traveloka-blue text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Tersedia
            </button>

            <button
              onClick={() => setFilterStatus('COMPLETED')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterStatus === 'COMPLETED'
                  ? 'bg-traveloka-blue text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Selesai
            </button>

            <button
              onClick={() => fetchEvents(searchQuery)}
              className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
              title="Perbarui Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center space-y-2">
            <AlertCircle className="w-6 h-6 text-rose-500 mx-auto" />
            <p className="text-xs font-bold text-rose-700">{error}</p>
            <button
              onClick={() => fetchEvents(searchQuery)}
              className="traveloka-btn-outline text-xs py-1.5 px-4"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Event Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 animate-pulse"
              >
                <div className="w-full h-44 bg-slate-200 rounded-xl" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                <div className="pt-4 flex justify-between items-center">
                  <div className="h-5 bg-slate-200 rounded w-1/3" />
                  <div className="h-8 bg-slate-200 rounded-full w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-traveloka-sky text-traveloka-blue mx-auto flex items-center justify-center">
              <Music2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Tidak Ada Konser yang Sesuai
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {searchQuery || selectedLocation !== 'Semua Lokasi' || activeCategory
                ? 'Tidak ada jadwal konser yang cocok dengan filter pencarian Anda. Silakan coba atur ulang filter atau kata kunci.'
                : 'Saat ini belum ada event konser yang terdaftar di sistem.'}
            </p>
            {(searchQuery || selectedLocation !== 'Semua Lokasi' || activeCategory) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLocation('Semua Lokasi');
                  setActiveCategory('');
                }}
                className="traveloka-btn-outline text-xs py-2 px-5 font-bold"
              >
                Reset Semua Filter
              </button>
            )}
          </div>
        )}

      </section>

      {/* 5. Keunggulan Eventix Section (Traveloka Features) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-gradient-to-r from-sky-50 via-traveloka-sky/30 to-amber-50/50 rounded-3xl p-8 sm:p-12 border border-slate-200/80">
          <div className="text-center space-y-2 mb-10 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-traveloka-blue">
              KENAPA MEMILIH EVENTIX
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Kemudahan Pesan Tiket Konser Tanpa Was-was
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Standar pengalaman pemesanan tiket hiburan live kelas satu di Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-traveloka-sky text-traveloka-blue flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">100% Jaminan Tiket Resmi</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bermitra resmi dengan promotor konser terverifikasi. Tidak ada calo, tidak ada tiket duplikat.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-traveloka-orange flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Pembayaran Praktis</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mendukung transfer bank BCA, Mandiri, BRI, QRIS, serta e-wallet dengan verifikasi transparan.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">E-Tiket QR Code Instan</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dapatkan tiket ber-QR code unik dan unduh format PDF siap cetak untuk pemindaian instan di gate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section (Pertanyaan Populer Pembeli Tiket) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Informasi penting seputar pembelian tiket konser di Eventix
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Bagaimana cara mendapatkan dan menggunakan e-tiket setelah membayar?',
              a: 'Setelah Anda mengunggah bukti transfer, penyelenggara akan memverifikasi pesanan Anda. Setelah terverifikasi, e-tiket dengan QR Code unik dan tombol Unduh PDF akan langsung tersedia di menu "Tiket Saya".'
            },
            {
              q: 'Apakah tiket yang dibeli di Eventix dijamin resmi dan bisa masuk gate?',
              a: 'Ya, 100% dijamin resmi. Eventix hanya bekerja sama langsung dengan promotor dan organizer konser resmi yang telah lolos verifikasi identitas dan rekening perbankan.'
            },
            {
              q: 'Berapa jumlah maksimal tiket yang bisa dibeli dalam satu transaksi?',
              a: 'Untuk menjaga pemerataan pembeli, maksimal pembelian tiket adalah 5 tiket per transaksi.'
            },
            {
              q: 'Bagaimana jika saya ingin mendaftar sebagai penyelenggara konser / promotor?',
              a: 'Anda dapat mendaftar dengan memilih peran "Mitra Organizer" pada halaman Registrasi, lalu masuk ke Dashboard Organizer untuk membuat acara dan mengelola tiket.'
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-800 hover:text-traveloka-blue transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                    openFaq === index ? 'rotate-180 text-traveloka-blue' : ''
                  }`}
                />
              </button>

              {openFaq === index && (
                <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
