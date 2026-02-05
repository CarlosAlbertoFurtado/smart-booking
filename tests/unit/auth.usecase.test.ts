import { RegisterUserUseCase } from '../../src/application/use-cases/RegisterUserUseCase';
import { LoginUserUseCase } from '../../src/application/use-cases/LoginUserUseCase';
import { UserRole } from '../../src/domain/entities/User';
import { ConflictError, UnauthorizedError } from '../../src/shared/errors/AppError';

// ── jwt mock — avoid real token signing in unit tests ────────

jest.mock('../../src/shared/utils/jwt', () => ({
    generateTokens: jest.fn().mockReturnValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
    }),
}));

// ── repo factory ────────────────────────────────────────────

function makeUserRepo(opts?: { existingUser?: Record<string, unknown> | null }) {
    return {
        create: jest.fn().mockImplementation(u =>
            Promise.resolve({ ...u, id: 'user-001' }),
        ),
        findById: jest.fn(),
        findByEmail: jest.fn().mockResolvedValue(opts?.existingUser ?? null),
        findByGoogleId: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        updateRefreshToken: jest.fn().mockResolvedValue(undefined),
    };
}

// ── RegisterUserUseCase ─────────────────────────────────────

describe('RegisterUserUseCase', () => {
    it('creates a user and returns tokens', async () => {
        const repo = makeUserRepo();
        const useCase = new RegisterUserUseCase(repo);

        const result = await useCase.execute({
            email: 'carlos@test.com',
            password: 'secret123',
            name: 'Carlos Jr',
        });

        expect(result.user.email).toBe('carlos@test.com');
        expect(result.accessToken).toBe('mock-access-token');
        expect(repo.create).toHaveBeenCalledTimes(1);
        expect(repo.updateRefreshToken).toHaveBeenCalledWith('user-001', 'mock-refresh-token');
    });

    it('throws ConflictError for duplicate email', async () => {
        const repo = makeUserRepo({
            existingUser: { id: 'existing', email: 'dup@test.com' },
        });
        const useCase = new RegisterUserUseCase(repo);

        await expect(
            useCase.execute({ email: 'dup@test.com', password: 'secret123', name: 'Dup' }),
        ).rejects.toThrow(ConflictError);
    });

    it('normalises email to lowercase', async () => {
        const repo = makeUserRepo();
        const useCase = new RegisterUserUseCase(repo);

        await useCase.execute({
            email: 'Carlos@Test.COM',
            password: 'secret123',
            name: 'Carlos',
        });

        const createdUser = repo.create.mock.calls[0][0];
        expect(createdUser.email).toBe('carlos@test.com');
    });

    it('defaults role to CLIENT when omitted', async () => {
        const repo = makeUserRepo();
        const useCase = new RegisterUserUseCase(repo);

        await useCase.execute({
            email: 'user@test.com',
            password: 'secure456',
            name: 'Test User',
        });

        const createdUser = repo.create.mock.calls[0][0];
        expect(createdUser.role).toBe(UserRole.CLIENT);
    });
});

// ── LoginUserUseCase ────────────────────────────────────────

describe('LoginUserUseCase', () => {
    // bcrypt.hash('password123', 12) pre-computed for determinism
    const bcrypt = require('bcryptjs');
    let hashedPassword: string;

    beforeAll(async () => {
        hashedPassword = await bcrypt.hash('password123', 4); // lower rounds for speed
    });

    it('returns tokens for valid credentials', async () => {
        const repo = makeUserRepo({
            existingUser: {
                id: 'user-001',
                email: 'login@test.com',
                password: hashedPassword,
                name: 'Login User',
                role: UserRole.CLIENT,
                isActive: true,
            },
        });
        const useCase = new LoginUserUseCase(repo);

        const result = await useCase.execute({ email: 'login@test.com', password: 'password123' });

        expect(result.accessToken).toBe('mock-access-token');
        expect(result.user.id).toBe('user-001');
    });

    it('throws for wrong password', async () => {
        const repo = makeUserRepo({
            existingUser: {
                id: 'user-001',
                email: 'login@test.com',
                password: hashedPassword,
                name: 'Login User',
                role: UserRole.CLIENT,
                isActive: true,
            },
        });
        const useCase = new LoginUserUseCase(repo);

        await expect(
            useCase.execute({ email: 'login@test.com', password: 'wrong' }),
        ).rejects.toThrow(UnauthorizedError);
    });

    it('throws for non-existent user', async () => {
        const repo = makeUserRepo({ existingUser: null });
        const useCase = new LoginUserUseCase(repo);

        await expect(
            useCase.execute({ email: 'ghost@test.com', password: 'any' }),
        ).rejects.toThrow(UnauthorizedError);
    });

    it('throws for deactivated account', async () => {
        const repo = makeUserRepo({
            existingUser: {
                id: 'user-002',
                email: 'inactive@test.com',
                password: hashedPassword,
                name: 'Inactive',
                role: UserRole.CLIENT,
                isActive: false,
            },
        });
        const useCase = new LoginUserUseCase(repo);

        await expect(
            useCase.execute({ email: 'inactive@test.com', password: 'password123' }),
        ).rejects.toThrow(UnauthorizedError);
    });
});
