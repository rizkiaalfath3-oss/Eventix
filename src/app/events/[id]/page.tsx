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
  CreditCard
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
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm text-gray-400">Memuat detail konser...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-red-950/50 border border-red-800/40 mx-auto flex items-center justify-center text-red-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Konser Tidak Ditemukan</h2>
        <p className="text-xs text-gray-400">{error || 'Konser yang kamu cari tidak tersedia.'}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const currentPrice = selectedTier ? selectedTier.price : event.price;
  const currentAvailableQuota = selectedTier
    ? selectedTier.quota - (selectedTier.soldQuota || 0)
    : event.quota;

  const bannerSrc = getImageUrl(event.bannerUrl);

  return (
    <div className="space-y-8 py-4">
      
      {/* Back button & Action bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-card hover:bg-surface-hover border border-surface-border text-xs font-medium text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-card hover:bg-surface-hover border border-surface-border text-xs font-medium text-gray-300 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? 'Tautan Disalin!' : 'Bagikan'}</span>
        </button>
      </div>

      {/* Main Grid: Left details & Right sticky checkout box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Banner & Info (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Banner Image */}
          <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden glass-panel border border-surface-border">
            <Image
              src={bannerSrc}
              alt={event.title}
              fill
              priority
              className="object-cover object-center"
              unoptimized={bannerSrc.startsWith('http')}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />
            
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600/90 text-white backdrop-blur-md shadow-glow">
                {event.status}
              </span>
            </div>
          </div>

          {/* Title & Metadata */}
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {event.title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-surface-card border border-surface-border flex items-start gap-3">
                <Calendar className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase">Waktu Mulai</p>
                  <p className="text-xs font-bold text-white mt-0.5">{formatDate(event.startDate)}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Selesai: {formatDate(event.endDate)}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-card border border-surface-border flex items-start gap-3">
                <MapPin className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase">Lokasi Konser</p>
                  <p className="text-xs font-bold text-white mt-0.5">{event.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Organizer Card */}
          {event.organizer && (
            <div className="p-5 rounded-2xl glass-card border border-surface-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-glow">
                  {event.organizer.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Penyelenggara</span>
                    {event.organizer.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                        <ShieldCheck className="w-3 h-3" /> Official Organizer
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white">{event.organizer.organizationName || event.organizer.name}</h4>
                  {event.organizer.bio && (
                    <p className="text-[11px] text-gray-400 mt-0.5">{event.organizer.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Event Description */}
          <div className="space-y-3 p-6 rounded-3xl bg-surface-card border border-surface-border">
            <h3 className="text-base font-bold text-white">Deskripsi & Rundown Acara</h3>
            <div className="text-xs sm:text-sm text-gray-300 whitespace-pre-line leading-relaxed">
              {event.description}
            </div>
          </div>

        </div>

        {/* Right Column: Ticket Tier Selection & Buy (1 col) */}
        <div className="space-y-6">
          <div className="sticky top-28 p-6 rounded-3xl glass-card border border-indigo-500/30 shadow-2xl space-y-6">
            
            <div>
              <span className="text-xs text-gray-400 block font-medium">Pilihan Tiket</span>
              <h3 className="text-lg font-bold text-white mt-1">Pilih Kategori Tiket</h3>
            </div>

            {/* Ticket Tiers List */}
            {event.ticketTiers && event.ticketTiers.length > 0 ? (
              <div className="space-y-3">
                {event.ticketTiers.map((tier) => {
                  const isSelected = selectedTier?.id === tier.id;
                  const remaining = tier.quota - (tier.soldQuota || 0);
                  const isSoldOut = remaining <= 0;

                  return (
                    <div
                      key={tier.id}
                      onClick={() => !isSoldOut && setSelectedTier(tier)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 shadow-glow'
                          : isSoldOut
                          ? 'bg-surface-input/50 border-surface-border opacity-50 cursor-not-allowed'
                          : 'bg-surface-input border-surface-border hover:border-indigo-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-white">{tier.name}</p>
                          <p className="text-xs text-indigo-400 font-extrabold mt-0.5">{formatIDR(tier.price)}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isSoldOut
                              ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                              : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                          }`}>
                            {isSoldOut ? 'Habis' : `Sisa ${remaining}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-surface-input border border-surface-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">Tiket Standar</p>
                    <p className="text-xs text-indigo-400 font-extrabold mt-0.5">{formatIDR(event.price)}</p>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40">
                    Sisa {event.quota}
                  </span>
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2 pt-2 border-t border-surface-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300 font-medium">Jumlah Tiket</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-surface-input border border-surface-border text-white text-sm font-bold flex items-center justify-center hover:bg-surface-hover active:scale-95"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-white w-6 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(5, Math.min(currentAvailableQuota, quantity + 1)))}
                    className="w-8 h-8 rounded-lg bg-surface-input border border-surface-border text-white text-sm font-bold flex items-center justify-center hover:bg-surface-hover active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 text-right">Maksimal 5 tiket per transaksi</p>
            </div>

            {/* Total Price & Checkout button */}
            <div className="space-y-4 pt-4 border-t border-surface-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Total Pembayaran</span>
                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                  {formatIDR(currentPrice * quantity)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={currentAvailableQuota <= 0}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-glow text-white text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                <Ticket className="w-4 h-4" />
                <span>{currentAvailableQuota <= 0 ? 'Tiket Habis' : 'Beli Tiket Sekarang'}</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 pt-1">
              <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
              <span>Pembayaran via Transfer Bank & E-Wallet</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
