'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Ticket, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  UploadCloud, 
  CreditCard, 
  Building2, 
  AlertCircle, 
  Loader2, 
  Eye, 
  Trash2, 
  RefreshCw, 
  Clock,
  ExternalLink,
  ShieldAlert,
  Users
} from 'lucide-react';
import api from '@/lib/axios';
import { 
  Event, 
  Registration, 
  PaymentMethod, 
  OrganizerStatsResponseDto,
  CreatePaymentMethodDto,
  PaymentMethodType
} from '@/types';
import { formatIDR, formatDate, formatDateShort, getImageUrl } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function OrganizerDashboardPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'stats' | 'payments' | 'events' | 'create-event' | 'payment-methods'>('stats');

  // Stats state
  const [stats, setStats] = useState<OrganizerStatsResponseDto | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Events state
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Payments state
  const [payments, setPayments] = useState<Registration[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [inspectingPayment, setInspectingPayment] = useState<Registration | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Payment Methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [pmLoading, setPmLoading] = useState(true);
  const [newPm, setNewPm] = useState<CreatePaymentMethodDto>({
    type: 'BANK',
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    isActive: true,
  });
  const [isSubmittingPm, setIsSubmittingPm] = useState(false);

  // Create Event Form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    price: 100000,
    quota: 200,
    status: 'PUBLISHED',
  });
  const [ticketTiersInput, setTicketTiersInput] = useState<{ name: string; price: number; quota: number }[]>([
    { name: 'Reguler', price: 100000, quota: 150 },
    { name: 'VIP', price: 250000, quota: 50 },
  ]);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Load all organizer data
  const loadOrganizerData = async () => {
    try {
      // 1. Stats
      setStatsLoading(true);
      api.get<OrganizerStatsResponseDto>('/dashboard/organizer')
        .then((res) => setStats(res.data))
        .catch((err) => console.warn('Organizer stats error:', err))
        .finally(() => setStatsLoading(false));

      // 2. Events
      setEventsLoading(true);
      api.get<Event[]>('/events/my-events')
        .then((res) => setMyEvents(res.data || []))
        .catch((err) => console.warn('My events error:', err))
        .finally(() => setEventsLoading(false));

      // 3. Payments
      setPaymentsLoading(true);
      api.get<Registration[]>('/registrations/organizer/payments')
        .then((res) => setPayments(res.data || []))
        .catch((err) => console.warn('Organizer payments error:', err))
        .finally(() => setPaymentsLoading(false));

      // 4. Payment methods
      setPmLoading(true);
      api.get<PaymentMethod[]>('/payment-methods/my-methods')
        .then((res) => setPaymentMethods(res.data || []))
        .catch((err) => console.warn('My payment methods error:', err))
        .finally(() => setPmLoading(false));
    } catch (err) {
      console.error('Error fetching organizer data:', err);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
        router.push('/auth/login?redirect=/dashboard/organizer');
        return;
      }
      loadOrganizerData();
    }
  }, [user, authLoading, router]);

  // Payment Verification Handler: PATCH /registrations/{id}/verify-payment
  const handleVerifyPayment = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setVerifyingId(id);
    try {
      await api.patch(`/registrations/${id}/verify-payment`, {
        action,
        rejectionReason: action === 'REJECT' ? rejectionReason || 'Bukti transfer tidak valid atau belum masuk' : undefined,
      });

      // Update payments in local state
      setPayments((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: action === 'APPROVE' ? 'VERIFIED' : 'REJECTED', rejectionReason: action === 'REJECT' ? rejectionReason : null }
            : p
        )
      );

      setInspectingPayment(null);
      setRejectionReason('');
      
      // Refresh stats
      api.get<OrganizerStatsResponseDto>('/dashboard/organizer').then((res) => setStats(res.data));
    } catch (err: any) {
      console.error('Failed to verify payment:', err);
      alert(err.response?.data?.message || 'Gagal memverifikasi status pembayaran.');
    } finally {
      setVerifyingId(null);
    }
  };

  // Add/Remove dynamic ticket tiers
  const addTicketTierRow = () => {
    setTicketTiersInput([...ticketTiersInput, { name: '', price: 50000, quota: 50 }]);
  };

  const removeTicketTierRow = (index: number) => {
    setTicketTiersInput(ticketTiersInput.filter((_, i) => i !== index));
  };

  const handleTierChange = (index: number, field: 'name' | 'price' | 'quota', value: any) => {
    const updated = [...ticketTiersInput];
    updated[index] = {
      ...updated[index],
      [field]: field === 'name' ? value : Number(value),
    };
    setTicketTiersInput(updated);
  };

  // Create Event Submit: POST /events with FormData & JSON.stringify(ticketTiers)
  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingEvent(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const formData = new FormData();
      formData.append('title', eventForm.title);
      formData.append('description', eventForm.description);
      formData.append('startDate', new Date(eventForm.startDate).toISOString());
      formData.append('endDate', new Date(eventForm.endDate).toISOString());
      formData.append('location', eventForm.location);
      formData.append('price', String(eventForm.price));
      formData.append('quota', String(eventForm.quota));
      formData.append('status', eventForm.status);

      // Convert ticket tiers to JSON string
      if (ticketTiersInput.length > 0 && ticketTiersInput.some(t => t.name.trim())) {
        const validTiers = ticketTiersInput.filter(t => t.name.trim());
        formData.append('ticketTiers', JSON.stringify(validTiers));
      }

      if (bannerFile) {
        formData.append('banner', bannerFile);
      }

      const response = await api.post<Event>('/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormSuccess(`Konser "${response.data.title}" berhasil dibuat!`);
      setMyEvents((prev) => [response.data, ...prev]);

      // Reset form
      setEventForm({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        price: 100000,
        quota: 200,
        status: 'PUBLISHED',
      });
      setBannerFile(null);
      setBannerPreview(null);

      // Switch to events tab after short delay
      setTimeout(() => {
        setActiveTab('events');
      }, 1200);
    } catch (err: any) {
      console.error('Create event error:', err);
      const msg = err.response?.data?.message || 'Gagal membuat konser. Pastikan semua data terisi dengan benar.';
      setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsCreatingEvent(false);
    }
  };

  // Delete event: DELETE /events/{id}
  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus konser ini?')) return;
    try {
      await api.delete(`/events/${id}`);
      setMyEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      console.error('Delete event error:', err);
      alert(err.response?.data?.message || 'Gagal menghapus konser.');
    }
  };

  // Create payment method: POST /payment-methods
  const handleCreatePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPm(true);
    try {
      const res = await api.post<PaymentMethod>('/payment-methods', newPm);
      setPaymentMethods((prev) => [res.data, ...prev]);
      setNewPm({
        type: 'BANK',
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
        isActive: true,
      });
    } catch (err: any) {
      console.error('Add payment method error:', err);
      alert(err.response?.data?.message || 'Gagal menambahkan metode pembayaran.');
    } finally {
      setIsSubmittingPm(false);
    }
  };

  // Delete payment method: DELETE /payment-methods/{id}
  const handleDeletePaymentMethod = async (id: string) => {
    if (!confirm('Hapus rekening/metode pembayaran ini?')) return;
    try {
      await api.delete(`/payment-methods/${id}`);
      setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id));
    } catch (err: any) {
      alert('Gagal menghapus metode pembayaran.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
        <p className="text-sm text-gray-400">Memuat dashboard...</p>
      </div>
    );
  }

  const pendingPayments = payments.filter((p) => p.status === 'PAYMENT_SUBMITTED');

  return (
    <div className="space-y-8 py-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
              Organizer Space
            </span>
            {user?.isVerified && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                ✓ Verified
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Dashboard Penyelenggara Konser
          </h1>
          <p className="text-xs text-gray-400">
            Kelola konser musik, pantau penjualan tiket, dan verifikasi bukti pembayaran pembeli.
          </p>
        </div>

        <button
          onClick={loadOrganizerData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-card hover:bg-surface-hover border border-surface-border text-xs font-medium text-gray-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-purple-400" />
          Perbarui Data
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-border overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'stats'
              ? 'bg-purple-600 text-white shadow-glow'
              : 'text-gray-400 hover:text-white hover:bg-surface-card'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Ringkasan Statistik
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'payments'
              ? 'bg-purple-600 text-white shadow-glow'
              : 'text-gray-400 hover:text-white hover:bg-surface-card'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Verifikasi Pembayaran
          {pendingPayments.length > 0 && (
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-500 text-white animate-pulse">
              {pendingPayments.length} Baru
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'events'
              ? 'bg-purple-600 text-white shadow-glow'
              : 'text-gray-400 hover:text-white hover:bg-surface-card'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Konser Saya ({myEvents.length})
        </button>

        <button
          onClick={() => setActiveTab('create-event')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'create-event'
              ? 'bg-purple-600 text-white shadow-glow'
              : 'text-gray-400 hover:text-white hover:bg-surface-card'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          Buat Konser Baru
        </button>

        <button
          onClick={() => setActiveTab('payment-methods')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'payment-methods'
              ? 'bg-purple-600 text-white shadow-glow'
              : 'text-gray-400 hover:text-white hover:bg-surface-card'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Rekening Pembayaran
        </button>
      </div>

      {/* TAB 1: SUMMARY STATS */}
      {activeTab === 'stats' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-3xl glass-card border border-surface-border flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-glow">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Total Konser</p>
                <p className="text-2xl font-black text-white mt-1">
                  {statsLoading ? '...' : stats?.totalEvents ?? myEvents.length}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl glass-card border border-surface-border flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-glow">
                <Ticket className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Tiket Terjual</p>
                <p className="text-2xl font-black text-white mt-1">
                  {statsLoading ? '...' : stats?.totalTicketsSold ?? 0}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl glass-card border border-surface-border flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-glow">
                <DollarSign className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Total Pendapatan</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  {statsLoading ? '...' : formatIDR(stats?.totalRevenue ?? 0)}
                </p>
              </div>
            </div>

          </div>

          {/* Quick Actions Card */}
          <div className="p-8 rounded-3xl glass-panel border border-surface-border flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Ingin Menyelenggarakan Konser Baru?</h3>
              <p className="text-xs text-gray-400 max-w-xl">
                Terbitkan konser musikmu, buat tier tiket VIP / Reguler, dan terima pembayaran tiket secara instan.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('create-event')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-glow text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Mulai Buat Konser
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT VERIFICATIONS (PATCH /registrations/{id}/verify-payment) */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Verifikasi Pembayaran Masuk</h2>
              <p className="text-xs text-gray-400">Periksa foto bukti transfer dari pembeli dan setujui / tolak pembayaran</p>
            </div>
          </div>

          {paymentsLoading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
              <p className="text-xs text-gray-400">Memuat data pembayaran...</p>
            </div>
          ) : payments.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface-card">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#0E1524] text-gray-400 uppercase font-semibold border-b border-surface-border">
                  <tr>
                    <th className="py-3.5 px-4">Kode Tiket</th>
                    <th className="py-3.5 px-4">Konser</th>
                    <th className="py-3.5 px-4">Pembeli</th>
                    <th className="py-3.5 px-4">Jumlah & Total</th>
                    <th className="py-3.5 px-4">Bukti Transfer</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Aksi Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/60">
                  {payments.map((p) => {
                    const isPending = p.status === 'PAYMENT_SUBMITTED';
                    return (
                      <tr key={p.id} className="hover:bg-surface-hover/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">{p.ticketCode}</td>
                        <td className="py-3.5 px-4 font-medium text-white max-w-[180px] truncate">
                          {p.event?.title || '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-white">{p.user?.name || 'User'}</p>
                          <p className="text-[10px] text-gray-400">{p.user?.email || '-'}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white">{formatIDR(p.totalPrice)}</p>
                          <p className="text-[10px] text-purple-300">{p.quantity} Tiket ({p.ticketTier?.name || 'Reguler'})</p>
                        </td>
                        <td className="py-3.5 px-4">
                          {p.paymentProofUrl ? (
                            <button
                              onClick={() => setInspectingPayment(p)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800/60 hover:bg-indigo-900 transition-colors text-[11px] font-semibold"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Lihat Foto
                            </button>
                          ) : (
                            <span className="text-gray-500 text-[11px]">Tanpa File</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'VERIFIED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : p.status === 'PAYMENT_SUBMITTED'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                              : p.status === 'REJECTED'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-gray-900 text-gray-400'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {isPending ? (
                              <>
                                <button
                                  onClick={() => handleVerifyPayment(p.id, 'APPROVE')}
                                  disabled={verifyingId === p.id}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-md transition-all active:scale-95"
                                >
                                  {verifyingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setInspectingPayment(p);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-red-950 text-red-400 border border-red-800 hover:bg-red-900 font-bold text-[11px] flex items-center gap-1 transition-all active:scale-95"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Tolak
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] text-gray-500 font-medium">Selesai</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 rounded-3xl bg-surface-card border border-surface-border text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-gray-500 mx-auto" />
              <p className="text-sm font-semibold text-white">Tidak ada riwayat pembayaran yang perlu diverifikasi.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Inspect Payment Proof Image & Action */}
      {inspectingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-6 rounded-3xl glass-card border border-purple-500/40 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Bukti Transfer #{inspectingPayment.ticketCode}</h3>
                <p className="text-xs text-gray-400">Total: {formatIDR(inspectingPayment.totalPrice)} • Pembeli: {inspectingPayment.user?.name}</p>
              </div>
              <button
                onClick={() => setInspectingPayment(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-surface-input"
              >
                ✕
              </button>
            </div>

            {/* Proof Image View */}
            <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-black border border-surface-border">
              {inspectingPayment.paymentProofUrl ? (
                <Image
                  src={getImageUrl(inspectingPayment.paymentProofUrl)}
                  alt="Bukti Transfer"
                  fill
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                  Tidak ada gambar bukti
                </div>
              )}
            </div>

            {/* Optional Rejection Reason */}
            {inspectingPayment.status === 'PAYMENT_SUBMITTED' && (
              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-semibold">Alasan Penolakan (Jika ditolak):</label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="mis. Bukti transfer buram / nominal tidak cocok"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-input border border-surface-border text-white text-xs outline-none focus:border-purple-500"
                />
              </div>
            )}

            {/* Action Buttons */}
            {inspectingPayment.status === 'PAYMENT_SUBMITTED' ? (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleVerifyPayment(inspectingPayment.id, 'APPROVE')}
                  disabled={verifyingId === inspectingPayment.id}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-glow"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Setujui Pembayaran (Approve)
                </button>
                <button
                  onClick={() => handleVerifyPayment(inspectingPayment.id, 'REJECT')}
                  disabled={verifyingId === inspectingPayment.id}
                  className="py-3 px-4 rounded-xl bg-red-900/60 hover:bg-red-800 text-red-300 border border-red-700 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Tolak Pembayaran (Reject)
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={() => setInspectingPayment(null)}
                  className="w-full py-2.5 rounded-xl bg-surface-input text-gray-300 hover:text-white text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB 3: MY EVENTS LIST */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Daftar Konser yang Anda Buat</h2>
              <p className="text-xs text-gray-400">Total {myEvents.length} konser musik terdaftar</p>
            </div>
            <button
              onClick={() => setActiveTab('create-event')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow"
            >
              <PlusCircle className="w-4 h-4" />
              Buat Konser
            </button>
          </div>

          {eventsLoading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
              <p className="text-xs text-gray-400">Memuat daftar konser...</p>
            </div>
          ) : myEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.map((ev) => {
                const bannerSrc = getImageUrl(ev.bannerUrl);
                return (
                  <div key={ev.id} className="p-5 rounded-3xl glass-card border border-surface-border flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-surface-card">
                        <Image
                          src={bannerSrc}
                          alt={ev.title}
                          fill
                          className="object-cover"
                          unoptimized={bannerSrc.startsWith('http')}
                        />
                        <div className="absolute top-2 right-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/90 text-purple-300 border border-purple-800/80">
                            {ev.status}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white line-clamp-1">{ev.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2">{ev.description}</p>
                      
                      <div className="text-[11px] text-gray-400 space-y-1">
                        <p>📍 {ev.location}</p>
                        <p>📅 {formatDateShort(ev.startDate)}</p>
                        <p>💰 Mulai {formatIDR(ev.price)}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between gap-2">
                      <Link
                        href={`/events/${ev.id}`}
                        className="px-3 py-1.5 rounded-lg bg-surface-input border border-surface-border hover:text-white text-[11px] font-semibold flex items-center gap-1 text-gray-300"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Halaman Publik
                      </Link>

                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="p-2 rounded-lg bg-red-950/40 border border-red-800/40 text-red-400 hover:bg-red-900/60 transition-colors"
                        title="Hapus Konser"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-16 rounded-3xl bg-surface-card border border-surface-border text-center space-y-4">
              <Calendar className="w-12 h-12 text-gray-500 mx-auto" />
              <h3 className="text-base font-bold text-white">Belum Ada Konser yang Diterbitkan</h3>
              <p className="text-xs text-gray-400">Buat konser pertamamu sekarang dan mulailah menjual tiket.</p>
              <button
                onClick={() => setActiveTab('create-event')}
                className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-glow"
              >
                Buat Konser Baru
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CREATE EVENT FORM (POST /events with multipart/form-data & ticketTiers JSON string) */}
      {activeTab === 'create-event' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">Buat Konser & Tiket Baru</h2>
            <p className="text-xs text-gray-400">Isi formulir lengkap di bawah ini untuk menerbitkan konser musik di platform Eventix.</p>
          </div>

          {formSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-800/60 flex items-center gap-3 text-emerald-300 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          {formError && (
            <div className="p-4 rounded-2xl bg-red-950/50 border border-red-800/60 flex items-center gap-3 text-red-300 text-xs">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateEventSubmit} className="p-8 rounded-3xl glass-card border border-surface-border space-y-6 shadow-2xl">
            
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">Judul / Nama Konser *</label>
              <input
                type="text"
                required
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="mis. Jakarta Rock Symphony 2026"
                className="w-full px-4 py-3 rounded-xl bg-surface-input border border-surface-border text-white text-sm outline-none focus:border-purple-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">Deskripsi Lengkap & Lineup Artis *</label>
              <textarea
                rows={4}
                required
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Jelaskan guest star, tata tertib, dan rundown acara..."
                className="w-full px-4 py-3 rounded-xl bg-surface-input border border-surface-border text-white text-sm outline-none focus:border-purple-500"
              />
            </div>

            {/* Dates & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Waktu Mulai *</label>
                <input
                  type="datetime-local"
                  required
                  value={eventForm.startDate}
                  onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-surface-input border border-surface-border text-white text-xs outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Waktu Selesai *</label>
                <input
                  type="datetime-local"
                  required
                  value={eventForm.endDate}
                  onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-surface-input border border-surface-border text-white text-xs outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">Lokasi / Venue Konser *</label>
              <input
                type="text"
                required
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                placeholder="mis. Gelora Bung Karno, Senayan, Jakarta"
                className="w-full px-4 py-3 rounded-xl bg-surface-input border border-surface-border text-white text-sm outline-none focus:border-purple-500"
              />
            </div>

            {/* Base Price & Quota */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Harga Dasar (Rp)</label>
                <input
                  type="number"
                  min={0}
                  value={eventForm.price}
                  onChange={(e) => setEventForm({ ...eventForm, price: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl bg-surface-input border border-surface-border text-white text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Total Kuota Penonton</label>
                <input
                  type="number"
                  min={1}
                  value={eventForm.quota}
                  onChange={(e) => setEventForm({ ...eventForm, quota: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl bg-surface-input border border-surface-border text-white text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Status Konser</label>
                <select
                  value={eventForm.status}
                  onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-surface-input border border-surface-border text-white text-xs outline-none focus:border-purple-500"
                >
                  <option value="PUBLISHED">PUBLISHED (Langsung Tayang)</option>
                  <option value="DRAFT">DRAFT (Simpan Draf)</option>
                </select>
              </div>
            </div>

            {/* Dynamic Ticket Tiers */}
            <div className="space-y-3 pt-3 border-t border-surface-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Kategori Tiket (Ticket Tiers)</h4>
                  <p className="text-[11px] text-gray-400">Contoh: VIP, Early Bird, Presale, Tribune</p>
                </div>
                <button
                  type="button"
                  onClick={addTicketTierRow}
                  className="px-3 py-1.5 rounded-lg bg-purple-950 text-purple-300 border border-purple-800 text-[11px] font-bold flex items-center gap-1 hover:bg-purple-900"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Tambah Kategori
                </button>
              </div>

              <div className="space-y-2">
                {ticketTiersInput.map((tier, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-surface-input p-3 rounded-xl border border-surface-border">
                    <input
                      type="text"
                      placeholder="Nama Tier (mis. VIP)"
                      value={tier.name}
                      onChange={(e) => handleTierChange(idx, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-[#0B0F19] border border-surface-border text-white text-xs outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Harga (Rp)"
                      value={tier.price}
                      onChange={(e) => handleTierChange(idx, 'price', e.target.value)}
                      className="w-32 px-3 py-2 rounded-lg bg-[#0B0F19] border border-surface-border text-white text-xs outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Kuota"
                      value={tier.quota}
                      onChange={(e) => handleTierChange(idx, 'quota', e.target.value)}
                      className="w-24 px-3 py-2 rounded-lg bg-[#0B0F19] border border-surface-border text-white text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeTicketTierRow(idx)}
                      className="p-2 text-red-400 hover:text-red-300"
                      title="Hapus"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Banner Image Upload */}
            <div className="space-y-2 pt-3 border-t border-surface-border">
              <label className="text-xs font-bold text-gray-300 block">Banner / Flyer Konser (JPG/PNG/WEBP, Maks 5MB)</label>
              
              <label
                htmlFor="banner-upload"
                className="border-2 border-dashed border-surface-border hover:border-purple-500/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-surface-input/50 transition-all"
              >
                <input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setBannerFile(file);
                      setBannerPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />

                {bannerPreview ? (
                  <div className="space-y-3 text-center">
                    <div className="relative w-64 h-36 mx-auto rounded-xl overflow-hidden border border-purple-500/40">
                      <Image src={bannerPreview} alt="Banner Preview" fill className="object-cover" />
                    </div>
                    <p className="text-xs text-emerald-400 font-semibold">Banner dipilih: {bannerFile?.name}</p>
                    <span className="text-[10px] text-gray-400 underline">Klik untuk ganti file</span>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <UploadCloud className="w-8 h-8 text-purple-400 mx-auto" />
                    <p className="text-xs font-bold text-white">Klik untuk memilih flyer / poster konser</p>
                    <p className="text-[10px] text-gray-500">Rekomendasi rasio 16:9</p>
                  </div>
                )}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isCreatingEvent}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:shadow-glow text-white text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isCreatingEvent ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengunggah & Menerbitkan Konser...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Terbitkan Konser Sekarang</span>
                </>
              )}
            </button>

          </form>
        </div>
      )}

      {/* TAB 5: PAYMENT METHODS SETTINGS */}
      {activeTab === 'payment-methods' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Registered Payment Methods List (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Rekening Bank & E-Wallet Penyelenggara</h2>
              <p className="text-xs text-gray-400">Rekening ini akan ditampilkan kepada pembeli tiket saat proses transfer pembayaran.</p>
            </div>

            {pmLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
              </div>
            ) : paymentMethods.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paymentMethods.map((pm) => (
                  <div key={pm.id} className="p-5 rounded-3xl glass-card border border-surface-border flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase">{pm.bankName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-800">
                          {pm.type}
                        </span>
                      </div>
                      <p className="font-mono text-base font-black text-indigo-300 tracking-wider">
                        {pm.accountNumber}
                      </p>
                      <p className="text-xs text-gray-400">a/n <strong className="text-white">{pm.accountHolderName}</strong></p>
                    </div>

                    <div className="pt-2 border-t border-surface-border/60 flex justify-end">
                      <button
                        onClick={() => handleDeletePaymentMethod(pm.id)}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 rounded-3xl bg-surface-card border border-surface-border text-center space-y-3">
                <CreditCard className="w-10 h-10 text-gray-500 mx-auto" />
                <p className="text-xs text-gray-400">Belum ada rekening/e-wallet yang didaftarkan.</p>
              </div>
            )}
          </div>

          {/* Right: Add Payment Method Form (1 col) */}
          <div className="space-y-4">
            <div className="p-6 rounded-3xl glass-card border border-surface-border space-y-4">
              <h3 className="text-sm font-bold text-white">Tambah Rekening Baru</h3>

              <form onSubmit={handleCreatePaymentMethod} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-300">Tipe</label>
                  <select
                    value={newPm.type}
                    onChange={(e) => setNewPm({ ...newPm, type: e.target.value as PaymentMethodType })}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-input border border-surface-border text-white text-xs outline-none focus:border-purple-500"
                  >
                    <option value="BANK">Transfer Bank</option>
                    <option value="EWALLET">E-Wallet (GoPay, OVO, Dana)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-300">Nama Bank / Provider</label>
                  <input
                    type="text"
                    required
                    value={newPm.bankName}
                    onChange={(e) => setNewPm({ ...newPm, bankName: e.target.value })}
                    placeholder="mis. BCA, Mandiri, GoPay"
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-input border border-surface-border text-white text-xs outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-300">Nomor Rekening / No. HP</label>
                  <input
                    type="text"
                    required
                    value={newPm.accountNumber}
                    onChange={(e) => setNewPm({ ...newPm, accountNumber: e.target.value })}
                    placeholder="1234567890"
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-input border border-surface-border text-white text-xs outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-300">Nama Pemilik Rekening</label>
                  <input
                    type="text"
                    required
                    value={newPm.accountHolderName}
                    onChange={(e) => setNewPm({ ...newPm, accountHolderName: e.target.value })}
                    placeholder="mis. PT Nada Promosindo"
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-input border border-surface-border text-white text-xs outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPm}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-glow transition-all"
                >
                  {isSubmittingPm ? 'Menyimpan...' : 'Simpan Rekening'}
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
