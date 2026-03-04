// ===========================================
// Domain Entity: User
// Pure business logic — no dependencies on frameworks
// ===========================================

export enum UserRole {
    ADMIN = 'ADMIN',
    PROFESSIONAL = 'PROFESSIONAL',
    CLIENT = 'CLIENT',
}

export interface UserProps {
    id?: string;
    email: string;
    password?: string | null;
    name: string;
    phone?: string | null;
    avatarUrl?: string | null;
    role: UserRole;
    googleId?: string | null;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class User {
    readonly id?: string;
    readonly email: string;
    readonly password?: string | null;
    readonly name: string;
    readonly phone?: string | null;
    readonly avatarUrl?: string | null;
    readonly role: UserRole;
    readonly googleId?: string | null;
    readonly isActive: boolean;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;

    constructor(props: UserProps) {
        this.validate(props);
        Object.assign(this, props);
        this.email = props.email;
        this.name = props.name;
        this.role = props.role;
        this.isActive = props.isActive;
    }

    private validate(props: UserProps): void {
        if (!props.email || !props.email.includes('@')) {
            throw new Error('Invalid email address');
        }
        if (!props.name || props.name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters');
        }
        if (props.password && props.password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }
    }

    isAdmin(): boolean {
        return this.role === UserRole.ADMIN;
    }

    isProfessional(): boolean {
        return this.role === UserRole.PROFESSIONAL;
    }

    isClient(): boolean {
        return this.role === UserRole.CLIENT;
    }

    canManageBusiness(): boolean {
        return this.role === UserRole.ADMIN;
    }
}
