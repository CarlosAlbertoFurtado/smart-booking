import { Booking, BookingStatus } from '../../src/domain/entities/Booking';

describe('Booking', () => {
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

    it('creates valid booking', () => {
        const booking = new Booking(validProps);
        expect(booking.clientId).toBe('123');
        expect(booking.startTime).toBe('09:00');
        expect(booking.status).toBe(BookingStatus.PENDING);
    });

    it('rejects invalid start time', () => {
        expect(() => new Booking({ ...validProps, startTime: '25:00' })).toThrow('Invalid start time');
    });

    it('rejects start >= end', () => {
        expect(() => new Booking({ ...validProps, startTime: '11:00', endTime: '10:00' })).toThrow('before end time');
    });

    it('calculates duration', () => {
        expect(new Booking(validProps).getDurationInMinutes()).toBe(60);
    });

    it('detects time conflicts', () => {
        const booking = new Booking(validProps); // 09:00-10:00
        expect(booking.conflictsWith('09:30', '10:30')).toBe(true);
        expect(booking.conflictsWith('10:00', '11:00')).toBe(false);
        expect(booking.conflictsWith('08:00', '09:00')).toBe(false);
        expect(booking.conflictsWith('08:00', '09:30')).toBe(true);
    });

    it('checks cancellation eligibility', () => {
        expect(new Booking({ ...validProps, status: BookingStatus.PENDING }).canBeCancelled()).toBe(true);
        expect(new Booking({ ...validProps, status: BookingStatus.CONFIRMED }).canBeCancelled()).toBe(true);
        expect(new Booking({ ...validProps, status: BookingStatus.COMPLETED }).canBeCancelled()).toBe(false);
    });

    it('checks completion eligibility', () => {
        expect(new Booking({ ...validProps, status: BookingStatus.CONFIRMED }).canBeCompleted()).toBe(true);
        expect(new Booking({ ...validProps, status: BookingStatus.PENDING }).canBeCompleted()).toBe(false);
    });

    it('equal start and end time is invalid', () => {
        expect(() => new Booking({ ...validProps, startTime: '10:00', endTime: '10:00' })).toThrow();
    });
});
