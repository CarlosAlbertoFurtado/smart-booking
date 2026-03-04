// ===========================================
// Repository Interfaces (Ports)
// These define the contracts for data access
// Infrastructure layer implements these
// ===========================================

import { User, UserRole } from '../entities/User';

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

// ---- User Repository ----
export interface IUserRepository {
    create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByGoogleId(googleId: string): Promise<User | null>;
    findAll(params: PaginationParams & { role?: UserRole }): Promise<PaginatedResult<User>>;
    update(id: string, data: Partial<User>): Promise<User>;
    delete(id: string): Promise<void>;
    updateRefreshToken(id: string, token: string | null): Promise<void>;
}

// ---- Business Repository ----
import { Business } from '../entities/Business';

export interface IBusinessRepository {
    create(business: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>): Promise<Business>;
    findById(id: string): Promise<Business | null>;
    findBySlug(slug: string): Promise<Business | null>;
    findByOwnerId(ownerId: string): Promise<Business[]>;
    findAll(params: PaginationParams & { city?: string; isActive?: boolean }): Promise<PaginatedResult<Business>>;
    update(id: string, data: Partial<Business>): Promise<Business>;
    delete(id: string): Promise<void>;
}

// ---- Service Repository ----
import { Service } from '../entities/Service';

export interface IServiceRepository {
    create(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service>;
    findById(id: string): Promise<Service | null>;
    findByBusinessId(businessId: string, activeOnly?: boolean): Promise<Service[]>;
    update(id: string, data: Partial<Service>): Promise<Service>;
    delete(id: string): Promise<void>;
}

// ---- Booking Repository ----
import { Booking, BookingStatus } from '../entities/Booking';

export interface BookingFilters {
    businessId?: string;
    professionalId?: string;
    clientId?: string;
    status?: BookingStatus;
    dateFrom?: Date;
    dateTo?: Date;
}

export interface IBookingRepository {
    create(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking>;
    findById(id: string): Promise<Booking | null>;
    findAll(params: PaginationParams & BookingFilters): Promise<PaginatedResult<Booking>>;
    findByProfessionalAndDate(professionalId: string, date: Date): Promise<Booking[]>;
    findConflicting(professionalId: string, date: Date, startTime: string, endTime: string, excludeId?: string): Promise<Booking[]>;
    update(id: string, data: Partial<Booking>): Promise<Booking>;
    delete(id: string): Promise<void>;
    getStats(businessId: string, dateFrom: Date, dateTo: Date): Promise<{
        totalBookings: number;
        completed: number;
        cancelled: number;
        noShows: number;
        revenue: number;
    }>;
}

// ---- Cache Interface ----
export interface ICacheService {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
    delete(key: string): Promise<void>;
    deletePattern(pattern: string): Promise<void>;
}

// ---- Email Interface ----
export interface IEmailService {
    sendBookingConfirmation(to: string, booking: {
        serviceName: string;
        professionalName: string;
        businessName: string;
        date: string;
        time: string;
    }): Promise<void>;
    sendBookingCancellation(to: string, booking: {
        serviceName: string;
        date: string;
        time: string;
        reason?: string;
    }): Promise<void>;
    sendBookingReminder(to: string, booking: {
        serviceName: string;
        professionalName: string;
        date: string;
        time: string;
    }): Promise<void>;
}

// ---- AI Service Interface ----
export interface IAIService {
    suggestOptimalSlots(params: {
        businessId: string;
        serviceId: string;
        professionalId: string;
        preferredDate: Date;
        existingBookings: Booking[];
        workingHours: { startTime: string; endTime: string };
    }): Promise<{ time: string; score: number; reason: string }[]>;
}
