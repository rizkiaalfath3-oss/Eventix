'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CreditCard, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Copy, 
  Check, 
  Loader2, 
  ShieldCheck, 
  Ticket, 
  Calendar, 
  MapPin,
  Building2,
  Wallet
} from 'lucide-react';
import api from '@/lib/axios';
import { Event, PaymentMethod, TicketTier, Registration } from '@/types';
import { formatIDR, formatDateShort, getImageUrl } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const eventId = searchParams.get('eventId');
  const tierId = searchParams.get('tierId');
  const quantity = parseInt(searchParams.get('quantity') || '1', 10);

  const [event, setEvent] = useState<Event | null>(null);
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<Registration | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push(`/auth/login?redirect=/checkout?eventId=${eventId}`);
      return;
    }

    if (!eventId) {
      router.push('/');
      return;
    }

    const loadCheckoutData = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        // 1. Fetch Event
        const eventRes = await api.get<Event>(`/events/${eventId}`);
        const eventData = eventRes.data;
        setEvent(eventData);

        if (tierId && eventData.ticketTiers) {
          const tier = eventData.ticketTiers.find((t) => t.id === tierId);
          if (tier) setSelectedTier(tier);
        }

        // 2. Fetch Organizer Payment Methods
        if (eventData.organizerId) {
          try {
            const pmRes = await api.get<PaymentMethod[]>(`/payment-methods/organizer/${eventData.organizerId}`);
            const methods = (pmRes.data || []).filter((m) => m.isActive);
            setPaymentMethods(methods);
            if (methods.length > 0) {
              setSelectedMethodId(methods[0].id);
            }
          } catch (pmErr) {
            console.warn('Failed to load organizer payment methods:', pmErr);
          }
        }
      } catch (err: any) {
        console.error('Failed to load checkout details:', err);
        setErrorMessage(err.response?.data?.message || 'Gagal memuat detail tiket.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCheckoutData();
  }, [eventId, tierId, user, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Ukuran file bukti pembayaran maksimal 5MB.');
        return;
      }
      setProofFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleCopyAccount = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;

    if (!proofFile) {
      setErrorMessage('Silakan unggah foto/screenshot bukti transfer terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('eventId', eventId);
      if (tierId) {
        formData.append('ticketTierId', tierId);
      }
      formData.append('quantity', String(quantity));
      if (selectedMethodId) {
        formData.append('paymentMethodId', selectedMethodId);
      }
      formData.append('paymentProof', proofFile);

      const response = await api.post<Registration>('/registrations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessOrder(response.data);
    } catch (err: any) {
      console.error('Order submission error:', err);
      const msg = err.response?.data?.message || 'Gagal mengirim pesanan. Silakan coba kembali.';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm text-gray-400">Menyiapkan halaman pembayaran...</p>
      </div>
    );
  }

  if (successOrder) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-8">
        <div className="p-8 rounded-3xl glass-card border border-emerald-500/40 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-400/40 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
              Pesanan Berhasil Dikirim
            </span>
            <h2 className="text-2xl font-extrabold text-white">Terima Kasih Atas Pemesananmu!</h2>
            <p className="text-xs text-gray-400">
              Bukti pembayaran telah kami terima. Organizer akan memverifikasi pembayaran Anda segera.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-input border border-surface-border text-left space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Kode Tiket</span>
              <span className="font-mono font-bold text-indigo-400 text-sm">{successOrder.ticketCode}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-surface-border/60 pt-2">
              <span className="text-gray-400">Konser</span>
              <span className="font-semibold text-white truncate max-w-[200px]">{event?.title}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-surface-border/60 pt-2">
              <span className="text-gray-400">Status Pembayaran</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/40">
                {successOrder.status}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-surface-border/60 pt-2">
              <span className="text-gray-400">Total Biaya</span>
              <span className="font-bold text-white text-sm">{formatIDR(successOrder.totalPrice)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              href="/my-tickets"
              className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-glow"
            >
              <Ticket className="w-4 h-4" />
              Lihat Tiket Saya
            </Link>
            <Link
              href="/"
              className="py-3 px-4 rounded-xl bg-surface-card hover:bg-surface-hover border border-surface-border text-gray-300 text-xs font-semibold flex items-center justify-center gap-2"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-gray-400">Data konser tidak ditemukan.</p>
        <Link href="/" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs">Kembali</Link>
      </div>
    );
  }

  const unitPrice = selectedTier ? selectedTier.price : event.price;
  const totalPrice = unitPrice * quantity;

  return (
    <div className="space-y-8 py-4">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-surface-card border border-surface-border text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Konfirmasi & Pembayaran</h1>
          <p className="text-xs text-gray-400">Selesaikan pembayaran untuk mengamankan tiket konsermu</p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/50 flex items-start gap-3 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Payment Methods & Upload Proof (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Pilih Rekening Transfer */}
          <div className="p-6 rounded-3xl glass-card border border-surface-border space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">1. Pilih Rekening / E-Wallet Tujuan Transfer</h3>
            </div>
            <p className="text-xs text-gray-400">
              Transfer total nominal ke salah satu rekening resmi penyelenggara konser di bawah ini:
            </p>

            {paymentMethods.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {paymentMethods.map((pm, idx) => {
                  const isSelected = selectedMethodId === pm.id;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => setSelectedMethodId(pm.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 shadow-glow'
                          : 'bg-surface-input border-surface-border hover:border-indigo-500/40'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-white uppercase">{pm.bankName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-surface-card border border-surface-border text-gray-400">
                          {pm.type}
                        </span>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between bg-black/40 p-2.5 rounded-xl">
                        <span className="font-mono text-sm font-bold text-indigo-300 tracking-wider">
                          {pm.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyAccount(pm.accountNumber, idx);
                          }}
                          className="p-1 rounded text-gray-400 hover:text-white"
                          title="Salin Nomor"
                        >
                          {copiedIndex === idx ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      <p className="text-[11px] text-gray-400 mt-2">
                        a/n <strong className="text-gray-200">{pm.accountHolderName}</strong>
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300">
                Organizer belum mendaftarkan rekening bank secara spesifik. Kamu tetap dapat melanjutkan checkout dan mengunggah bukti transfer.
              </div>
            )}
          </div>

          {/* 2. Upload Bukti Pembayaran */}
          <div className="p-6 rounded-3xl glass-card border border-surface-border space-y-4">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">2. Unggah Bukti Pembayaran (Wajib)</h3>
            </div>
            <p className="text-xs text-gray-400">
              Format: JPG, PNG, atau WEBP. Ukuran maksimal 5MB. Pastikan nominal dan nama pengirim terbaca jelas.
            </p>

            <div className="pt-2">
              <label
                htmlFor="proof-upload"
                className="border-2 border-dashed border-surface-border hover:border-indigo-500/60 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer bg-surface-input/50 transition-all group"
              >
                <input
                  id="proof-upload"
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="space-y-4 text-center">
                    <div className="relative w-48 h-48 mx-auto rounded-2xl overflow-hidden border border-indigo-500/40 shadow-lg">
                      <Image
                        src={previewUrl}
                        alt="Preview Bukti Pembayaran"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Bukti dipilih: {proofFile?.name}
                    </p>
                    <span className="text-[10px] text-gray-400 block underline">Klik untuk mengganti gambar</span>
                  </div>
                ) : (
                  <div className="space-y-3 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Klik untuk memilih file bukti transfer</p>
                      <p className="text-[10px] text-gray-500 mt-1">Mendukung file JPG, PNG, WEBP (Maks 5MB)</p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary (1 col) */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-card border border-surface-border shadow-2xl space-y-6 sticky top-28">
            
            <h3 className="text-base font-bold text-white border-b border-surface-border pb-3">Ringkasan Pesanan</h3>

            {/* Event Summary Card */}
            <div className="space-y-3">
              <h4 className="text-sm font-extrabold text-white line-clamp-1">{event.title}</h4>
              
              <div className="space-y-1.5 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{formatDateShort(event.startDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-pink-400" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
            </div>

            {/* Ticket Tier & Quantity calculation */}
            <div className="p-4 rounded-2xl bg-surface-input border border-surface-border space-y-2 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Kategori:</span>
                <span className="font-bold text-white">{selectedTier ? selectedTier.name : 'Tiket Standar'}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Harga Satuan:</span>
                <span>{formatIDR(unitPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Jumlah:</span>
                <span className="font-bold">{quantity} Tiket</span>
              </div>
              <div className="border-t border-surface-border/60 pt-2 flex justify-between font-bold text-white text-sm">
                <span>Total Bayar:</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                  {formatIDR(totalPrice)}
                </span>
              </div>
            </div>

            {/* Submit Order button */}
            <button
              type="submit"
              disabled={isSubmitting || !proofFile}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-glow text-white text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim Bukti...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Kirim & Konfirmasi Pembayaran</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-gray-500 text-center leading-relaxed">
              Dengan mengklik tombol di atas, Anda menyatakan bahwa bukti transfer yang diunggah adalah sah dan benar.
            </p>

          </div>
        </div>

      </form>

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm text-gray-400">Menyiapkan halaman pembayaran...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
