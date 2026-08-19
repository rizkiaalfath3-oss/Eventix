'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ticket, Mail, Lock, User, Phone, ArrowRight, AlertCircle, Loader2, CheckCircle2, Building2 } from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { AuthResponseDto, UserRole } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'USER' as UserRole,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (formData.password.length < 6) {
      setErrorMessage('Kata sandi minimal harus 6 karakter.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post<AuthResponseDto>('/auth/register', formData);
      const data = response.data;

      // If backend returns auth token on register, login automatically
      if (data.accessToken) {
        login(data);
        setSuccessMessage('Registrasi berhasil! Mengalihkan ke dashboard...');
        setTimeout(() => {
          if (formData.role === 'ORGANIZER') {
            router.push('/dashboard/organizer');
          } else {
            router.push('/');
          }
        }, 1000);
      } else {
        setSuccessMessage('Registrasi akun berhasil! Silakan masuk.');
        setTimeout(() => {
          router.push('/auth/login');
        }, 1200);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || 'Registrasi gagal. Email mungkin sudah terdaftar.';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-glow mb-2">
            <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
              <Ticket className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Buat Akun Eventix</h1>
          <p className="text-xs sm:text-sm text-gray-400">Pilih tipe akun dan mulailah menikmati atau menyelenggarakan konser</p>
        </div>

        {/* Card Form */}
        <div className="p-8 rounded-3xl glass-card border border-surface-border/80 shadow-2xl space-y-6">
          
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-3 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-3 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Role Switcher */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Daftar Sebagai</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'USER' })}
                className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  formData.role === 'USER'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-glow'
                    : 'bg-surface-input border-surface-border text-gray-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                Penonton / Pengunjung
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'ORGANIZER' })}
                className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  formData.role === 'ORGANIZER'
                    ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-glow'
                    : 'bg-surface-input border-surface-border text-gray-400 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Organizer Event
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                {formData.role === 'ORGANIZER' ? 'Nama Penyelenggara / Kontak' : 'Nama Lengkap'}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={formData.role === 'ORGANIZER' ? 'mis. PT Nada Promosindo' : 'mis. Budi Santoso'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-input border border-surface-border text-white placeholder-gray-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-input border border-surface-border text-white placeholder-gray-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Phone Number Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Nomor Telepon / WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="081234567890"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-input border border-surface-border text-white placeholder-gray-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Kata Sandi (Min. 6 Karakter)</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-input border border-surface-border text-white placeholder-gray-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-glow text-white text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                <>
                  <span>Daftar Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-surface-border text-xs text-gray-400">
            Sudah memiliki akun?{' '}
            <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Masuk di sini
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
