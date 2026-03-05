import { User, UserRole } from '../../src/domain/entities/User';

describe('User', () => {
    const validProps = {
        email: 'carlos@gmail.com',
        password: 'secure123',
        name: 'Carlos Jr',
        role: UserRole.CLIENT,
        isActive: true,
    };

    it('creates valid user', () => {
        const user = new User(validProps);
        expect(user.email).toBe('carlos@gmail.com');
        expect(user.name).toBe('Carlos Jr');
        expect(user.role).toBe(UserRole.CLIENT);
    });

    it('rejects invalid email', () => {
        expect(() => new User({ ...validProps, email: 'invalid' })).toThrow('Invalid email');
    });

    it('rejects short name', () => {
        expect(() => new User({ ...validProps, name: 'A' })).toThrow('Name must be at least 2');
    });

    it('rejects short password', () => {
        expect(() => new User({ ...validProps, password: '123' })).toThrow('Password must be at least 6');
    });

    it('checks role methods', () => {
        const admin = new User({ ...validProps, role: UserRole.ADMIN });
        const client = new User({ ...validProps, role: UserRole.CLIENT });
        const pro = new User({ ...validProps, role: UserRole.PROFESSIONAL });

        expect(admin.isAdmin()).toBe(true);
        expect(admin.canManageBusiness()).toBe(true);
        expect(client.isClient()).toBe(true);
        expect(client.canManageBusiness()).toBe(false);
        expect(pro.isProfessional()).toBe(true);
    });
});
