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
  Ticket, 
  Calendar, 
  MapPin,
  Building2,
  Lock,
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
  Phone,
  Mail
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
      setErrorMessage('Silakan unggah foto atau screenshot bukti transfer pembayaran.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const unitPrice = selectedTier ? selectedTier.price : (event ? event.price : 0);
      const calculatedTotal = unitPrice * quantity;

      const formData = new FormData();
      formData.append('eventId', eventId);
      if (tierId) {
        formData.append('ticketTierId', tierId);
      }
      formData.append('quantity', String(quantity));
      formData.append('totalPrice', String(calculatedTotal));
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
      const msg = err.response?.data?.message || 'Gagal mengirim pesanan. Silakan periksa file bukti transfer Anda.';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-traveloka-blue" />
        <p className="text-xs font-bold text-slate-500">Menyiapkan lembar pembayaran aman...</p>
      </div>
    );
  }

  // 1. Success Screen (Traveloka E-Receipt Style)
  if (successOrder) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div className="bg-white rounded-3xl p-8 sm:p-10 text-center space-y-6 border border-slate-200 shadow-floating">
          
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              Pembayaran Terkirim
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Pemesanan Berhasil Dikirim!
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Bukti transfer pembayaran Anda telah diterima. Penyelenggara akan segera memverifikasi pesanan Anda.
            </p>
          </div>

          {/* Receipt Summary Card */}
          <div className="bg-slate-50 rounded-2xl p-5 text-left space-y-3 border border-slate-200/80">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-500">Kode Pemesanan</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {successOrder.ticketCode}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-200/60 pt-2">
              <span className="font-semibold text-slate-500">Konser</span>
              <span className="font-bold text-slate-900 truncate max-w-[200px]">{event?.title}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-200/60 pt-2">
              <span className="font-semibold text-slate-500">Status</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                {successOrder.status}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-200/60 pt-2">
              <span className="font-semibold text-slate-500">Total Pembayaran</span>
              <span className="font-extrabold text-sm text-traveloka-orange">{formatIDR(successOrder.totalPrice)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              href="/my-tickets"
              className="traveloka-btn-blue text-xs py-3"
            >
              <Ticket className="w-4 h-4" />
              <span>Lihat Tiket Saya</span>
            </Link>
            <Link
              href="/"
              className="traveloka-btn-outline text-xs py-3"
            >
              <span>Ke Beranda</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-sm text-slate-500">Data konser tidak ditemukan.</p>
        <Link href="/" className="traveloka-btn-outline text-xs py-2 px-4">Kembali</Link>
      </div>
    );
  }

  const unitPrice = selectedTier ? selectedTier.price : event.price;
  const totalPrice = unitPrice * quantity;
  const bannerSrc = getImageUrl(event.bannerUrl);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* 1. Header & Step Bar (Traveloka Style) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Pembayaran & Konfirmasi Tiket</h1>
            <p className="text-xs text-slate-500">Lakukan pembayaran untuk mengamankan kuota tiket konsermu</p>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="w-6 h-6 rounded-full bg-traveloka-blue text-white flex items-center justify-center text-[11px]">1</span>
          <span className="text-traveloka-blue">Data & Pembayaran</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[11px]">2</span>
          <span className="text-slate-400">Verifikasi & E-Tiket</span>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <span className="text-xs font-bold text-rose-800">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Step 1: Data Pemesan */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-traveloka-blue text-white flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                DATA PEMESAN TIKET
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <UserIcon className="w-3 h-3" /> Nama Lengkap
                </span>
                <p className="font-bold text-slate-900 truncate">{user?.name}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </span>
                <p className="font-bold text-slate-900 truncate">{user?.email}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> No. Telepon
                </span>
                <p className="font-bold text-slate-900 truncate">{user?.phoneNumber || '-'}</p>
              </div>
            </div>
          </div>

          {/* Step 2: Rekening Transfer Penyelenggara */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-traveloka-blue text-white flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                PILIH REKENING TUJUAN TRANSFER PENYELENGGARA
              </h3>
            </div>
            
            <p className="text-xs text-slate-500">
              Transfer nominal sesuai total biaya ke rekening resmi penyelenggara konser di bawah ini:
            </p>

            {paymentMethods.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {paymentMethods.map((pm, idx) => {
                  const isSelected = selectedMethodId === pm.id;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => setSelectedMethodId(pm.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-traveloka-blue bg-traveloka-sky/30 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-900 uppercase">{pm.bankName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                          {pm.type}
                        </span>
                      </div>
                      
                      <div className="mt-2.5 flex items-center justify-between bg-white border border-slate-200 rounded-xl p-2.5">
                        <span className="font-mono text-sm font-extrabold text-slate-900 tracking-wider">
                          {pm.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyAccount(pm.accountNumber, idx);
                          }}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-traveloka-blue transition-colors"
                          title="Salin Nomor Rekening"
                        >
                          {copiedIndex === idx ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-2">
                        A/n: <strong className="text-slate-800 uppercase font-bold">{pm.accountHolderName}</strong>
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                Penyelenggara belum mendaftarkan rekening spesifik di sistem. Anda dapat melanjutkan checkout dan mengunggah bukti pembayaran Anda.
              </div>
            )}
          </div>

          {/* Step 3: Upload Bukti Pembayaran */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-traveloka-blue text-white flex items-center justify-center font-bold text-xs">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                UNGGAH BUKTI TRANSFER PEMBAYARAN (WAJIB)
              </h3>
            </div>
            
            <p className="text-xs text-slate-500">
              Format file: JPG, PNG, atau WEBP (maksimal 5MB). Pastikan tanggal, jam, dan nominal terlihat jelas.
            </p>

            <div className="pt-1">
              <label
                htmlFor="proof-upload"
                className="border-2 border-dashed border-slate-300 hover:border-traveloka-blue rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-traveloka-sky/20 transition-all"
              >
                <input
                  id="proof-upload"
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="space-y-3 text-center">
                    <div className="relative w-40 h-40 mx-auto rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      <Image
                        src={previewUrl}
                        alt="Preview Bukti Transfer"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {proofFile?.name}
                    </p>
                    <span className="text-xs text-traveloka-blue underline block">Klik untuk mengganti gambar</span>
                  </div>
                ) : (
                  <div className="space-y-2 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-traveloka-sky text-traveloka-blue flex items-center justify-center mx-auto">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Klik atau seret file bukti transfer ke sini</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Format JPG, PNG, WEBP (Maksimal 5MB)</p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary (4 cols, Sticky) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-floating space-y-5 sticky top-28">
            
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Ringkasan Pesanan
            </h3>

            {/* Mini Event Preview */}
            <div className="flex gap-3">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                <Image
                  src={bannerSrc}
                  alt={event.title}
                  fill
                  className="object-cover"
                  unoptimized={bannerSrc.startsWith('http')}
                />
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">{event.title}</h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Calendar className="w-3 h-3 text-traveloka-blue" />
                  <span>{formatDateShort(event.startDate)}</span>
                </div>
              </div>
            </div>

            {/* Calculations */}
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs border border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Kategori:</span>
                <span className="font-bold text-slate-900 uppercase">{selectedTier ? selectedTier.name : 'Tiket Standar'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Harga Satuan:</span>
                <span className="font-semibold text-slate-800">{formatIDR(unitPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Jumlah Tiket:</span>
                <span className="font-semibold text-slate-800">{quantity} Tiket</span>
              </div>
              <div className="border-t border-slate-200/80 pt-2 flex justify-between font-extrabold text-slate-900 text-sm">
                <span>Total Pembayaran:</span>
                <span className="text-base text-traveloka-orange">{formatIDR(totalPrice)}</span>
              </div>
            </div>

            {/* Submit Order button */}
            <button
              type="submit"
              disabled={isSubmitting || !proofFile}
              className="w-full traveloka-btn-orange py-3.5 text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim Bukti Pembayaran...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Kirim & Bayar Sekarang</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Transaksi Aman & Terenkripsi</span>
            </div>

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
        <Loader2 className="w-10 h-10 animate-spin text-traveloka-blue" />
        <p className="text-xs font-bold text-slate-500">Menyiapkan lembar pembayaran aman...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
