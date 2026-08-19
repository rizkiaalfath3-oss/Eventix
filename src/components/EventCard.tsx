import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Ticket, ShieldCheck, ArrowRight, Users } from 'lucide-react';
import { Event } from '@/types';
import { formatIDR, formatDateShort, getImageUrl } from '@/lib/utils';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  // Lowest ticket tier price or base price
  const lowestPrice = event.ticketTiers && event.ticketTiers.length > 0
    ? Math.min(...event.ticketTiers.map(t => t.price))
    : event.price;

  const totalQuota = event.ticketTiers && event.ticketTiers.length > 0
    ? event.ticketTiers.reduce((acc, t) => acc + t.quota, 0)
    : event.quota;

  const totalSold = event.ticketTiers && event.ticketTiers.length > 0
    ? event.ticketTiers.reduce((acc, t) => acc + (t.soldQuota || 0), 0)
    : (event.registrations ? event.registrations.length : 0);

  const bannerSrc = getImageUrl(event.bannerUrl);

  const isCompleted = event.status === 'COMPLETED';
  const isCancelled = event.status === 'CANCELLED';

  return (
    <div className="group relative rounded-3xl overflow-hidden glass-card transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between">
      
      {/* Top Banner Image Container */}
      <div className="relative w-full h-52 overflow-hidden bg-surface-card">
        <Image
          src={bannerSrc}
          alt={event.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          unoptimized={bannerSrc.startsWith('http')}
        />
        
        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-black/40" />

        {/* Date badge on top left */}
        <div className="absolute top-3 left-3 bg-[#0B0F19]/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-white shadow-lg">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>{formatDateShort(event.startDate)}</span>
        </div>

        {/* Status / Approval badge on top right */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
          {event.status === 'PUBLISHED' && (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
              Tersedia
            </span>
          )}
          {isCancelled && (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30 backdrop-blur-md">
              Dibatalkan
            </span>
          )}
          {isCompleted && (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-gray-500/20 text-gray-300 border border-gray-500/30 backdrop-blur-md">
              Selesai
            </span>
          )}
        </div>

        {/* Organizer mini pill */}
        {event.organizer && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-[#0B0F19]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/5 text-[11px] text-gray-300 max-w-[80%] truncate">
            <span className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
              {event.organizer.name.charAt(0)}
            </span>
            <span className="truncate">{event.organizer.organizationName || event.organizer.name}</span>
            {event.organizer.isVerified && (
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            )}
          </div>
        )}
      </div>

      {/* Card Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
            {event.title}
          </h3>
          <p className="mt-1 text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Location & Quota Info */}
        <div className="space-y-2 text-xs text-gray-400 border-t border-surface-border/60 pt-3">
          <div className="flex items-center gap-2 text-gray-300 truncate">
            <MapPin className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sisa Kuota: <strong className="text-gray-200">{Math.max(0, totalQuota - totalSold)}</strong></span>
            </div>
            {event.ticketTiers && event.ticketTiers.length > 1 && (
              <span className="text-[10px] text-purple-400 font-medium px-2 py-0.5 rounded bg-purple-950/40 border border-purple-800/40">
                {event.ticketTiers.length} Kategori Tiket
              </span>
            )}
          </div>
        </div>

        {/* Price & Action footer */}
        <div className="pt-2 flex items-center justify-between border-t border-surface-border/60">
          <div>
            <span className="text-[10px] text-gray-400 block">Mulai dari</span>
            <span className="text-base font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
              {formatIDR(lowestPrice)}
            </span>
          </div>

          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-md group-hover:shadow-glow"
          >
            <Ticket className="w-3.5 h-3.5" />
            Beli Tiket
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

      </div>

    </div>
  );
};

export default EventCard;
