'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Ticket, 
  Sparkles, 
  HelpCircle, 
  Smartphone, 
  ChevronDown, 
  User as UserIcon, 
  LayoutDashboard, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  Flame,
  Music2,
  CheckCircle2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, token, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm transition-all">
      {/* 1. Top Mini Utility Bar */}
      <div className="hidden lg:block bg-traveloka-navy text-white text-xs border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer">
              <Smartphone className="w-3.5 h-3.5 text-traveloka-blue" />
              <span>Download Eventix App</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer">
              <HelpCircle className="w-3.5 h-3.5 text-traveloka-yellow" />
              <span>Pusat Bantuan 24/7</span>
            </div>
            {(!user || user.role === 'USER') && (
              <Link 
                href="/auth/register" 
                className="text-amber-300 font-semibold hover:text-amber-200 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Jadi Mitra Organizer & Jual Tiket</span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Garansi Tiket Resmi & Transaksi Aman</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Left: Brand Logo */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-traveloka-blue to-sky-400 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                  <Ticket className="w-5 h-5 -rotate-12" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black tracking-tight text-traveloka-navy flex items-center">
                    event<span className="text-traveloka-blue">ix</span>
                  </span>
                  <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase -mt-1">
                    Concert & Xperience
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Links - Strict Separation Per Role */}
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/"
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                    isActive('/')
                      ? 'bg-traveloka-sky text-traveloka-blue font-bold'
                      : 'text-slate-600 hover:text-traveloka-blue hover:bg-slate-50'
                  }`}
                >
                  <Music2 className="w-4 h-4" />
                  <span>Jelajahi Konser</span>
                </Link>

                {/* USER ONLY: Tiket Saya */}
                {user && user.role === 'USER' && (
                  <Link
                    href="/my-tickets"
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                      isActive('/my-tickets')
                        ? 'bg-traveloka-sky text-traveloka-blue font-bold'
                        : 'text-slate-600 hover:text-traveloka-blue hover:bg-slate-50'
                    }`}
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Tiket Saya</span>
                  </Link>
                )}

                {/* ORGANIZER ONLY: Mitra Organizer Dashboard */}
                {user && user.role === 'ORGANIZER' && (
                  <Link
                    href="/dashboard/organizer"
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                      isActive('/dashboard/organizer')
                        ? 'bg-traveloka-navy text-white font-bold'
                        : 'text-slate-600 hover:text-traveloka-navy hover:bg-slate-100'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-traveloka-blue" />
                    <span>Dashboard Mitra Organizer</span>
                  </Link>
                )}

                {/* ADMIN ONLY: Admin Portal */}
                {user && user.role === 'ADMIN' && (
                  <Link
                    href="/dashboard/admin"
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${
                      isActive('/dashboard/admin')
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Portal</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* Right: Auth & User Actions */}
            <div className="hidden md:flex items-center gap-3">
              {token && user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-slate-200 bg-white hover:border-traveloka-blue hover:bg-traveloka-sky/30 transition-all text-slate-800 font-semibold text-sm shadow-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-traveloka-blue to-traveloka-navy text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="max-w-[130px] truncate text-slate-800 font-bold">{user.name}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      user.role === 'ADMIN' 
                        ? 'bg-red-100 text-red-700' 
                        : user.role === 'ORGANIZER' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-traveloka-sky text-traveloka-blue'
                    }`}>
                      {user.role}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Dropdown Menu - Strict Per Role */}
                  {dropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-floating border border-slate-100 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <div className="p-3 bg-gradient-to-r from-traveloka-sky/50 to-white rounded-xl mb-2">
                        <p className="text-xs text-slate-500 font-medium">Akun Masuk</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                            user.role === 'ADMIN'
                              ? 'text-red-700 bg-red-50 border-red-200'
                              : user.role === 'ORGANIZER'
                              ? 'text-purple-700 bg-purple-50 border-purple-200'
                              : 'text-traveloka-blue bg-white border-traveloka-blue/20'
                          }`}>
                            Role: {user.role}
                          </span>
                          {user.isVerified && (
                            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Terverifikasi
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        {/* USER ONLY: Tiket & Pesanan Saya */}
                        {user.role === 'USER' && (
                          <Link
                            href="/my-tickets"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-traveloka-sky hover:text-traveloka-blue transition-colors"
                          >
                            <Ticket className="w-4 h-4 text-traveloka-blue" />
                            <span>Tiket & Pesanan Saya</span>
                          </Link>
                        )}

                        {/* ORGANIZER ONLY: Dashboard Mitra Organizer */}
                        {user.role === 'ORGANIZER' && (
                          <Link
                            href="/dashboard/organizer"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-purple-600" />
                            <span>Dashboard Mitra Organizer</span>
                          </Link>
                        )}

                        {/* ADMIN ONLY: Admin Portal */}
                        {user.role === 'ADMIN' && (
                          <Link
                            href="/dashboard/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-red-500" />
                            <span>Admin Portal</span>
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 mt-2 pt-2">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Keluar Akun</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/auth/login"
                    className="traveloka-btn-outline text-xs px-5 py-2"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Masuk</span>
                  </Link>

                  <Link
                    href="/auth/register"
                    className="traveloka-btn-orange text-xs px-5 py-2"
                  >
                    <span>Daftar Sekarang</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-4 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-traveloka-sky hover:text-traveloka-blue"
            >
              <Music2 className="w-4 h-4 text-traveloka-blue" />
              <span>Jelajahi Konser</span>
            </Link>

            {/* USER ONLY: Tiket Saya */}
            {user && user.role === 'USER' && (
              <Link
                href="/my-tickets"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-traveloka-sky hover:text-traveloka-blue"
              >
                <Ticket className="w-4 h-4 text-traveloka-blue" />
                <span>Tiket Saya</span>
              </Link>
            )}

            {/* ORGANIZER ONLY: Dashboard Organizer */}
            {user && user.role === 'ORGANIZER' && (
              <Link
                href="/dashboard/organizer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-purple-700 bg-purple-50"
              >
                <LayoutDashboard className="w-4 h-4 text-purple-600" />
                <span>Dashboard Mitra Organizer</span>
              </Link>
            )}

            {/* ADMIN ONLY: Admin Portal */}
            {user && user.role === 'ADMIN' && (
              <Link
                href="/dashboard/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50"
              >
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span>Admin Portal</span>
              </Link>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4">
            {token && user ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-sm text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    user.role === 'ADMIN' 
                      ? 'bg-red-100 text-red-700' 
                      : user.role === 'ORGANIZER' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-traveloka-sky text-traveloka-blue'
                  }`}>
                    Role: {user.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="traveloka-btn-outline text-xs text-center py-2.5"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="traveloka-btn-orange text-xs text-center py-2.5"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
