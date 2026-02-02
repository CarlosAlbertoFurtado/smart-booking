import { Business } from '../../src/domain/entities/Business';
import { Service } from '../../src/domain/entities/Service';

// ── Business Entity ─────────────────────────────────────────

describe('Business', () => {
    const validProps = {
        name: 'Barbearia Premium',
        slug: 'barbearia-premium',
        isActive: true,
        ownerId: 'owner-1',
    };

    it('creates a valid business', () => {
        const biz = new Business(validProps);
        expect(biz.name).toBe('Barbearia Premium');
        expect(biz.slug).toBe('barbearia-premium');
    });

    it('rejects short name', () => {
        expect(() => new Business({ ...validProps, name: 'A' })).toThrow('at least 2 characters');
    });

    it('rejects empty name', () => {
        expect(() => new Business({ ...validProps, name: '' })).toThrow('at least 2 characters');
    });

    it('rejects invalid slug (uppercase)', () => {
        expect(() => new Business({ ...validProps, slug: 'Invalid-Slug' })).toThrow('lowercase');
    });

    it('rejects missing owner', () => {
        expect(() => new Business({ ...validProps, ownerId: '' })).toThrow('Owner ID is required');
    });

    it('generates a slug from name', () => {
        expect(Business.generateSlug('Barbearia São Paulo')).toBe('barbearia-sao-paulo');
        expect(Business.generateSlug('Café & Bistro')).toBe('cafe-bistro');
    });

    it('builds full address from parts', () => {
        const biz = new Business({
            ...validProps,
            address: 'Rua das Flores, 123',
            city: 'Campinas',
            state: 'SP',
        });
        expect(biz.getFullAddress()).toBe('Rua das Flores, 123, Campinas, SP');
    });

    it('handles partial address', () => {
        const biz = new Business({ ...validProps, city: 'Campinas' });
        expect(biz.getFullAddress()).toBe('Campinas');
    });
});

// ── Service Entity ──────────────────────────────────────────

describe('Service', () => {
    const validProps = {
        name: 'Corte Masculino',
        duration: 30,
        price: 45.90,
        isActive: true,
        businessId: 'biz-1',
    };

    it('creates a valid service', () => {
        const svc = new Service(validProps);
        expect(svc.name).toBe('Corte Masculino');
        expect(svc.duration).toBe(30);
    });

    it('rejects short name', () => {
        expect(() => new Service({ ...validProps, name: 'X' })).toThrow('at least 2 characters');
    });

    it('rejects zero duration', () => {
        expect(() => new Service({ ...validProps, duration: 0 })).toThrow('between 1 and 480');
    });

    it('rejects oversized duration', () => {
        expect(() => new Service({ ...validProps, duration: 500 })).toThrow('between 1 and 480');
    });

    it('rejects negative price', () => {
        expect(() => new Service({ ...validProps, price: -10 })).toThrow('cannot be negative');
    });

    it('accepts zero price (free service)', () => {
        const svc = new Service({ ...validProps, price: 0 });
        expect(svc.price).toBe(0);
    });

    it('rejects missing business ID', () => {
        expect(() => new Service({ ...validProps, businessId: '' })).toThrow('Business ID is required');
    });

    it('formats price as BRL', () => {
        expect(new Service(validProps).getFormattedPrice()).toBe('R$ 45,90');
    });

    it('formats duration as human-readable', () => {
        expect(new Service({ ...validProps, duration: 30 }).getFormattedDuration()).toBe('30min');
        expect(new Service({ ...validProps, duration: 60 }).getFormattedDuration()).toBe('1h');
        expect(new Service({ ...validProps, duration: 90 }).getFormattedDuration()).toBe('1h 30min');
    });
});
