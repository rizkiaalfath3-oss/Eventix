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
  ShieldAlert
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
      // 1. Stats
      setStatsLoading(true);
      api.get<AdminStatsResponseDto>('/dashboard/admin')
        .then((res) => setStats(res.data))
        .catch((err) => console.warn('Admin stats error:', err))
        .finally(() => setStatsLoading(false));

      // 2. Organizers
      setOrganizersLoading(true);
      api.get<User[]>('/users/organizers')
        .then((res) => setOrganizers(res.data || []))
        .catch((err) => console.warn('Admin organizers error:', err))
        .finally(() => setOrganizersLoading(false));

      // 3. Events
      setEventsLoading(true);
      api.get<Event[]>('/events')
        .then((res) => setEvents(res.data || []))
        .catch((err) => console.warn('Admin events error:', err))
        .finally(() => setEventsLoading(false));

      // 4. Users
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
      if (!user || user.role !== 'ADMIN') {
        router.push('/auth/login?redirect=/dashboard/admin');
        return;
      }
      loadAdminData();
    }
  }, [user, authLoading, router]);

  // Verify / Unverify Organizer: PATCH /users/{id}/verify-organizer?isVerified=true|false
  const handleToggleOrganizerVerification = async (orgId: string, currentStatus: boolean) => {
    setVerifyingOrganizerId(orgId);
    const newStatus = !currentStatus;
    try {
      await api.patch(`/users/${orgId}/verify-organizer`, null, {
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

  // Approve Event: PATCH /events/{id}/approve
  const handleApproveEvent = async (eventId: string) => {
    setApprovingEventId(eventId);
    try {
      await api.patch(`/events/${eventId}/approve`);
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

  // Delete Event: DELETE /events/{id}
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus konser ini dari platform?')) return;
    try {
      await api.delete(`/events/${eventId}`);
      setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus event.');
    }
  };

  // Delete User: DELETE /users/{id}
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
        <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
        <p className="text-sm text-gray-400">Memuat Platform Admin...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-950 text-pink-300 border border-pink-800">
              Super Admin Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-pink-400" />
            Platform Administration
          </h1>
          <p className="text-xs text-gray-400">
            Pusat kendali seluruh data pengguna, persetujuan konser musik, dan verifikasi organizer Eventix.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-card hover:bg-surface-hover border border-surface-border text-xs font-medium text-gray-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-pink-400" />
          Perbarui Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-border overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'stats'
              ? 'bg-pink-600 text-white shadow-glow'
              : 'text-gray-400 hover:text-white hover:bg-surface-card'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Statistik Platform
        </button>

        <button
          onClick={() => setActiveTab('organizers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'organizers'
              ? 'bg-pink-600 text-white shadow-glow'
              : 'text-gray-400 hover:text-white hover:bg-surface-card'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Verifikasi Organizer ({organizers.length})
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'events'
              ? 'bg-pink-600 text-white shadow-glow'
              : 'text-gray-400 hover:text-white hover:bg-surface-card'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Moderasi Event ({events.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-pink-600 text-white shadow-glow'
              : 'text-gray-400 hover:text-white hover:bg-surface-card'
          }`}
        >
          <Users className="w-4 h-4" />
          Semua Pengguna ({users.length})
        </button>
      </div>

      {/* TAB 1: ADMIN STATS OVERVIEW */}
      {activeTab === 'stats' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="p-5 rounded-3xl glass-card border border-surface-border space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[11px] font-semibold uppercase">Total User</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-black text-white">
                {statsLoading ? '...' : stats?.totalUsers ?? users.length}
              </p>
            </div>

            <div className="p-5 rounded-3xl glass-card border border-surface-border space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[11px] font-semibold uppercase">Organizer</span>
                <Building2 className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-white">
                {statsLoading ? '...' : stats?.totalOrganizers ?? organizers.length}
              </p>
            </div>

            <div className="p-5 rounded-3xl glass-card border border-surface-border space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[11px] font-semibold uppercase">Total Konser</span>
                <Calendar className="w-4 h-4 text-pink-400" />
              </div>
              <p className="text-2xl font-black text-white">
                {statsLoading ? '...' : stats?.totalEvents ?? events.length}
              </p>
            </div>

            <div className="p-5 rounded-3xl glass-card border border-surface-border space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[11px] font-semibold uppercase">Tiket Terjual</span>
                <Ticket className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-white">
                {statsLoading ? '...' : stats?.totalTicketsSold ?? 0}
              </p>
            </div>

            <div className="p-5 rounded-3xl glass-card border border-surface-border space-y-2 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[11px] font-semibold uppercase">Platform GMV</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-black text-emerald-400">
                {statsLoading ? '...' : formatIDR(stats?.totalRevenue ?? 0)}
              </p>
            </div>

          </div>

          <div className="p-8 rounded-3xl glass-panel border border-surface-border space-y-4">
            <h3 className="text-base font-bold text-white">Platform Health & Quick Tips</h3>
            <p className="text-xs text-gray-300 leading-relaxed max-w-2xl">
              Sebagai Administrator Eventix, Anda bertanggung jawab untuk memverifikasi keabsahan legalitas penyelenggara konser (Organizer), memoderasi konten banner konser, serta menanggulangi tiket palsu.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: VERIFY ORGANIZERS */}
      {activeTab === 'organizers' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">Daftar Akun Penyelenggara (Organizer)</h2>
            <p className="text-xs text-gray-400">Verifikasi akun organizer agar badge centang terverifikasi muncul di halaman konser.</p>
          </div>

          {organizersLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto" />
            </div>
          ) : organizers.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface-card">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#0E1524] text-gray-400 uppercase font-semibold border-b border-surface-border">
                  <tr>
                    <th className="py-3.5 px-4">Nama Penyelenggara</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Nomor HP</th>
                    <th className="py-3.5 px-4">Status Verifikasi</th>
                    <th className="py-3.5 px-4 text-center">Aksi Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/60">
                  {organizers.map((org) => {
                    const isVerifying = verifyingOrganizerId === org.id;
                    return (
                      <tr key={org.id} className="hover:bg-surface-hover/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white">{org.organizationName || org.name}</p>
                          <p className="text-[10px] text-gray-400">{org.name}</p>
                        </td>
                        <td className="py-3.5 px-4">{org.email}</td>
                        <td className="py-3.5 px-4">{org.phoneNumber || '-'}</td>
                        <td className="py-3.5 px-4">
                          {org.isVerified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Terverifikasi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                              <AlertCircle className="w-3 h-3" /> Belum Verifikasi
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleOrganizerVerification(org.id, org.isVerified)}
                            disabled={isVerifying}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 transition-all shadow-md ${
                              org.isVerified
                                ? 'bg-red-950 text-red-300 border border-red-800 hover:bg-red-900'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow'
                            }`}
                          >
                            {isVerifying ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : org.isVerified ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            {org.isVerified ? 'Batalkan Verifikasi' : 'Verifikasi Akun'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 rounded-3xl bg-surface-card border border-surface-border text-center text-gray-400 text-xs">
              Belum ada organizer yang mendaftar.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MODERATE EVENTS */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">Moderasi & Persetujuan Konser</h2>
            <p className="text-xs text-gray-400">Setujui konser yang diajukan oleh organizer atau hapus konser ilegal.</p>
          </div>

          {eventsLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto" />
            </div>
          ) : events.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface-card">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#0E1524] text-gray-400 uppercase font-semibold border-b border-surface-border">
                  <tr>
                    <th className="py-3.5 px-4">Konser</th>
                    <th className="py-3.5 px-4">Penyelenggara</th>
                    <th className="py-3.5 px-4">Tanggal & Lokasi</th>
                    <th className="py-3.5 px-4">Harga Dasar</th>
                    <th className="py-3.5 px-4">Status & Approval</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/60">
                  {events.map((ev) => {
                    const isApproving = approvingEventId === ev.id;
                    return (
                      <tr key={ev.id} className="hover:bg-surface-hover/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white max-w-[200px] truncate">
                          {ev.title}
                        </td>
                        <td className="py-3.5 px-4">{ev.organizer?.name || '-'}</td>
                        <td className="py-3.5 px-4">
                          <p className="text-white">{formatDateShort(ev.startDate)}</p>
                          <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{ev.location}</p>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">{formatIDR(ev.price)}</td>
                        <td className="py-3.5 px-4">
                          {ev.isApproved ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                              ✓ Approved
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                              Pending Approval
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {!ev.isApproved && (
                              <button
                                onClick={() => handleApproveEvent(ev.id)}
                                disabled={isApproving}
                                className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-glow"
                              >
                                {isApproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                Approve
                              </button>
                            )}
                            <Link
                              href={`/events/${ev.id}`}
                              className="p-1.5 rounded-lg bg-surface-input border border-surface-border text-gray-400 hover:text-white"
                              title="Lihat"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteEvent(ev.id)}
                              className="p-1.5 rounded-lg bg-red-950/40 border border-red-800/40 text-red-400 hover:bg-red-900/60"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
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
            <div className="p-16 rounded-3xl bg-surface-card border border-surface-border text-center text-gray-400 text-xs">
              Belum ada konser terdaftar.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">Manajemen Akun Pengguna Platform</h2>
            <p className="text-xs text-gray-400">Daftar seluruh akun terdaftar di sistem Eventix.</p>
          </div>

          {usersLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto" />
            </div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface-card">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#0E1524] text-gray-400 uppercase font-semibold border-b border-surface-border">
                  <tr>
                    <th className="py-3.5 px-4">Nama Pengguna</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Telepon</th>
                    <th className="py-3.5 px-4">Terdaftar Sejak</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-hover/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{u.name}</td>
                      <td className="py-3.5 px-4">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-pink-950 text-pink-300 border border-pink-800'
                            : u.role === 'ORGANIZER'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{u.phoneNumber || '-'}</td>
                      <td className="py-3.5 px-4">{formatDateShort(u.createdAt)}</td>
                      <td className="py-3.5 px-4 text-center">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={deletingUserId === u.id}
                            className="p-1.5 rounded-lg bg-red-950/40 border border-red-800/40 text-red-400 hover:bg-red-900/60 transition-colors"
                            title="Hapus Akun"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 rounded-3xl bg-surface-card border border-surface-border text-center text-gray-400 text-xs">
              Belum ada pengguna terdaftar.
            </div>
          )}
        </div>
      )}

    </div>
  );
}
