/**
 * Repository interfaces (ports).
 *
 * Infrastructure provides concrete implementations.
 * Use cases depend only on these contracts.
 */

import { User, UserRole } from '../entities/User';
import { Booking, BookingStatus } from '../entities/Booking';
import { Business } from '../entities/Business';
import { Service } from '../entities/Service';

// --- Pagination ---

export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// --- User ---

export interface IUserRepository {
    create(user: User): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByGoogleId(googleId: string): Promise<User | null>;
    findAll(params: PaginationParams, role?: UserRole): Promise<PaginatedResult<User>>;
    update(id: string, data: Partial<User>): Promise<User>;
    delete(id: string): Promise<void>;
    updateRefreshToken(id: string, token: string | null): Promise<void>;
}

// --- Business ---

export interface IBusinessRepository {
    create(business: Business): Promise<Business>;
    findById(id: string): Promise<Business | null>;
    findBySlug(slug: string): Promise<Business | null>;
    findByOwner(ownerId: string): Promise<Business[]>;
    update(id: string, data: Partial<Business>): Promise<Business>;
    delete(id: string): Promise<void>;
}

// --- Service ---

export interface IServiceRepository {
    create(service: Service): Promise<Service>;
    findById(id: string): Promise<Service | null>;
    findByBusiness(businessId: string): Promise<Service[]>;
    update(id: string, data: Partial<Service>): Promise<Service>;
    delete(id: string): Promise<void>;
}

// --- Booking ---

export interface BookingFilters {
    clientId?: string;
    professionalId?: string;
    businessId?: string;
    status?: BookingStatus;
    dateFrom?: Date;
    dateTo?: Date;
}

export interface IBookingRepository {
    create(booking: Booking): Promise<Booking>;
    findById(id: string): Promise<Booking | null>;
    findAll(params: PaginationParams, filters: BookingFilters): Promise<PaginatedResult<Booking>>;
    findByProfessionalAndDate(professionalId: string, date: Date): Promise<Booking[]>;
    hasConflict(professionalId: string, date: Date, startTime: string, endTime: string): Promise<boolean>;
    update(id: string, data: Partial<Booking>): Promise<Booking>;
    delete(id: string): Promise<void>;
    getStats(businessId: string): Promise<{
        total: number;
        confirmed: number;
        cancelled: number;
        revenue: number;
    }>;
}

// --- Cache ---

export interface ICacheService {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    delete(key: string): Promise<void>;
    deletePattern(pattern: string): Promise<void>;
}

// --- External Services ---

export interface IEmailService {
    sendBookingConfirmation(booking: Booking, clientEmail: string): Promise<void>;
    sendBookingCancellation(booking: Booking, clientEmail: string): Promise<void>;
}

export interface IAIService {
    suggestAvailableSlots(
        professionalId: string,
        date: Date,
        duration: number,
    ): Promise<string[]>;
}
