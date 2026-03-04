// ===========================================
// Use Case: Create Booking
// Handles all business logic for creating appointments
// ===========================================

import { Booking, BookingStatus } from '../../domain/entities/Booking';
import { IBookingRepository, IServiceRepository, ICacheService } from '../../domain/interfaces/repositories';
import { CreateBookingDTO } from '../dtos';
import { ConflictError, NotFoundError, AppError } from '../../shared/errors/AppError';

export class CreateBookingUseCase {
    constructor(
        private bookingRepository: IBookingRepository,
        private serviceRepository: IServiceRepository,
        private cacheService: ICacheService,
    ) { }

    async execute(clientId: string, dto: CreateBookingDTO): Promise<Booking> {
        // 1. Validate service exists
        const service = await this.serviceRepository.findById(dto.serviceId);
        if (!service) {
            throw new NotFoundError('Service');
        }
        if (!service.isActive) {
            throw new AppError('This service is currently unavailable');
        }

        // 2. Calculate end time based on service duration
        const endTime = this.calculateEndTime(dto.startTime, service.duration);

        // 3. Check for scheduling conflicts
        const bookingDate = new Date(dto.date);
        const conflicts = await this.bookingRepository.findConflicting(
            dto.professionalId,
            bookingDate,
            dto.startTime,
            endTime,
        );

        if (conflicts.length > 0) {
            throw new ConflictError(
                'This time slot is already booked. Please choose a different time.',
            );
        }

        // 4. Create the booking
        const booking = new Booking({
            clientId,
            professionalId: dto.professionalId,
            serviceId: dto.serviceId,
            businessId: dto.businessId,
            date: bookingDate,
            startTime: dto.startTime,
            endTime,
            status: BookingStatus.PENDING,
            notes: dto.notes,
        });

        const created = await this.bookingRepository.create(booking);

        // 5. Invalidate cache for this professional's schedule
        await this.cacheService.deletePattern(
            `bookings:${dto.professionalId}:*`,
        );

        return created;
    }

    private calculateEndTime(startTime: string, durationMinutes: number): string {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + durationMinutes;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    }
}
