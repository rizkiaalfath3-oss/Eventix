'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  QrCode, 
  Download, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  ChevronRight,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';
import api from '@/lib/axios';
import { Registration } from '@/types';
import { formatIDR, formatDate, getImageUrl } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function MyTicketsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<Registration[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchMyTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Registration[]>('/registrations/my-tickets');
      setTickets(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch tickets:', err);
      setError(err.response?.data?.message || 'Gagal memuat daftar tiket Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && user.role === 'USER') {
      fetchMyTickets();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadPdf = async (ticketId: string, ticketCode: string) => {
    setDownloadingId(ticketId);
    try {
      const response = await api.get(`/registrations/${ticketId}/ticket-pdf`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `EVENTIX-TICKET-${ticketCode}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('PDF download error:', err);
      alert('Gagal mengunduh tiket PDF. Pastikan tiket Anda telah diverifikasi oleh organizer.');
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi • Siap Digunakan
          </span>
        );
      case 'PAYMENT_SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" /> Menunggu Verifikasi
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" /> Pembayaran Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-traveloka-blue" />
        <p className="text-xs font-bold text-slate-500">Memuat tiket konser Anda...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white rounded-3xl max-w-md mx-auto p-8 sm:p-10 space-y-4 border border-slate-200 shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-traveloka-sky text-traveloka-blue mx-auto flex items-center justify-center">
            <Ticket className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Akses Tiket Konser Saya</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Silakan masuk dengan akun Anda untuk melihat seluruh tiket konser yang telah Anda beli.
          </p>
          <Link
            href="/auth/login?redirect=/my-tickets"
            className="traveloka-btn-orange text-xs py-3 px-6 inline-flex items-center gap-2"
          >
            <span>Masuk Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (user.role === 'ORGANIZER') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white rounded-3xl max-w-md mx-auto p-8 sm:p-10 space-y-4 border border-slate-200 shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Akun Mitra Organizer</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Anda sedang login sebagai Mitra Penyelenggara Acara. Silakan buka Dashboard Organizer untuk mengelola konser dan pembayaran tiket.
          </p>
          <Link
            href="/dashboard/organizer"
            className="traveloka-btn-blue text-xs py-3 px-6 inline-flex items-center gap-2"
          >
            <span>Buka Dashboard Organizer</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (user.role === 'ADMIN') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white rounded-3xl max-w-md mx-auto p-8 sm:p-10 space-y-4 border border-slate-200 shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Portal Administrator</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Anda sedang login sebagai Super Administrator. Silakan buka Admin Portal untuk mengelola seluruh data platform Eventix.
          </p>
          <Link
            href="/dashboard/admin"
            className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-xs py-3 px-6 inline-flex items-center gap-2 shadow-md transition-colors"
          >
            <span>Buka Admin Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* 1. Header & Status Tabs */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Daftar Tiket & Pesanan Saya</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola e-voucher tiket konser musik dan unduh PDF resmi untuk masuk ke venue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMyTickets}
            className="traveloka-btn-outline text-xs py-2 px-4"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            <span>Perbarui Data</span>
          </button>
        </div>
      </div>

      {/* Filter Status Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            filterStatus === 'ALL'
              ? 'bg-traveloka-blue text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Semua Tiket ({tickets.length})
        </button>

        <button
          onClick={() => setFilterStatus('VERIFIED')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            filterStatus === 'VERIFIED'
              ? 'bg-traveloka-blue text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Terverifikasi ({tickets.filter(t => t.status === 'VERIFIED').length})
        </button>

        <button
          onClick={() => setFilterStatus('PAYMENT_SUBMITTED')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            filterStatus === 'PAYMENT_SUBMITTED'
              ? 'bg-traveloka-blue text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Menunggu Verifikasi ({tickets.filter(t => t.status === 'PAYMENT_SUBMITTED').length})
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <span className="text-xs font-bold text-rose-800">{error}</span>
        </div>
      )}

      {/* 2. Tickets Grid (Traveloka E-Voucher Pass Cards) */}
      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTickets.map((reg) => {
            const event = reg.event;
            const bannerSrc = getImageUrl(event?.bannerUrl);
            const isVerified = reg.status === 'VERIFIED';
            const displayPrice = (reg.totalPrice && reg.totalPrice > 0)
              ? reg.totalPrice
              : (reg.ticketTier?.price && reg.ticketTier.price > 0)
                ? reg.ticketTier.price * (reg.quantity || 1)
                : (event?.price && event.price > 0)
                  ? event.price * (reg.quantity || 1)
                  : 0;

            return (
              <div
                key={reg.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover transition-all p-6 flex flex-col justify-between space-y-5"
              >
                {/* Top Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        {reg.ticketCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(reg.ticketCode)}
                        className="text-slate-400 hover:text-traveloka-blue"
                        title="Salin Kode"
                      >
                        {copiedCode === reg.ticketCode ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {getStatusBadge(reg.status)}
                  </div>

                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                      <Image
                        src={bannerSrc}
                        alt={event?.title || 'Event'}
                        fill
                        className="object-cover"
                        unoptimized={bannerSrc.startsWith('http')}
                      />
                    </div>
                    
                    <div className="space-y-1 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                        {event?.title || 'Konser Musik'}
                      </h3>
                      <p className="text-xs font-semibold text-traveloka-blue">
                        {reg.ticketTier?.name || 'Tiket Standar'} • {reg.quantity} Tiket
                      </p>
                      {event && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {reg.rejectionReason && (
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800">
                      <strong>Catatan Penolakan:</strong> {reg.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Total Biaya</span>
                    <span className="text-sm font-extrabold text-traveloka-orange">{formatIDR(displayPrice)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedTicket(reg)}
                      className="traveloka-btn-outline text-xs py-1.5 px-3.5"
                    >
                      <QrCode className="w-3.5 h-3.5 mr-1" />
                      <span>QR Code Pass</span>
                    </button>

                    <button
                      onClick={() => handleDownloadPdf(reg.id, reg.ticketCode)}
                      disabled={!isVerified || downloadingId === reg.id}
                      title={!isVerified ? 'Tersedia setelah diverifikasi oleh promotor' : 'Unduh Tiket PDF'}
                      className="traveloka-btn-orange text-xs py-1.5 px-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {downloadingId === reg.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      ) : (
                        <Download className="w-3.5 h-3.5 mr-1" />
                      )}
                      <span>Unduh PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-traveloka-sky text-traveloka-blue mx-auto flex items-center justify-center">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Belum Ada Tiket yang Dipesan</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Anda belum memiliki tiket konser aktif. Jelajahi panggung konser seru dan amankan tiketmu sekarang!
          </p>
          <Link
            href="/"
            className="traveloka-btn-orange text-xs py-2.5 px-6 inline-block font-bold"
          >
            Jelajahi Konser Sekarang
          </Link>
        </div>
      )}

      {/* 3. QR Code Pass Modal (Traveloka Boarding Pass Style) */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-floating border border-slate-200 overflow-hidden space-y-5 p-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-traveloka-blue" />
                <h3 className="text-sm font-bold text-slate-900">E-TICKET BOARDING PASS</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="text-center space-y-4">
              {/* QR Code Container */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
                {selectedTicket.qrCodeUrl ? (
                  <div className="relative w-44 h-44 mx-auto">
                    <Image
                      src={getImageUrl(selectedTicket.qrCodeUrl)}
                      alt="QR Code"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-44 h-44 flex flex-col items-center justify-center text-slate-800 space-y-2">
                    <QrCode className="w-20 h-20 text-slate-800" />
                    <span className="font-mono text-xs font-bold">{selectedTicket.ticketCode}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <span className="font-mono text-base font-extrabold text-slate-900 block">{selectedTicket.ticketCode}</span>
                <p className="text-xs font-bold text-slate-800">{selectedTicket.event?.title}</p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {selectedTicket.ticketTier?.name || 'Tiket Reguler'} • {selectedTicket.quantity} Tiket
                </p>
              </div>

              <div className="p-3 bg-traveloka-sky/40 rounded-xl border border-traveloka-sky text-[11px] text-slate-600 font-medium leading-relaxed">
                Tunjukkan QR Code ini kepada petugas gate konser saat masuk untuk verifikasi cepat.
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-full traveloka-btn-blue text-xs py-2.5"
              >
                Tutup Pass
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
