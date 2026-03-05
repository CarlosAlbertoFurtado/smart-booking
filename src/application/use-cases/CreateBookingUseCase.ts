import { Booking, BookingStatus } from '../../domain/entities/Booking';
import { IBookingRepository, IServiceRepository, ICacheService } from '../../domain/interfaces/repositories';
import { CreateBookingDTO } from '../dtos';
import { NotFoundError, AppError } from '../../shared/errors/AppError';

export class CreateBookingUseCase {
    constructor(
        private bookingRepository: IBookingRepository,
        private serviceRepository: IServiceRepository,
        private cacheService: ICacheService,
    ) { }

    async execute(clientId: string, dto: CreateBookingDTO): Promise<Booking> {
        const service = await this.serviceRepository.findById(dto.serviceId);
        if (!service || !service.isActive) {
            throw new NotFoundError('Service');
        }

        // calculate end time from service duration
        const [hours, mins] = dto.startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + mins + service.duration;
        const endTime = `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`;

        const hasConflict = await this.bookingRepository.hasConflict(
            dto.professionalId, new Date(dto.date), dto.startTime, endTime,
        );
        if (hasConflict) {
            throw new AppError('Time slot is already booked', 409);
        }

        const booking = new Booking({
            clientId,
            professionalId: dto.professionalId,
            serviceId: dto.serviceId,
            businessId: dto.businessId,
            date: new Date(dto.date),
            startTime: dto.startTime,
            endTime,
            status: BookingStatus.PENDING,
            notes: dto.notes,
        });

        const created = await this.bookingRepository.create(booking);

        // bust cache so dashboard reflects the new booking
        await this.cacheService.deletePattern(`bookings:${dto.professionalId}:*`);

        return created;
    }
}
