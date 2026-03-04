// ===========================================
// Zod Validation Schemas
// ===========================================

import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    phone: z.string().optional(),
    role: z.enum(['ADMIN', 'PROFESSIONAL', 'CLIENT']).optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

export const createBusinessSchema = z.object({
    name: z.string().min(2, 'Business name must be at least 2 characters').max(200),
    description: z.string().max(1000).optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().max(2).optional(),
});

export const createServiceSchema = z.object({
    name: z.string().min(2, 'Service name must be at least 2 characters'),
    description: z.string().max(500).optional(),
    duration: z.number().min(5, 'Minimum 5 minutes').max(480, 'Maximum 8 hours'),
    price: z.number().min(0, 'Price cannot be negative'),
    businessId: z.string().uuid('Invalid business ID'),
});

export const createBookingSchema = z.object({
    professionalId: z.string().uuid('Invalid professional ID'),
    serviceId: z.string().uuid('Invalid service ID'),
    businessId: z.string().uuid('Invalid business ID'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be HH:MM'),
    notes: z.string().max(500).optional(),
});

export const updateBookingSchema = z.object({
    status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
    notes: z.string().max(500).optional(),
    cancelReason: z.string().max(500).optional(),
});

export const paginationSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
});
