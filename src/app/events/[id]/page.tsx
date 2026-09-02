'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  ShieldCheck, 
  Clock, 
  ArrowLeft, 
  Share2, 
  AlertCircle, 
  Loader2, 
  Check, 
  Building2,
  Users,
  CreditCard,
  ChevronRight,
  Info,
  Sparkles,
  CheckCircle2,
  Shield
} from 'lucide-react';
import api from '@/lib/axios';
import { Event, TicketTier } from '@/types';
import { formatIDR, formatDate, getImageUrl } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'terms' | 'organizer'>('desc');

  useEffect(() => {
    const fetchEventDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<Event>(`/events/${eventId}`);
        const data = response.data;
        setEvent(data);
        if (data.ticketTiers && data.ticketTiers.length > 0) {
          setSelectedTier(data.ticketTiers[0]);
        }
      } catch (err: any) {
        console.error('Failed to fetch event detail:', err);
        setError(err.response?.data?.message || 'Konser tidak ditemukan atau telah dihapus.');
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetail();
    }
  }, [eventId]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      router.push(`/auth/login?redirect=/events/${eventId}`);
      return;
    }

    const tierParam = selectedTier ? `&tierId=${selectedTier.id}` : '';
    router.push(`/checkout?eventId=${eventId}${tierParam}&quantity=${quantity}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-traveloka-blue" />
        <p className="text-xs font-bold text-slate-500">Memuat detail konser...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="bg-white rounded-3xl p-10 max-w-md mx-auto space-y-4 border border-slate-200 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Konser Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500">{error || 'Konser yang kamu cari tidak tersedia.'}</p>
          <Link
            href="/"
            className="traveloka-btn-outline text-xs py-2 px-5 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice = selectedTier ? selectedTier.price : event.price;
  const currentAvailableQuota = selectedTier
    ? selectedTier.quota - (selectedTier.soldQuota || 0)
    : event.quota;

  const bannerSrc = getImageUrl(event.bannerUrl);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* 1. Breadcrumbs Navigation (Traveloka Style) */}
      <div className="flex items-center justify-between flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Link href="/" className="hover:text-traveloka-blue transition-colors">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/" className="hover:text-traveloka-blue transition-colors">
            Tiket Konser Musik
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-bold truncate max-w-[200px] sm:max-w-none">
            {event.title}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="traveloka-btn-outline text-xs py-1.5 px-3.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Kembali</span>
          </button>

          <button
            onClick={handleShare}
            className="traveloka-btn-outline text-xs py-1.5 px-3.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> : <Share2 className="w-3.5 h-3.5 mr-1" />}
            <span>{copied ? 'Tautan Disalin!' : 'Bagikan'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Grid: Left Details & Right Sticky Booking Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Photograph Banner */}
          <div className="relative w-full h-72 sm:h-[400px] bg-slate-100 rounded-3xl overflow-hidden shadow-card border border-slate-200">
            <Image
              src={bannerSrc}
              alt={event.title}
              fill
              priority
              className="object-cover object-center"
              unoptimized={bannerSrc.startsWith('http')}
            />
            
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-traveloka-blue text-white text-xs font-bold shadow-sm">
                Official Concert
              </span>
              <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold shadow-sm">
                {event.status}
              </span>
            </div>
          </div>

          {/* Title & Metadata Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              {event.title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-traveloka-sky text-traveloka-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400 block">Jadwal Konser</span>
                  <p className="text-xs font-bold text-slate-800">{formatDate(event.startDate)}</p>
                  <p className="text-[11px] text-slate-500">S/d: {formatDate(event.endDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400 block">Lokasi & Venue</span>
                  <p className="text-xs font-bold text-slate-800 line-clamp-2">{event.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Organizer Card */}
          {event.organizer && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-traveloka-blue to-traveloka-navy text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {event.organizer.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase text-slate-400">Penyelenggara Resmi</span>
                    {event.organizer.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Promotor Terverifikasi
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {event.organizer.organizationName || event.organizer.name}
                  </h4>
                  {event.organizer.bio && (
                    <p className="text-xs text-slate-500 mt-0.5">{event.organizer.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Content Tabs (Traveloka Style) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('desc')}
                className={`text-xs font-bold pb-2 border-b-2 transition-all ${
                  activeTab === 'desc'
                    ? 'border-traveloka-blue text-traveloka-blue'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Tentang Acara & Rundown
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('terms')}
                className={`text-xs font-bold pb-2 border-b-2 transition-all ${
                  activeTab === 'terms'
                    ? 'border-traveloka-blue text-traveloka-blue'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Syarat & Ketentuan Masuk
              </button>
            </div>

            {activeTab === 'desc' ? (
              <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {event.description}
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-medium flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>Harap tunjukkan e-tiket dengan QR Code yang valid saat memasuki area gate panggung konser.</span>
                </div>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>E-tiket yang sah hanya berlaku untuk 1 orang per barcode pemindaian.</li>
                  <li>Pengunjung wajib membawa kartu identitas (KTP/SIM/Paspor) yang sesuai dengan nama akun pemesan.</li>
                  <li>Dilarang membawa senjata tajam, minuman keras, zat terlarang, dan kamera profesional (DSLR) tanpa izin promotor.</li>
                  <li>Tiket yang telah dibeli tidak dapat ditukar atau diuangkan kembali kecuali konser dibatalkan oleh promotor.</li>
                </ul>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Sticky Ticket Booking Box (4 Cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 bg-white rounded-3xl p-6 border border-slate-200 shadow-floating space-y-5">
            
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Pilihan Kategori</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">Pilih Kategori Tiket</h3>
            </div>

            {/* Ticket Tier List */}
            {event.ticketTiers && event.ticketTiers.length > 0 ? (
              <div className="space-y-2.5">
                {event.ticketTiers.map((tier) => {
                  const isSelected = selectedTier?.id === tier.id;
                  const remaining = tier.quota - (tier.soldQuota || 0);
                  const isSoldOut = remaining <= 0;

                  return (
                    <div
                      key={tier.id}
                      onClick={() => !isSoldOut && setSelectedTier(tier)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-traveloka-blue bg-traveloka-sky/30 shadow-sm'
                          : isSoldOut
                          ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900 uppercase">{tier.name}</p>
                          <p className="text-sm font-extrabold text-traveloka-orange mt-0.5">{formatIDR(tier.price)}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            isSoldOut
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {isSoldOut ? 'HABIS' : `SISA ${remaining}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 uppercase">Tiket Standar</p>
                    <p className="text-sm font-extrabold text-traveloka-orange mt-0.5">{formatIDR(event.price)}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                    Sisa {event.quota}
                  </span>
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Jumlah Tiket</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="font-bold text-xs text-slate-900 w-8 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(5, Math.min(currentAvailableQuota, quantity + 1)))}
                    className="w-8 h-8 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 text-right font-medium">Maks. 5 tiket per transaksi</p>
            </div>

            {/* Total Price & Checkout button */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Harga</span>
                <span className="text-xl font-black text-traveloka-orange tracking-tight">
                  {formatIDR(currentPrice * quantity)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={currentAvailableQuota <= 0}
                className="w-full traveloka-btn-orange py-3.5 text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Ticket className="w-4 h-4" />
                <span>{currentAvailableQuota <= 0 ? 'Tiket Telah Habis' : 'Pesan Tiket Sekarang'}</span>
              </button>
            </div>

            {/* Security Note */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Garansi 100% Pembayaran Aman</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
