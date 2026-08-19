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
  ExternalLink
} from 'lucide-react';
import api from '@/lib/axios';
import { Registration } from '@/types';
import { formatIDR, formatDate, getImageUrl } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function MyTicketsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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
    if (!authLoading && user) {
      fetchMyTickets();
    } else if (!authLoading && !user) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

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
      link.setAttribute('download', `Eventix-Ticket-${ticketCode}.pdf`);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-glow">
            <CheckCircle2 className="w-3.5 h-3.5" /> Tiket Terverifikasi
          </span>
        );
      case 'PAYMENT_SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-400 border border-amber-800/60">
            <Clock className="w-3.5 h-3.5" /> Menunggu Verifikasi
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-950/80 text-red-400 border border-red-800/60">
            <XCircle className="w-3.5 h-3.5" /> Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-900 text-gray-300 border border-gray-700">
            <Clock className="w-3.5 h-3.5" /> {status}
          </span>
        );
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm text-gray-400">Memuat tiket Anda...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-800/40 mx-auto flex items-center justify-center text-indigo-400">
          <Ticket className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Akses Tiket Saya</h2>
          <p className="text-xs text-gray-400">Silakan masuk dengan akun Anda untuk melihat seluruh tiket konser yang telah Anda beli.</p>
        </div>
        <Link
          href="/auth/login?redirect=/my-tickets"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow"
        >
          Masuk Sekarang <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Ticket className="w-7 h-7 text-indigo-400" />
            Tiket Konser Saya
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Kelola dan unduh tiket konser musik yang telah Anda pesan.
          </p>
        </div>

        <button
          onClick={fetchMyTickets}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-card border border-surface-border hover:bg-surface-hover text-xs font-medium text-gray-300"
        >
          <RefreshCw className="w-4 h-4 text-indigo-400" />
          Perbarui
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/50 flex items-start gap-3 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tickets List */}
      {tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((reg) => {
            const event = reg.event;
            const bannerSrc = getImageUrl(event?.bannerUrl);
            const isVerified = reg.status === 'VERIFIED';

            return (
              <div
                key={reg.id}
                className="p-6 rounded-3xl glass-card border border-surface-border hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-6"
              >
                {/* Top Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-800/50">
                      {reg.ticketCode}
                    </span>
                    {getStatusBadge(reg.status)}
                  </div>

                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-surface-card flex-shrink-0 border border-surface-border">
                      <Image
                        src={bannerSrc}
                        alt={event?.title || 'Event'}
                        fill
                        className="object-cover"
                        unoptimized={bannerSrc.startsWith('http')}
                      />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h3 className="text-base font-bold text-white line-clamp-2">
                        {event?.title || 'Konser Musik'}
                      </h3>
                      <p className="text-xs text-purple-300 font-semibold">
                        {reg.ticketTier?.name || 'Tiket Standar'} • {reg.quantity} Tiket
                      </p>
                      {event && (
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rejection notice if any */}
                  {reg.rejectionReason && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-[11px] text-red-300">
                      <strong>Alasan Penolakan:</strong> {reg.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Bottom Action Section */}
                <div className="pt-4 border-t border-surface-border/60 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-gray-500 block">Total Transaksi</span>
                    <span className="text-sm font-extrabold text-white">{formatIDR(reg.totalPrice)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Details / QR Code */}
                    <button
                      onClick={() => setSelectedTicket(reg)}
                      className="px-3.5 py-2 rounded-xl bg-surface-input border border-surface-border hover:border-indigo-500/40 text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      <QrCode className="w-4 h-4 text-indigo-400" />
                      Lihat QR
                    </button>

                    {/* Download PDF Button */}
                    <button
                      onClick={() => handleDownloadPdf(reg.id, reg.ticketCode)}
                      disabled={!isVerified || downloadingId === reg.id}
                      title={!isVerified ? 'Tersedia setelah pembayaran diverifikasi' : 'Unduh Tiket PDF'}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-glow"
                    >
                      {downloadingId === reg.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
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
        <div className="p-16 rounded-3xl bg-surface-card border border-surface-border text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-800/30 mx-auto flex items-center justify-center">
            <Ticket className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Belum Ada Tiket yang Dipesan</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Kamu belum melakukan pembelian tiket konser. Jelajahi konser menarik dan amankan tiketmu sekarang!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow"
          >
            Jelajahi Konser Sekarang
          </Link>
        </div>
      )}

      {/* QR Code & Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 rounded-3xl glass-card border border-indigo-500/40 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">E-Ticket QR Code</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-surface-input"
              >
                ✕
              </button>
            </div>

            <div className="text-center space-y-4">
              <div className="p-6 bg-white rounded-2xl inline-block shadow-xl">
                {selectedTicket.qrCodeUrl ? (
                  <div className="relative w-44 h-44">
                    <Image
                      src={getImageUrl(selectedTicket.qrCodeUrl)}
                      alt="QR Code"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-44 h-44 flex flex-col items-center justify-center text-gray-800 space-y-2">
                    <QrCode className="w-20 h-20 text-gray-900" />
                    <span className="font-mono text-xs font-black">{selectedTicket.ticketCode}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <span className="font-mono text-base font-extrabold text-indigo-400">{selectedTicket.ticketCode}</span>
                <p className="text-xs text-gray-300 font-bold">{selectedTicket.event?.title}</p>
                <p className="text-[11px] text-gray-400">
                  {selectedTicket.ticketTier?.name || 'Tiket Reguler'} • {selectedTicket.quantity} Tiket
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-input border border-surface-border text-xs text-gray-400">
                Tunjukkan QR Code ini di pintu masuk gate konser untuk dipindai oleh panitia.
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-full py-3 rounded-xl bg-surface-input hover:bg-surface-hover border border-surface-border text-white text-xs font-semibold"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
