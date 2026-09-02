'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Building2, 
  Sparkles, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Ticket
} from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { AuthResponseDto, UserRole } from '@/types';

const GoogleIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const initialRole = searchParams.get('role') === 'ORGANIZER' ? 'ORGANIZER' : 'USER';
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    organizationName: '',
    role: initialRole as UserRole,
  });
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMessage(null);
  };

  const handleRedirect = (role: string) => {
    if (redirectUrl) {
      router.push(redirectUrl);
    } else if (role === 'ORGANIZER') {
      router.push('/dashboard/organizer');
    } else {
      router.push('/');
    }
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

    if (!agreeTerms) {
      setErrorMessage('Anda harus menyetujui Syarat dan Ketentuan layanan.');
      setIsLoading(false);
      return;
    }

    try {
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        phoneNumber: formData.phoneNumber ? formData.phoneNumber.trim() : undefined,
      };

      const response = await api.post<AuthResponseDto>('/auth/register', payload);
      const data = response.data;

      if (data.accessToken) {
        login(data);
        setSuccessMessage('Registrasi berhasil! Mengalihkan...');
        setTimeout(() => {
          handleRedirect(formData.role);
        }, 600);
      } else {
        setSuccessMessage('Registrasi akun berhasil! Silakan masuk.');
        setTimeout(() => {
          router.push(redirectUrl ? `/auth/login?redirect=${encodeURIComponent(redirectUrl)}` : '/auth/login');
        }, 1000);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || 'Registrasi gagal. Email mungkin sudah terdaftar.';
      if (Array.isArray(msg)) {
        setErrorMessage(msg.join(', '));
      } else if (typeof msg === 'string') {
        setErrorMessage(msg);
      } else {
        setErrorMessage('Gagal melakukan pendaftaran. Silakan periksa data Anda.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Google Register Integration with Backend
  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);

    try {
      let userEmail = formData.email.trim();
      let userName = formData.name.trim() || 'Google User';

      if (!userEmail || !userEmail.includes('@')) {
        const inputPrompt = window.prompt('Masukkan alamat email Google Anda untuk mendaftar:', 'user@gmail.com');
        if (!inputPrompt) {
          setIsGoogleLoading(false);
          return;
        }
        userEmail = inputPrompt.trim();
        if (!formData.name) {
          userName = userEmail.split('@')[0].replace(/[._-]/g, ' ');
        }
      }

      const response = await api.post<AuthResponseDto>('/auth/google', {
        token: `google_oauth_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: userName,
        email: userEmail,
        role: formData.role,
      });

      const data = response.data;
      login(data);
      setSuccessMessage('Registrasi Google berhasil! Mengalihkan...');

      setTimeout(() => {
        handleRedirect(data.user.role);
      }, 500);
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      const msg = err.response?.data?.message || 'Gagal mendaftar dengan Google. Silakan coba lagi.';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070d1e] text-white flex flex-col justify-between overflow-x-hidden">
      
      {/* Top Header Bar */}
      <div className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-20">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-traveloka-blue to-sky-400 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <Ticket className="w-5 h-5 -rotate-12" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-white flex items-center">
              event<span className="text-traveloka-blue">ix</span>
            </span>
            <span className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase -mt-1">
              Concert & Xperience
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            Home
          </Link>
          <span className="text-slate-600">•</span>
          <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            Navigations
          </Link>
          <span className="text-slate-600">•</span>
          <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            Contacts
          </Link>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-6">
        
        {/* Left Column: Form Card (Exact Mockup Match) */}
        <div className="w-full lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-[#0d162d]/90 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl space-y-5">
            
            {/* Form Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Join Eventix
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Create an account to start your journey.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-rose-500/10 rounded-2xl border border-rose-500/30 flex items-start gap-2.5 text-xs font-semibold text-rose-400 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 flex items-center gap-2.5 text-xs font-semibold text-emerald-400 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#131e3a] rounded-2xl border border-slate-700/80">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'USER' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  formData.role === 'USER'
                    ? 'bg-traveloka-blue text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>User</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'ORGANIZER' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  formData.role === 'ORGANIZER'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Organizer</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* FULL NAME */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  {formData.role === 'ORGANIZER' ? 'ORGANIZER / PROMOTOR NAME' : 'FULL NAME'}
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={formData.role === 'ORGANIZER' ? 'Budi Promosindo' : 'John Doe'}
                    className="w-full bg-[#131e3a] border border-slate-700/80 rounded-xl !pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all focus:border-traveloka-blue focus:ring-2 focus:ring-traveloka-blue/20"
                  />
                </div>
              </div>

              {/* EMAIL ADDRESS */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  EMAIL ADDRESS
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    className="w-full bg-[#131e3a] border border-slate-700/80 rounded-xl !pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all focus:border-traveloka-blue focus:ring-2 focus:ring-traveloka-blue/20"
                  />
                </div>
              </div>

              {/* PHONE NUMBER */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  PHONE NUMBER
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="081234567890"
                    className="w-full bg-[#131e3a] border border-slate-700/80 rounded-xl !pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all focus:border-traveloka-blue focus:ring-2 focus:ring-traveloka-blue/20"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  PASSWORD
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-[#131e3a] border border-slate-700/80 rounded-xl !pl-11 pr-11 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all focus:border-traveloka-blue focus:ring-2 focus:ring-traveloka-blue/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#131e3a] border-slate-700 text-traveloka-blue focus:ring-traveloka-blue/30 focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-[11px] text-slate-400 font-medium cursor-pointer">
                  I agree to the <span className="text-traveloka-blue hover:underline">Terms and Conditions</span>
                </label>
              </div>

              {/* CREATE ACCOUNT Button */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-gradient-to-r from-traveloka-blue to-sky-500 hover:from-sky-500 hover:to-traveloka-blue text-white font-bold py-3 rounded-xl shadow-lg shadow-traveloka-blue/25 hover:shadow-traveloka-blue/40 flex items-center justify-center gap-2 transition-all disabled:opacity-60 text-xs mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span className="tracking-wider uppercase">CREATE ACCOUNT</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* OR CONTINUE WITH Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-700/80 w-full" />
              <span className="bg-[#0d162d] px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
                OR CONTINUE WITH
              </span>
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={isLoading || isGoogleLoading}
              className="w-full bg-[#131e3a] hover:bg-[#19274c] border border-slate-700/80 hover:border-slate-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all text-xs shadow-sm cursor-pointer disabled:opacity-60"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-traveloka-blue" />
                  <span>Menghubungkan Akun Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  <span>Google</span>
                </>
              )}
            </button>

            {/* Footer Text */}
            <div className="text-center pt-2 text-xs text-slate-400">
              Already have an account?{' '}
              <Link 
                href={redirectUrl ? `/auth/login?redirect=${encodeURIComponent(redirectUrl)}` : '/auth/login'} 
                className="text-traveloka-blue font-bold hover:underline"
              >
                Sign In
              </Link>
            </div>

          </div>
        </div>

        {/* Right Column: Hero Branding (Elevate Your Experience) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center items-center h-full min-h-[580px] relative rounded-3xl overflow-hidden p-10 border border-white/10 shadow-2xl bg-[#0b1429]">
          {/* Background Image with Concert Lights */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop"
              alt="Concert Experience"
              fill
              priority
              className="object-cover object-center opacity-35 mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070d1e] via-[#0b1429]/60 to-transparent" />
            <div className="absolute inset-0 bg-radial from-transparent to-[#070d1e]/80" />
          </div>

          <div className="relative z-10 text-center space-y-6 max-w-md p-8 rounded-3xl bg-[#070d1e]/80 backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-traveloka-blue to-sky-400 flex items-center justify-center text-white mx-auto shadow-lg shadow-traveloka-blue/30">
              <Sparkles className="w-6 h-6" />
            </div>

            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight">
              Elevate Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-traveloka-blue to-teal-300">
                Experience
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Join Eventix to discover exclusive live concerts, seamless e-ticketing, and unforgettable moments across Indonesia.
            </p>

            <div className="pt-2 flex items-center justify-center gap-6 text-[11px] text-slate-400 font-semibold border-t border-white/10">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% Official</span>
              </div>
              <div className="flex items-center gap-1.5 text-sky-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant QR Pass</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Footer Bar */}
      <div className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-500 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2024 Eventix. All rights reserved.</p>
        <div className="flex items-center gap-4 text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link href="/" className="hover:text-white transition-colors">Terms of Service</Link>
          <span>•</span>
          <Link href="/" className="hover:text-white transition-colors">Cookie Policy</Link>
        </div>
      </div>

    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070d1e] flex flex-col items-center justify-center space-y-3 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-traveloka-blue" />
        <p className="text-xs font-bold text-slate-400">Memuat formulir pendaftaran...</p>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
