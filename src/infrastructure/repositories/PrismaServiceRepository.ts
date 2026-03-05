import prisma from '../database/prisma';
import { Service } from '../../domain/entities/Service';
import { IServiceRepository } from '../../domain/interfaces/repositories';

export class PrismaServiceRepository implements IServiceRepository {
    async create(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
        const created = await prisma.service.create({
            data: {
                name: service.name,
                description: service.description,
                duration: service.duration,
                price: service.price,
                isActive: service.isActive,
                businessId: service.businessId,
            },
        });
        return this.toDomain(created);
    }

    async findById(id: string): Promise<Service | null> {
        const service = await prisma.service.findUnique({ where: { id } });
        if (!service) return null;
        return this.toDomain(service);
    }

    async findByBusinessId(businessId: string, activeOnly = true): Promise<Service[]> {
        const where: Record<string, unknown> = { businessId };
        if (activeOnly) where.isActive = true;

        const services = await prisma.service.findMany({
            where,
            orderBy: { name: 'asc' },
        });
        return services.map(this.toDomain);
    }

    async update(id: string, data: Partial<Service>): Promise<Service> {
        const updated = await prisma.service.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                duration: data.duration,
                price: data.price,
                isActive: data.isActive,
            },
        });
        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await prisma.service.delete({ where: { id } });
    }

    private toDomain(raw: {
        id: string;
        name: string;
        description: string | null;
        duration: number;
        price: number;
        isActive: boolean;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
    }): Service {
        return new Service({
            id: raw.id,
            name: raw.name,
            description: raw.description,
            duration: raw.duration,
            price: raw.price,
            isActive: raw.isActive,
            businessId: raw.businessId,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }
}
