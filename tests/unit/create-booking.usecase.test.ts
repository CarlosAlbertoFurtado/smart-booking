import { CreateBookingUseCase } from '../../src/application/use-cases/CreateBookingUseCase';
import { BookingStatus } from '../../src/domain/entities/Booking';
import { AppError, NotFoundError } from '../../src/shared/errors/AppError';

const mockService = {
    id: 'svc-1',
    name: 'Haircut',
    duration: 60,
    price: 50,
    isActive: true,
    businessId: 'biz-1',
};

function makeMocks(overrides?: {
    hasConflict?: boolean;
    serviceResult?: typeof mockService | null;
}) {
    const bookingRepo = {
        create: jest.fn().mockImplementation(b => Promise.resolve({ ...b, id: 'booking-001' })),
        findById: jest.fn(),
        findAll: jest.fn(),
        findByProfessionalAndDate: jest.fn(),
        hasConflict: jest.fn().mockResolvedValue(overrides?.hasConflict ?? false),
        update: jest.fn(),
        delete: jest.fn(),
        getStats: jest.fn(),
    };

    const serviceRepo = {
        create: jest.fn(),
        findById: jest.fn().mockResolvedValue(overrides?.serviceResult ?? mockService),
        findByBusiness: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    const cache = {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
        deletePattern: jest.fn().mockResolvedValue(undefined),
    };

    return { bookingRepo, serviceRepo, cache };
}

describe('CreateBookingUseCase', () => {
    it('creates a booking and busts cache', async () => {
        const { bookingRepo, serviceRepo, cache } = makeMocks();
        const useCase = new CreateBookingUseCase(bookingRepo, serviceRepo, cache);

        const result = await useCase.execute('client-1', {
            professionalId: 'prof-1',
            serviceId: 'svc-1',
            businessId: 'biz-1',
            date: '2026-04-01',
            startTime: '09:00',
        });

        expect(result.id).toBe('booking-001');
        expect(result.status).toBe(BookingStatus.PENDING);
        expect(result.endTime).toBe('10:00'); // 09:00 + 60 min
        expect(bookingRepo.create).toHaveBeenCalledTimes(1);
        expect(cache.deletePattern).toHaveBeenCalledWith('bookings:prof-1:*');
    });

    it('throws when service is not found', async () => {
        const { bookingRepo, serviceRepo, cache } = makeMocks({ serviceResult: null });
        const useCase = new CreateBookingUseCase(bookingRepo, serviceRepo, cache);

        await expect(
            useCase.execute('client-1', {
                professionalId: 'prof-1',
                serviceId: 'missing',
                businessId: 'biz-1',
                date: '2026-04-01',
                startTime: '09:00',
            }),
        ).rejects.toThrow(NotFoundError);
    });

    it('throws when service is inactive', async () => {
        const { bookingRepo, serviceRepo, cache } = makeMocks({
            serviceResult: { ...mockService, isActive: false },
        });
        const useCase = new CreateBookingUseCase(bookingRepo, serviceRepo, cache);

        await expect(
            useCase.execute('client-1', {
                professionalId: 'prof-1',
                serviceId: 'svc-1',
                businessId: 'biz-1',
                date: '2026-04-01',
                startTime: '09:00',
            }),
        ).rejects.toThrow(NotFoundError);
    });

    it('throws on time conflict', async () => {
        const { bookingRepo, serviceRepo, cache } = makeMocks({ hasConflict: true });
        const useCase = new CreateBookingUseCase(bookingRepo, serviceRepo, cache);

        await expect(
            useCase.execute('client-1', {
                professionalId: 'prof-1',
                serviceId: 'svc-1',
                businessId: 'biz-1',
                date: '2026-04-01',
                startTime: '09:00',
            }),
        ).rejects.toThrow(AppError);
    });

    it('computes end time correctly for 90 min service', async () => {
        const { bookingRepo, serviceRepo, cache } = makeMocks({
            serviceResult: { ...mockService, duration: 90 },
        });
        const useCase = new CreateBookingUseCase(bookingRepo, serviceRepo, cache);

        const result = await useCase.execute('client-1', {
            professionalId: 'prof-1',
            serviceId: 'svc-1',
            businessId: 'biz-1',
            date: '2026-04-01',
            startTime: '14:30',
        });

        expect(result.endTime).toBe('16:00'); // 14:30 + 90 min
    });

    it('computes end time correctly crossing the hour mark', async () => {
        // serviço de 45 min começando em 10:30 deve terminar em 11:15
        const { bookingRepo, serviceRepo, cache } = makeMocks({
            serviceResult: { ...mockService, duration: 45 },
        });
        const useCase = new CreateBookingUseCase(bookingRepo, serviceRepo, cache);

        const result = await useCase.execute('client-1', {
            professionalId: 'prof-1',
            serviceId: 'svc-1',
            businessId: 'biz-1',
            date: '2026-04-01',
            startTime: '10:30',
        });

        expect(result.endTime).toBe('11:15');
    });

    // TODO: testar agendamento que cruza meia-noite (tipo serviço 23:30 + 90min)
    // por enquanto o sistema nem aceita horário depois das 20h, mas se mudar...
});

describe('CancelBookingUseCase', () => {
    // preciso implementar o cancelamento com reembolso antes de testar
    it.todo('should cancel and notify client by email');
    it.todo('should not cancel if booking already completed');
});
