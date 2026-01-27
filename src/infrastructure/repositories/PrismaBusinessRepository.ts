import prisma from '../database/prisma';
import { Business } from '../../domain/entities/Business';
import { IBusinessRepository } from '../../domain/interfaces/repositories';

export class PrismaBusinessRepository implements IBusinessRepository {
    async create(business: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>): Promise<Business> {
        const created = await prisma.business.create({
            data: {
                name: business.name,
                slug: business.slug,
                description: business.description,
                phone: business.phone,
                email: business.email,
                address: business.address,
                city: business.city,
                state: business.state,
                logoUrl: business.logoUrl,
                isActive: business.isActive,
                ownerId: business.ownerId,
            },
        });
        return this.toDomain(created);
    }

    async findById(id: string): Promise<Business | null> {
        const business = await prisma.business.findUnique({ where: { id } });
        if (!business) return null;
        return this.toDomain(business);
    }

    async findBySlug(slug: string): Promise<Business | null> {
        const business = await prisma.business.findUnique({ where: { slug } });
        if (!business) return null;
        return this.toDomain(business);
    }

    async findByOwner(ownerId: string): Promise<Business[]> {
        const businesses = await prisma.business.findMany({
            where: { ownerId },
            orderBy: { createdAt: 'desc' },
        });
        return businesses.map(this.toDomain);
    }

    async update(id: string, data: Partial<Business>): Promise<Business> {
        const updated = await prisma.business.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                phone: data.phone,
                email: data.email,
                address: data.address,
                city: data.city,
                state: data.state,
                logoUrl: data.logoUrl,
                isActive: data.isActive,
            },
        });
        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await prisma.business.delete({ where: { id } });
    }

    private toDomain(raw: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        phone: string | null;
        email: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        logoUrl: string | null;
        isActive: boolean;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
    }): Business {
        return new Business({
            id: raw.id,
            name: raw.name,
            slug: raw.slug,
            description: raw.description,
            phone: raw.phone,
            email: raw.email,
            address: raw.address,
            city: raw.city,
            state: raw.state,
            logoUrl: raw.logoUrl,
            isActive: raw.isActive,
            ownerId: raw.ownerId,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }
}
