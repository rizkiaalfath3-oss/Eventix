'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Ticket, 
  Compass, 
  LayoutDashboard, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  Sparkles,
  PlusCircle
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, token, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-surface-border backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-[2px] shadow-glow transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Ticket className="w-6 h-6 text-indigo-400 group-hover:text-purple-300 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                EVENT<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">IX</span>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
              </span>
              <span className="text-[10px] text-gray-400 tracking-wider uppercase font-medium">Concert Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/') 
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                  : 'text-gray-300 hover:text-white hover:bg-surface-hover'
              }`}
            >
              <Compass className="w-4 h-4" />
              Jelajahi Konser
            </Link>

            {user && (
              <Link
                href="/my-tickets"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/my-tickets') 
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
                    : 'text-gray-300 hover:text-white hover:bg-surface-hover'
                }`}
              >
                <Ticket className="w-4 h-4" />
                Tiket Saya
              </Link>
            )}

            {user && (user.role === 'ORGANIZER' || user.role === 'ADMIN') && (
              <Link
                href="/dashboard/organizer"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/dashboard/organizer') 
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                    : 'text-gray-300 hover:text-white hover:bg-surface-hover'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard Organizer
              </Link>
            )}

            {user && user.role === 'ADMIN' && (
              <Link
                href="/dashboard/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/dashboard/admin') 
                    ? 'bg-pink-600/20 text-pink-300 border border-pink-500/30' 
                    : 'text-gray-300 hover:text-white hover:bg-surface-hover'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-pink-400" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* Desktop Right Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {token && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-full bg-surface-card border border-surface-border hover:border-indigo-500/40 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-500/20">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-200 line-clamp-1 max-w-[120px]">{user.name}</span>
                    <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold">
                      {user.role}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#111827] border border-surface-border shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-surface-border">
                      <p className="text-xs text-gray-400">Masuk sebagai</p>
                      <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                        {user.role} {user.isVerified ? '✓ Terverifikasi' : ''}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/my-tickets"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-surface-hover"
                      >
                        <Ticket className="w-4 h-4 text-indigo-400" />
                        Tiket Saya
                      </Link>

                      {(user.role === 'ORGANIZER' || user.role === 'ADMIN') && (
                        <Link
                          href="/dashboard/organizer"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-surface-hover"
                        >
                          <LayoutDashboard className="w-4 h-4 text-purple-400" />
                          Dashboard Organizer
                        </Link>
                      )}

                      {user.role === 'ADMIN' && (
                        <Link
                          href="/dashboard/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-surface-hover"
                        >
                          <ShieldCheck className="w-4 h-4 text-pink-400" />
                          Platform Admin
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-surface-border pt-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30"
                      >
                        <LogOut className="w-4 h-4" />
                        Keluar Akun
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-surface-card transition-all"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  className="relative group overflow-hidden px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-glow transition-all active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Daftar Sekarang
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-card"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-border bg-[#0E1524] px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-gray-200 hover:bg-surface-hover"
          >
            <Compass className="w-5 h-5 text-indigo-400" />
            Jelajahi Konser
          </Link>

          {user && (
            <Link
              href="/my-tickets"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-gray-200 hover:bg-surface-hover"
            >
              <Ticket className="w-5 h-5 text-indigo-400" />
              Tiket Saya
            </Link>
          )}

          {user && (user.role === 'ORGANIZER' || user.role === 'ADMIN') && (
            <Link
              href="/dashboard/organizer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-gray-200 hover:bg-surface-hover"
            >
              <LayoutDashboard className="w-5 h-5 text-purple-400" />
              Dashboard Organizer
            </Link>
          )}

          {user && user.role === 'ADMIN' && (
            <Link
              href="/dashboard/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-gray-200 hover:bg-surface-hover"
            >
              <ShieldCheck className="w-5 h-5 text-pink-400" />
              Admin Panel
            </Link>
          )}

          <div className="border-t border-surface-border pt-3">
            {token && user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 rounded-lg bg-surface-card text-xs text-gray-300">
                  <p className="font-semibold text-white">{user.name}</p>
                  <p className="text-gray-400 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-900/30 text-red-400 font-medium hover:bg-red-900/50"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar Akun
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-surface-card text-white text-sm font-medium"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
