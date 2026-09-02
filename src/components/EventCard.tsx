import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  ShieldCheck, 
  ArrowRight, 
  Star, 
  CheckCircle2, 
  Clock, 
  Users,
  Sparkles
} from 'lucide-react';
import { Event } from '@/types';
import { formatIDR, formatDateShort, getImageUrl } from '@/lib/utils';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const lowestPrice = event.ticketTiers && event.ticketTiers.length > 0
    ? Math.min(...event.ticketTiers.map(t => t.price))
    : event.price;

  const totalQuota = event.ticketTiers && event.ticketTiers.length > 0
    ? event.ticketTiers.reduce((acc, t) => acc + t.quota, 0)
    : event.quota;

  const totalSold = event.ticketTiers && event.ticketTiers.length > 0
    ? event.ticketTiers.reduce((acc, t) => acc + (t.soldQuota || 0), 0)
    : (event.registrations ? event.registrations.length : 0);

  const remainingQuota = Math.max(0, totalQuota - totalSold);
  const bannerSrc = getImageUrl(event.bannerUrl);
  const isCompleted = event.status === 'COMPLETED';
  const isCancelled = event.status === 'CANCELLED';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between">
      
      {/* Top Banner Image with Badges */}
      <div className="relative w-full h-52 overflow-hidden bg-slate-100">
        <Image
          src={bannerSrc}
          alt={event.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          unoptimized={bannerSrc.startsWith('http')}
        />

        {/* Gradient Overlay for Top Badges */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Date Badge (Left Top) */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-traveloka-navy text-xs font-bold shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-traveloka-blue" />
            {formatDateShort(event.startDate)}
          </span>
        </div>

        {/* Status / Category Badge (Right Top) */}
        <div className="absolute top-3 right-3">
          {event.status === 'PUBLISHED' && remainingQuota > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-bold shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
              Tersedia
            </span>
          )}
          {remainingQuota === 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-white text-[11px] font-bold shadow-sm">
              Habis
            </span>
          )}
          {isCancelled && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold shadow-sm">
              Dibatalkan
            </span>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-600 text-white text-[11px] font-bold shadow-sm">
              Selesai
            </span>
          )}
        </div>

        {/* Bottom tags in image */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-traveloka-yellow" />
            Konfirmasi Instan
          </span>
        </div>
      </div>

      {/* Card Body Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Organizer / Verified Partner info */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-traveloka-blue truncate max-w-[170px] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-traveloka-blue flex-shrink-0" />
              {event.organizer?.organizationName || event.organizer?.name || 'Official Promotor'}
            </span>

            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>4.9</span>
            </div>
          </div>

          {/* Event Title */}
          <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-traveloka-blue transition-colors">
            {event.title}
          </h3>

          {/* Location & Venue */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate pt-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>

          {/* Tier & Quota info */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
              {event.ticketTiers && event.ticketTiers.length > 1 
                ? `${event.ticketTiers.length} Kategori Tiket` 
                : 'Tiket Standar'}
            </span>

            <span className="text-[11px] text-slate-500 font-medium">
              Sisa: <strong className="text-slate-800 font-bold">{remainingQuota}</strong>
            </span>
          </div>
        </div>

        {/* Pricing & CTA Section (Traveloka Style) */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">
              Mulai dari
            </span>
            <span className="text-lg font-extrabold text-traveloka-orange tracking-tight">
              {formatIDR(lowestPrice)}
            </span>
          </div>

          <Link
            href={`/events/${event.id}`}
            className="traveloka-btn-orange text-xs px-4 py-2 font-bold group-hover:shadow-md"
          >
            <span>Pilih</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
};

export default EventCard;
