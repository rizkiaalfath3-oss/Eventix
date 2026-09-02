'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Calendar, 
  Ticket, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Loader2, 
  RefreshCw, 
  AlertCircle, 
  Check, 
  ExternalLink,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import api from '@/lib/axios';
import { User, Event, AdminStatsResponseDto } from '@/types';
import { formatIDR, formatDateShort, getImageUrl } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'stats' | 'organizers' | 'events' | 'users'>('stats');

  // Stats state
  const [stats, setStats] = useState<AdminStatsResponseDto | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Organizers state
  const [organizers, setOrganizers] = useState<User[]>([]);
  const [organizersLoading, setOrganizersLoading] = useState(true);
  const [verifyingOrganizerId, setVerifyingOrganizerId] = useState<string | null>(null);

  // Events state
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [approvingEventId, setApprovingEventId] = useState<string | null>(null);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const loadAdminData = async () => {
    try {
      setStatsLoading(true);
      api.get<AdminStatsResponseDto>('/dashboard/admin')
        .then((res) => setStats(res.data))
        .catch((err) => console.warn('Admin stats error:', err))
        .finally(() => setStatsLoading(false));

      setOrganizersLoading(true);
      api.get<User[]>('/users/organizers')
        .then((res) => setOrganizers(res.data || []))
        .catch((err) => console.warn('Admin organizers error:', err))
        .finally(() => setOrganizersLoading(false));

      setEventsLoading(true);
      api.get<Event[]>('/events')
        .then((res) => setEvents(res.data || []))
        .catch((err) => console.warn('Admin events error:', err))
        .finally(() => setEventsLoading(false));

      setUsersLoading(true);
      api.get<User[]>('/users')
        .then((res) => setUsers(res.data || []))
        .catch((err) => console.warn('Admin users error:', err))
        .finally(() => setUsersLoading(false));
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login?redirect=/dashboard/admin');
        return;
      }
      if (user.role !== 'ADMIN') {
        if (user.role === 'ORGANIZER') {
          router.push('/dashboard/organizer');
        } else {
          router.push('/');
        }
        return;
      }
      loadAdminData();
    }
  }, [user, authLoading, router]);

  // Toggle Organizer Verification
  const handleToggleOrganizerVerification = async (orgId: string, currentStatus: boolean) => {
    setVerifyingOrganizerId(orgId);
    const newStatus = !currentStatus;
    try {
      await api.patch(`/users/${orgId}/verify-organizer`, { isVerified: newStatus }, {
        params: { isVerified: newStatus },
      });

      setOrganizers((prev) =>
        prev.map((org) => (org.id === orgId ? { ...org, isVerified: newStatus } : org))
      );
    } catch (err: any) {
      console.error('Verify organizer error:', err);
      alert(err.response?.data?.message || 'Gagal mengubah status verifikasi organizer.');
    } finally {
      setVerifyingOrganizerId(null);
    }
  };

  // Approve Event
  const handleApproveEvent = async (eventId: string) => {
    setApprovingEventId(eventId);
    try {
      await api.patch(`/events/${eventId}/approve`, {});
      setEvents((prev) =>
        prev.map((ev) => (ev.id === eventId ? { ...ev, isApproved: true, status: 'PUBLISHED' } : ev))
      );
    } catch (err: any) {
      console.error('Approve event error:', err);
      alert(err.response?.data?.message || 'Gagal menyetujui konser.');
    } finally {
      setApprovingEventId(null);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus konser ini dari platform?')) return;
    try {
      await api.delete(`/events/${eventId}`);
      setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus event.');
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
    setDeletingUserId(userId);
    try {
      await api.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setOrganizers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus user.');
    } finally {
      setDeletingUserId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-traveloka-blue" />
        <p className="text-xs font-bold text-slate-500">Memuat Platform Admin Eventix...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-extrabold uppercase">
              Super Admin Control
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-red-600" />
            Platform Administration Portal
          </h1>
          <p className="text-xs text-slate-500">
            Pusat kendali seluruh data pengguna, persetujuan konser musik, dan verifikasi promotor Eventix.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="traveloka-btn-outline text-xs py-2 px-4"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          <span>Perbarui Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'stats'
              ? 'bg-traveloka-navy text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Statistik Platform</span>
        </button>

        <button
          onClick={() => setActiveTab('organizers')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'organizers'
              ? 'bg-traveloka-navy text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Verifikasi Organizer ({organizers.length})</span>
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
          <span>Moderasi Event ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-traveloka-navy text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Semua Pengguna ({users.length})</span>
        </button>
      </div>

      {/* TAB 1: ADMIN STATS OVERVIEW */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-card space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase">Total User</span>
                <div className="w-8 h-8 rounded-xl bg-traveloka-sky text-traveloka-blue flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                {statsLoading ? '...' : stats?.totalUsers ?? users.length}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-card space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase">Organizer</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-traveloka-orange flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                {statsLoading ? '...' : stats?.totalOrganizers ?? organizers.length}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-card space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase">Total Konser</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                {statsLoading ? '...' : stats?.totalEvents ?? events.length}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-card space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase">Tiket Terjual</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Ticket className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                {statsLoading ? '...' : stats?.totalTicketsSold ?? 0}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-card space-y-2 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase">Platform GMV</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-extrabold text-traveloka-orange">
                {statsLoading ? '...' : formatIDR(stats?.totalRevenue ?? 0)}
              </p>
            </div>

          </div>

          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Tanggung Jawab Administrator Eventix</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              Sebagai Administrator Eventix, Anda bertugas memverifikasi keabsahan promotor konser, memoderasi konten flyer acara, dan menjaga keamanan transaksi platform.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: VERIFY ORGANIZERS */}
      {activeTab === 'organizers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Daftar Akun Penyelenggara (Organizer)</h2>
              <p className="text-xs text-slate-500">Verifikasi akun promotor agar tanda terverifikasi tampil di halaman konser publik.</p>
            </div>

            {organizersLoading ? (
              <div className="py-16 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-traveloka-blue mx-auto" />
              </div>
            ) : organizers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-5">Nama Penyelenggara</th>
                      <th className="py-3 px-5">Email</th>
                      <th className="py-3 px-5">Nomor HP</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {organizers.map((org) => {
                      const isVerifying = verifyingOrganizerId === org.id;
                      return (
                        <tr key={org.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-5">
                            <p className="font-bold text-slate-900">{org.organizationName || org.name}</p>
                            <p className="text-[10px] text-slate-400">{org.name}</p>
                          </td>
                          <td className="py-3.5 px-5 font-mono text-slate-600">{org.email}</td>
                          <td className="py-3.5 px-5">{org.phoneNumber || '-'}</td>
                          <td className="py-3.5 px-5">
                            {org.isVerified ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                <CheckCircle2 className="w-3 h-3" /> Terverifikasi
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                                Belum Verifikasi
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <button
                              onClick={() => handleToggleOrganizerVerification(org.id, org.isVerified)}
                              disabled={isVerifying}
                              className={`text-[11px] font-bold py-1.5 px-3 rounded-full inline-flex items-center gap-1.5 transition-all ${
                                org.isVerified
                                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                  : 'traveloka-btn-blue'
                              }`}
                            >
                              {isVerifying ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : org.isVerified ? (
                                <XCircle className="w-3 h-3" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              <span>{org.isVerified ? 'Batalkan' : 'Verifikasi Akun'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-xs font-semibold text-slate-400">
                Belum ada organizer yang mendaftar.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MODERATE EVENTS */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Moderasi & Persetujuan Konser</h2>
              <p className="text-xs text-slate-500">Setujui konser yang diajukan oleh organizer atau hapus konser bermasalah.</p>
            </div>

            {eventsLoading ? (
              <div className="py-16 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-traveloka-blue mx-auto" />
              </div>
            ) : events.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-5">Konser</th>
                      <th className="py-3 px-5">Penyelenggara</th>
                      <th className="py-3 px-5">Tanggal & Lokasi</th>
                      <th className="py-3 px-5">Harga Dasar</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {events.map((ev) => {
                      const isApproving = approvingEventId === ev.id;
                      return (
                        <tr key={ev.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-5 font-bold text-slate-900 max-w-[200px] truncate">
                            {ev.title}
                          </td>
                          <td className="py-3.5 px-5 font-semibold text-slate-700">{ev.organizer?.name || '-'}</td>
                          <td className="py-3.5 px-5">
                            <p className="font-bold text-slate-900">{formatDateShort(ev.startDate)}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{ev.location}</p>
                          </td>
                          <td className="py-3.5 px-5 font-extrabold text-traveloka-orange">{formatIDR(ev.price)}</td>
                          <td className="py-3.5 px-5">
                            {ev.isApproved ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                ✓ Disetujui
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                Menunggu Approval
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {!ev.isApproved && (
                                <button
                                  onClick={() => handleApproveEvent(ev.id)}
                                  disabled={isApproving}
                                  className="traveloka-btn-blue text-[11px] py-1 px-3"
                                >
                                  {isApproving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                                  <span>Approve</span>
                                </button>
                              )}
                              <Link
                                href={`/events/${ev.id}`}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                                title="Lihat Konser"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => handleDeleteEvent(ev.id)}
                                className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Hapus Konser"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
                Belum ada konser terdaftar.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Manajemen Akun Pengguna Platform</h2>
              <p className="text-xs text-slate-500">Daftar seluruh akun terdaftar di sistem Eventix.</p>
            </div>

            {usersLoading ? (
              <div className="py-16 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-traveloka-blue mx-auto" />
              </div>
            ) : users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-5">Nama Pengguna</th>
                      <th className="py-3 px-5">Email</th>
                      <th className="py-3 px-5">Role</th>
                      <th className="py-3 px-5">Telepon</th>
                      <th className="py-3 px-5">Terdaftar Sejak</th>
                      <th className="py-3 px-5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5 font-bold text-slate-900">{u.name}</td>
                        <td className="py-3.5 px-5 font-mono text-slate-600">{u.email}</td>
                        <td className="py-3.5 px-5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.role === 'ADMIN'
                              ? 'bg-red-100 text-red-700'
                              : u.role === 'ORGANIZER'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">{u.phoneNumber || '-'}</td>
                        <td className="py-3.5 px-5 font-medium text-slate-600">{formatDateShort(u.createdAt)}</td>
                        <td className="py-3.5 px-5 text-center">
                          {u.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={deletingUserId === u.id}
                              className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-xs font-semibold text-slate-400">
                Belum ada pengguna terdaftar.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
