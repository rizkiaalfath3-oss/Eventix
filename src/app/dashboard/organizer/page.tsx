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
  Users,
  Sparkles,
  ChevronRight
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
import { formatIDR, formatDateShort, getImageUrl } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function OrganizerDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
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
      setStatsLoading(true);
      api.get<OrganizerStatsResponseDto>('/dashboard/organizer')
        .then((res) => setStats(res.data))
        .catch((err) => console.warn('Organizer stats error:', err))
        .finally(() => setStatsLoading(false));

      setEventsLoading(true);
      api.get<Event[]>('/events/my-events')
        .then((res) => setMyEvents(res.data || []))
        .catch((err) => console.warn('My events error:', err))
        .finally(() => setEventsLoading(false));

      setPaymentsLoading(true);
      api.get<Registration[]>('/registrations/organizer/payments')
        .then((res) => setPayments(res.data || []))
        .catch((err) => console.warn('Organizer payments error:', err))
        .finally(() => setPaymentsLoading(false));

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
      if (!user) {
        router.push('/auth/login?redirect=/dashboard/organizer');
        return;
      }
      if (user.role === 'USER') {
        router.push('/');
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

      setPayments((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: action === 'APPROVE' ? 'VERIFIED' : 'REJECTED', rejectionReason: action === 'REJECT' ? rejectionReason : null }
            : p
        )
      );

      setInspectingPayment(null);
      setRejectionReason('');
      
      api.get<OrganizerStatsResponseDto>('/dashboard/organizer').then((res) => setStats(res.data));
    } catch (err: any) {
      console.error('Failed to verify payment:', err);
      alert(err.response?.data?.message || 'Gagal memverifikasi status pembayaran.');
    } finally {
      setVerifyingId(null);
    }
  };

  // Ticket Tiers
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

  // Create Event Form Submit: POST /events
  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingEvent(true);
    setFormSuccess(null);
    setFormError(null);

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

      // Filter valid tiers
      const validTiers = ticketTiersInput.filter((t) => t.name.trim() !== '');
      if (validTiers.length > 0) {
        formData.append('ticketTiers', JSON.stringify(validTiers));
      }

      if (bannerFile) {
        formData.append('banner', bannerFile);
      }

      const res = await api.post<Event>('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFormSuccess('Konser berhasil dibuat dan diterbitkan ke Eventix!');
      setMyEvents((prev) => [res.data, ...prev]);

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
      setTicketTiersInput([
        { name: 'Reguler', price: 100000, quota: 150 },
        { name: 'VIP', price: 250000, quota: 50 },
      ]);

      setTimeout(() => {
        setActiveTab('events');
      }, 1500);
    } catch (err: any) {
      console.error('Create event error:', err);
      const msg = err.response?.data?.message || 'Gagal membuat konser. Periksa kembali form isian.';
      setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsCreatingEvent(false);
    }
  };

  // Delete event: DELETE /events/{id}
  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus konser ini dari platform?')) return;
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
        <Loader2 className="w-10 h-10 animate-spin text-traveloka-blue" />
        <p className="text-xs font-bold text-slate-500">Memuat dashboard mitra organizer...</p>
      </div>
    );
  }

  const pendingPayments = payments.filter((p) => p.status === 'PAYMENT_SUBMITTED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* 1. Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-traveloka-sky text-traveloka-blue text-[10px] font-bold uppercase">
              Organizer Extranet
            </span>
            {user?.isVerified && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Promotor Terverifikasi
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Dashboard Penyelenggara Konser
          </h1>
          <p className="text-xs text-slate-500">
            Kelola konser musik, pantau penjualan tiket, dan verifikasi bukti pembayaran pembeli.
          </p>
        </div>

        <button
          onClick={loadOrganizerData}
          className="traveloka-btn-outline text-xs py-2 px-4"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          <span>Perbarui Data</span>
        </button>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'stats'
              ? 'bg-traveloka-navy text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Ringkasan Statistik</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'payments'
              ? 'bg-traveloka-navy text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Verifikasi Pembayaran</span>
          {pendingPayments.length > 0 && (
            <span className="ml-1 px-2 py-0.2 rounded-full bg-traveloka-orange text-white text-[10px] font-bold">
              {pendingPayments.length} Baru
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'events'
              ? 'bg-traveloka-navy text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Konser Saya ({myEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('create-event')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'create-event'
              ? 'bg-traveloka-orange text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Buat Konser Baru</span>
        </button>

        <button
          onClick={() => setActiveTab('payment-methods')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'payment-methods'
              ? 'bg-traveloka-navy text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Rekening Pembayaran</span>
        </button>
      </div>

      {/* TAB 1: SUMMARY STATS */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-traveloka-sky text-traveloka-blue flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Total Konser</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  {statsLoading ? '...' : stats?.totalEvents ?? myEvents.length}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-traveloka-orange flex items-center justify-center">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Tiket Terjual</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  {statsLoading ? '...' : stats?.totalTicketsSold ?? 0}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Total Pendapatan</p>
                <p className="text-xl font-extrabold text-traveloka-orange mt-0.5">
                  {statsLoading ? '...' : formatIDR(stats?.totalRevenue ?? 0)}
                </p>
              </div>
            </div>

          </div>

          {/* Quick Actions Card */}
          <div className="bg-gradient-to-r from-traveloka-sky/40 to-white rounded-3xl p-8 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Ingin Menyelenggarakan Konser Baru?</h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Terbitkan konser musikmu, tentukan kategori tiket VIP / Reguler, dan terima pembayaran tiket langsung secara aman.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('create-event')}
              className="traveloka-btn-orange text-xs py-3 px-6 flex items-center gap-2 flex-shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Mulai Buat Konser</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT VERIFICATIONS */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Verifikasi Pembayaran Masuk</h2>
                <p className="text-xs text-slate-500">Periksa foto bukti transfer dari pembeli dan setujui / tolak pembayaran</p>
              </div>
            </div>

            {paymentsLoading ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-traveloka-blue mx-auto" />
                <p className="text-xs font-semibold text-slate-400">Memuat data pembayaran...</p>
              </div>
            ) : payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-5">Kode Tiket</th>
                      <th className="py-3 px-5">Konser</th>
                      <th className="py-3 px-5">Pembeli</th>
                      <th className="py-3 px-5">Jumlah & Total</th>
                      <th className="py-3 px-5">Bukti Transfer</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p) => {
                      const isPending = p.status === 'PAYMENT_SUBMITTED';
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-5 font-mono font-bold text-slate-900">{p.ticketCode}</td>
                          <td className="py-3.5 px-5 font-semibold text-slate-800 max-w-[180px] truncate">
                            {p.event?.title || '-'}
                          </td>
                          <td className="py-3.5 px-5">
                            <p className="font-bold text-slate-900">{p.user?.name || 'User'}</p>
                            <p className="text-[10px] text-slate-400">{p.user?.email || '-'}</p>
                          </td>
                          <td className="py-3.5 px-5">
                            <p className="font-extrabold text-traveloka-orange">{formatIDR(p.totalPrice)}</p>
                            <p className="text-[10px] font-medium text-slate-500">{p.quantity} Tiket ({p.ticketTier?.name || 'Reguler'})</p>
                          </td>
                          <td className="py-3.5 px-5">
                            {p.paymentProofUrl ? (
                              <button
                                onClick={() => setInspectingPayment(p)}
                                className="traveloka-btn-outline text-[10px] py-1 px-2.5"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Lihat Foto</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Tanpa File</span>
                            )}
                          </td>
                          <td className="py-3.5 px-5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              p.status === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'PAYMENT_SUBMITTED'
                                ? 'bg-amber-100 text-amber-800'
                                : p.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {isPending ? (
                                <>
                                  <button
                                    onClick={() => handleVerifyPayment(p.id, 'APPROVE')}
                                    disabled={verifyingId === p.id}
                                    className="traveloka-btn-blue text-[11px] py-1 px-3"
                                  >
                                    {verifyingId === p.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    onClick={() => setInspectingPayment(p)}
                                    className="px-3 py-1 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition-colors"
                                  >
                                    <XCircle className="w-3 h-3 inline mr-1" />
                                    <span>Tolak</span>
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs font-semibold text-slate-400">Selesai</span>
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
              <div className="p-12 text-center text-xs font-semibold text-slate-400">
                Tidak ada antrean verifikasi pembayaran saat ini.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Inspect Payment Proof Image & Action */}
      {inspectingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-floating border border-slate-200 p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Bukti Transfer #{inspectingPayment.ticketCode}
                </h3>
                <p className="text-xs text-slate-500">
                  Total: {formatIDR(inspectingPayment.totalPrice)} • Pembeli: {inspectingPayment.user?.name}
                </p>
              </div>
              <button
                onClick={() => setInspectingPayment(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Proof Image View */}
            <div className="relative w-full h-80 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
              {inspectingPayment.paymentProofUrl ? (
                <Image
                  src={getImageUrl(inspectingPayment.paymentProofUrl)}
                  alt="Bukti Transfer"
                  fill
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                  Tidak ada gambar bukti
                </div>
              )}
            </div>

            {/* Rejection Reason Input */}
            {inspectingPayment.status === 'PAYMENT_SUBMITTED' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Alasan Penolakan (Wajib diisi jika menolak):
                </label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="mis. Bukti transfer buram / nominal tidak cocok"
                  className="traveloka-input w-full px-3 py-2 text-xs"
                />
              </div>
            )}

            {/* Action Buttons */}
            {inspectingPayment.status === 'PAYMENT_SUBMITTED' ? (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleVerifyPayment(inspectingPayment.id, 'APPROVE')}
                  disabled={verifyingId === inspectingPayment.id}
                  className="traveloka-btn-blue py-2.5 text-xs font-bold"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  <span>Setujui (Approve)</span>
                </button>
                <button
                  onClick={() => handleVerifyPayment(inspectingPayment.id, 'REJECT')}
                  disabled={verifyingId === inspectingPayment.id}
                  className="py-2.5 px-4 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                >
                  <XCircle className="w-4 h-4 inline mr-1.5" />
                  <span>Tolak (Reject)</span>
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={() => setInspectingPayment(null)}
                  className="w-full traveloka-btn-outline py-2.5 text-xs font-bold"
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
              <h2 className="text-lg font-bold text-slate-900">Daftar Konser yang Anda Buat</h2>
              <p className="text-xs text-slate-500">Total {myEvents.length} konser musik terdaftar</p>
            </div>
            <button
              onClick={() => setActiveTab('create-event')}
              className="traveloka-btn-orange text-xs py-2 px-4"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>Buat Konser</span>
            </button>
          </div>

          {eventsLoading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-traveloka-blue mx-auto" />
              <p className="text-xs font-semibold text-slate-400">Memuat daftar konser...</p>
            </div>
          ) : myEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.map((ev) => {
                const bannerSrc = getImageUrl(ev.bannerUrl);
                return (
                  <div key={ev.id} className="bg-white rounded-3xl border border-slate-200 shadow-card p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                        <Image
                          src={bannerSrc}
                          alt={ev.title}
                          fill
                          className="object-cover"
                          unoptimized={bannerSrc.startsWith('http')}
                        />
                        <div className="absolute top-2 right-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-traveloka-blue text-white text-[10px] font-bold">
                            {ev.status}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{ev.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{ev.description}</p>
                      
                      <div className="text-xs text-slate-600 space-y-1 font-medium pt-1">
                        <p>📍 {ev.location}</p>
                        <p>📅 {formatDateShort(ev.startDate)}</p>
                        <p className="font-extrabold text-traveloka-orange">💰 Mulai {formatIDR(ev.price)}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        href={`/events/${ev.id}`}
                        className="traveloka-btn-outline text-[11px] py-1.5 px-3"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        <span>Halaman Publik</span>
                      </Link>

                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
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
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-traveloka-sky text-traveloka-blue mx-auto flex items-center justify-center">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Belum Ada Konser yang Diterbitkan</h3>
              <p className="text-xs text-slate-500">Buat konser pertamamu sekarang dan mulailah menjual tiket.</p>
              <button
                onClick={() => setActiveTab('create-event')}
                className="traveloka-btn-orange text-xs py-2.5 px-5 font-bold"
              >
                Buat Konser Baru
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CREATE EVENT FORM */}
      {activeTab === 'create-event' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Buat Konser & Tiket Baru</h2>
            <p className="text-xs text-slate-500">Isi formulir lengkap di bawah ini untuk menerbitkan konser musik di platform Eventix.</p>
          </div>

          {formSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          {formError && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-xs font-semibold text-rose-800">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateEventSubmit} className="bg-white rounded-3xl p-8 space-y-5 border border-slate-200 shadow-floating">
            
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Judul / Nama Konser *</label>
              <input
                type="text"
                required
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="mis. Jakarta Rock Symphony 2026"
                className="traveloka-input w-full text-xs font-medium"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Deskripsi Lengkap & Lineup Artis *</label>
              <textarea
                rows={4}
                required
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Jelaskan guest star, tata tertib, dan rundown acara..."
                className="traveloka-input w-full text-xs font-medium"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Waktu Mulai *</label>
                <input
                  type="datetime-local"
                  required
                  value={eventForm.startDate}
                  onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                  className="traveloka-input w-full text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Waktu Selesai *</label>
                <input
                  type="datetime-local"
                  required
                  value={eventForm.endDate}
                  onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                  className="traveloka-input w-full text-xs"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Lokasi / Venue Konser *</label>
              <input
                type="text"
                required
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                placeholder="mis. Gelora Bung Karno, Senayan, Jakarta"
                className="traveloka-input w-full text-xs font-medium"
              />
            </div>

            {/* Base Price & Quota */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Harga Dasar (Rp)</label>
                <input
                  type="number"
                  min={0}
                  value={eventForm.price}
                  onChange={(e) => setEventForm({ ...eventForm, price: Number(e.target.value) })}
                  className="traveloka-input w-full text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Total Kuota Penonton</label>
                <input
                  type="number"
                  min={1}
                  value={eventForm.quota}
                  onChange={(e) => setEventForm({ ...eventForm, quota: Number(e.target.value) })}
                  className="traveloka-input w-full text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Status Konser</label>
                <select
                  value={eventForm.status}
                  onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                  className="traveloka-input w-full text-xs"
                >
                  <option value="PUBLISHED">PUBLISHED (Langsung Tayang)</option>
                  <option value="DRAFT">DRAFT (Simpan Draf)</option>
                </select>
              </div>
            </div>

            {/* Dynamic Ticket Tiers */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Kategori Tiket (Ticket Tiers)</h4>
                  <p className="text-[11px] text-slate-400">Contoh: VIP, Early Bird, Presale, Tribune</p>
                </div>
                <button
                  type="button"
                  onClick={addTicketTierRow}
                  className="traveloka-btn-outline text-[11px] py-1 px-3"
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1" />
                  <span>Tambah Kategori</span>
                </button>
              </div>

              <div className="space-y-2">
                {ticketTiersInput.map((tier, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <input
                      type="text"
                      placeholder="Nama Tier (mis. VIP)"
                      value={tier.name}
                      onChange={(e) => handleTierChange(idx, 'name', e.target.value)}
                      className="traveloka-input flex-1 py-1.5 px-3 text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Harga (Rp)"
                      value={tier.price}
                      onChange={(e) => handleTierChange(idx, 'price', e.target.value)}
                      className="traveloka-input w-32 py-1.5 px-3 text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Kuota"
                      value={tier.quota}
                      onChange={(e) => handleTierChange(idx, 'quota', e.target.value)}
                      className="traveloka-input w-24 py-1.5 px-3 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => removeTicketTierRow(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Banner Image Upload */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">
                Poster / Flyer Konser (JPG/PNG/WEBP, Maks 5MB)
              </label>
              
              <label
                htmlFor="banner-upload"
                className="border-2 border-dashed border-slate-300 hover:border-traveloka-blue rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-traveloka-sky/20 transition-all"
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
                    <div className="relative w-60 h-32 mx-auto rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      <Image src={bannerPreview} alt="Banner Preview" fill className="object-cover" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">Poster dipilih: {bannerFile?.name}</p>
                    <span className="text-xs text-traveloka-blue underline">Klik untuk ganti file</span>
                  </div>
                ) : (
                  <div className="text-center space-y-1.5">
                    <UploadCloud className="w-8 h-8 text-traveloka-blue mx-auto" />
                    <p className="text-xs font-bold text-slate-800">Klik untuk memilih flyer / poster konser</p>
                    <p className="text-[11px] text-slate-400">Rekomendasi rasio 16:9</p>
                  </div>
                )}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isCreatingEvent}
              className="w-full traveloka-btn-orange py-3.5 text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCreatingEvent ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menerbitkan Konser...</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Registered Payment Methods List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Rekening Bank & E-Wallet Penyelenggara</h2>
              <p className="text-xs text-slate-500">Rekening ini akan ditampilkan kepada pembeli tiket saat proses transfer pembayaran.</p>
            </div>

            {pmLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-traveloka-blue mx-auto" />
              </div>
            ) : paymentMethods.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paymentMethods.map((pm) => (
                  <div key={pm.id} className="bg-white rounded-3xl border border-slate-200 shadow-card p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 uppercase">{pm.bankName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                          {pm.type}
                        </span>
                      </div>
                      <p className="font-mono text-sm font-extrabold text-slate-900 tracking-wider">
                        {pm.accountNumber}
                      </p>
                      <p className="text-xs text-slate-500">A/n: <strong className="text-slate-800 uppercase">{pm.accountHolderName}</strong></p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => handleDeletePaymentMethod(pm.id)}
                        className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <CreditCard className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Belum ada rekening/e-wallet yang didaftarkan.</p>
              </div>
            )}
          </div>

          {/* Right: Add Payment Method Form (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 space-y-4 border border-slate-200 shadow-floating">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Tambah Rekening Baru
              </h3>

              <form onSubmit={handleCreatePaymentMethod} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tipe Pembayaran</label>
                  <select
                    value={newPm.type}
                    onChange={(e) => setNewPm({ ...newPm, type: e.target.value as PaymentMethodType })}
                    className="traveloka-input w-full text-xs"
                  >
                    <option value="BANK">Transfer Bank</option>
                    <option value="EWALLET">E-Wallet (GoPay, OVO, Dana)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nama Bank / Provider</label>
                  <input
                    type="text"
                    required
                    value={newPm.bankName}
                    onChange={(e) => setNewPm({ ...newPm, bankName: e.target.value })}
                    placeholder="mis. BCA, Mandiri, GoPay"
                    className="traveloka-input w-full text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nomor Rekening / No. HP</label>
                  <input
                    type="text"
                    required
                    value={newPm.accountNumber}
                    onChange={(e) => setNewPm({ ...newPm, accountNumber: e.target.value })}
                    placeholder="1234567890"
                    className="traveloka-input w-full text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nama Pemilik Rekening</label>
                  <input
                    type="text"
                    required
                    value={newPm.accountHolderName}
                    onChange={(e) => setNewPm({ ...newPm, accountHolderName: e.target.value })}
                    placeholder="mis. PT Nada Promosindo"
                    className="traveloka-input w-full text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPm}
                  className="w-full traveloka-btn-orange py-2.5 text-xs font-bold shadow-md hover:shadow-lg mt-2"
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
