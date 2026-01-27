import prisma from '../database/prisma';
import { User, UserRole } from '../../domain/entities/User';
import { IUserRepository, PaginationParams, PaginatedResult } from '../../domain/interfaces/repositories';

export class PrismaUserRepository implements IUserRepository {
    async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const created = await prisma.user.create({
            data: {
                email: user.email,
                password: user.password,
                name: user.name,
                phone: user.phone,
                avatarUrl: user.avatarUrl,
                role: user.role,
                googleId: user.googleId,
                isActive: user.isActive,
            },
        });
        return this.toDomain(created);
    }

    async findById(id: string): Promise<User | null> {
        const user = await prisma.user.findUnique({ where: { id } });
        return user ? this.toDomain(user) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await prisma.user.findUnique({ where: { email } });
        return user ? this.toDomain(user) : null;
    }

    async findByGoogleId(googleId: string): Promise<User | null> {
        const user = await prisma.user.findUnique({ where: { googleId } });
        return user ? this.toDomain(user) : null;
    }

    async findAll(params: PaginationParams & { role?: UserRole }): Promise<PaginatedResult<User>> {
        const { page, limit, role } = params;
        const where = role ? { role } : {};

        const [data, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where }),
        ]);

        return {
            data: data.map(this.toDomain),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        const updated = await prisma.user.update({
            where: { id },
            data: {
                email: data.email,
                password: data.password,
                name: data.name,
                phone: data.phone,
                avatarUrl: data.avatarUrl,
                role: data.role,
                isActive: data.isActive,
            },
        });
        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await prisma.user.delete({ where: { id } });
    }

    async updateRefreshToken(id: string, token: string | null): Promise<void> {
        await prisma.user.update({
            where: { id },
            data: { refreshToken: token },
        });
    }

    private toDomain(raw: {
        id: string;
        email: string;
        password: string | null;
        name: string;
        phone: string | null;
        avatarUrl: string | null;
        role: string;
        googleId: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }): User {
        return new User({
            id: raw.id,
            email: raw.email,
            password: raw.password,
            name: raw.name,
            phone: raw.phone,
            avatarUrl: raw.avatarUrl,
            role: raw.role as UserRole,
            googleId: raw.googleId,
            isActive: raw.isActive,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }
}
