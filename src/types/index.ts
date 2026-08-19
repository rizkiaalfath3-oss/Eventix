export type UserRole = 'ADMIN' | 'ORGANIZER' | 'USER';
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
export type RegistrationStatus = 'PENDING_PAYMENT' | 'PAYMENT_SUBMITTED' | 'VERIFIED' | 'REJECTED' | 'CANCELLED';
export type PaymentMethodType = 'BANK' | 'EWALLET';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  isVerified: boolean;
  organizationName?: string | null;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  quota: number;
  soldQuota: number;
  eventId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  isActive: boolean;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: string;
  ticketCode: string;
  status: RegistrationStatus;
  quantity: number;
  totalPrice: number;
  paymentProofUrl?: string | null;
  rejectionReason?: string | null;
  verifiedAt?: string | null;
  userId: string;
  user?: User;
  eventId: string;
  event?: Event;
  ticketTierId?: string | null;
  ticketTier?: TicketTier | null;
  paymentMethodId?: string | null;
  paymentMethod?: PaymentMethod | null;
  qrCodeUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  price: number;
  quota: number;
  bannerUrl?: string | null;
  isApproved: boolean;
  status: EventStatus;
  organizerId: string;
  organizer?: User;
  ticketTiers?: TicketTier[];
  registrations?: Registration[];
  createdAt: string;
  updatedAt: string;
}

// DTOs
export interface AuthResponseDto {
  message: string;
  user: User;
  accessToken: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phoneNumber?: string;
}

export interface GoogleLoginDto {
  token: string;
  name?: string;
  email?: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  organizationName?: string;
  bio?: string;
}

export interface CreateTicketTierDto {
  name: string;
  price: number;
  quota: number;
}

export interface UpdateTicketTierDto {
  name?: string;
  price?: number;
  quota?: number;
}

export interface VerifyPaymentDto {
  action: 'APPROVE' | 'REJECT';
  rejectionReason?: string;
}

export interface CreatePaymentMethodDto {
  type: PaymentMethodType;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  isActive?: boolean;
}

export interface UpdatePaymentMethodDto {
  type?: PaymentMethodType;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  isActive?: boolean;
}

export interface OrganizerStatsResponseDto {
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
}

export interface AdminStatsResponseDto {
  totalUsers: number;
  totalOrganizers: number;
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
}
