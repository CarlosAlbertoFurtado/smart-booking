export interface BusinessProps {
    id?: string;
    name: string;
    slug: string;
    description?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    logoUrl?: string | null;
    isActive: boolean;
    ownerId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Business {
    readonly id?: string;
    readonly name: string;
    readonly slug: string;
    readonly description?: string | null;
    readonly phone?: string | null;
    readonly email?: string | null;
    readonly address?: string | null;
    readonly city?: string | null;
    readonly state?: string | null;
    readonly logoUrl?: string | null;
    readonly isActive: boolean;
    readonly ownerId: string;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;

    constructor(props: BusinessProps) {
        this.validate(props);
        Object.assign(this, props);
        this.name = props.name;
        this.slug = props.slug;
        this.isActive = props.isActive;
        this.ownerId = props.ownerId;
    }

    private validate(props: BusinessProps): void {
        if (!props.name || props.name.trim().length < 2) {
            throw new Error('Business name must be at least 2 characters');
        }
        if (!props.slug || !/^[a-z0-9-]+$/.test(props.slug)) {
            throw new Error('Slug must contain only lowercase letters, numbers, and hyphens');
        }
        if (!props.ownerId) {
            throw new Error('Owner ID is required');
        }
    }

    static generateSlug(name: string): string {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    getFullAddress(): string {
        const parts = [this.address, this.city, this.state].filter(Boolean);
        return parts.join(', ');
    }
}
