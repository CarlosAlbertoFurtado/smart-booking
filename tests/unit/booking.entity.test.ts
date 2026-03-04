// ===========================================
// Unit Test: Booking Entity
// ===========================================

import { Booking, BookingStatus } from '../../src/domain/entities/Booking';

describe('Booking Entity', () => {
    const validProps = {
        clientId: '123',
        professionalId: '456',
        serviceId: '789',
        businessId: 'biz-1',
        date: new Date('2026-03-10'),
        startTime: '09:00',
        endTime: '10:00',
        status: BookingStatus.PENDING,
    };

    it('should create a valid booking', () => {
        const booking = new Booking(validProps);
        expect(booking.clientId).toBe('123');
        expect(booking.startTime).toBe('09:00');
        expect(booking.status).toBe(BookingStatus.PENDING);
    });

    it('should throw error for invalid start time format', () => {
        expect(() => new Booking({ ...validProps, startTime: '25:00' })).toThrow('Invalid start time');
    });

    it('should throw error when start time is after end time', () => {
        expect(() => new Booking({ ...validProps, startTime: '11:00', endTime: '10:00' })).toThrow('Start time must be before end time');
    });

    it('should calculate duration in minutes', () => {
        const booking = new Booking(validProps);
        expect(booking.getDurationInMinutes()).toBe(60);
    });

    it('should detect time conflicts', () => {
        const booking = new Booking(validProps); // 09:00 - 10:00
        expect(booking.conflictsWith('09:30', '10:30')).toBe(true);  // overlap
        expect(booking.conflictsWith('10:00', '11:00')).toBe(false); // adjacent, no overlap
        expect(booking.conflictsWith('08:00', '09:00')).toBe(false); // before
        expect(booking.conflictsWith('08:00', '09:30')).toBe(true);  // partial overlap
    });

    it('should check cancellation eligibility', () => {
        const pending = new Booking({ ...validProps, status: BookingStatus.PENDING });
        const confirmed = new Booking({ ...validProps, status: BookingStatus.CONFIRMED });
        const completed = new Booking({ ...validProps, status: BookingStatus.COMPLETED });

        expect(pending.canBeCancelled()).toBe(true);
        expect(confirmed.canBeCancelled()).toBe(true);
        expect(completed.canBeCancelled()).toBe(false);
    });

    it('should check completion eligibility', () => {
        const confirmed = new Booking({ ...validProps, status: BookingStatus.CONFIRMED });
        const pending = new Booking({ ...validProps, status: BookingStatus.PENDING });

        expect(confirmed.canBeCompleted()).toBe(true);
        expect(pending.canBeCompleted()).toBe(false);
    });
});
