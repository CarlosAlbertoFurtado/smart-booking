import { BookingStatus } from '../../domain/entities/Booking';
import { UserRole } from '../../domain/entities/User';

// --- Auth ---

export interface RegisterDTO {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: UserRole;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface AuthResponseDTO {
    user: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
    };
    accessToken: string;
    refreshToken: string;
}

// --- Business ---

export interface CreateBusinessDTO {
    name: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
}

export interface UpdateBusinessDTO {
    name?: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    isActive?: boolean;
}

// --- Service ---

export interface CreateServiceDTO {
    name: string;
    description?: string;
    duration: number;
    price: number;
    businessId: string;
}

export interface UpdateServiceDTO {
    name?: string;
    description?: string;
    duration?: number;
    price?: number;
    isActive?: boolean;
}

// --- Booking ---

export interface CreateBookingDTO {
    professionalId: string;
    serviceId: string;
    businessId: string;
    date: string;
    startTime: string;
    notes?: string;
}

export interface UpdateBookingDTO {
    status?: BookingStatus;
    notes?: string;
    cancelReason?: string;
}

// --- Query ---

export interface PaginationQueryDTO {
    page?: number;
    limit?: number;
}

export interface BookingQueryDTO extends PaginationQueryDTO {
    status?: BookingStatus;
    dateFrom?: string;
    dateTo?: string;
    professionalId?: string;
}
