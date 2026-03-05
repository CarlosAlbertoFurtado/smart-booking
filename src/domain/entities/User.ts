export enum UserRole {
    ADMIN = 'ADMIN',
    PROFESSIONAL = 'PROFESSIONAL',
    CLIENT = 'CLIENT',
}

export interface UserProps {
    id?: string;
    email: string;
    password?: string;
    name: string;
    phone?: string;
    avatarUrl?: string;
    role: UserRole;
    googleId?: string;
    isActive: boolean;
    refreshToken?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export class User {
    readonly id?: string;
    readonly email: string;
    readonly password?: string;
    readonly name: string;
    readonly phone?: string;
    readonly avatarUrl?: string;
    readonly role: UserRole;
    readonly googleId?: string;
    readonly isActive: boolean;
    readonly refreshToken?: string | null;
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
        if (!props.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(props.email)) {
            throw new Error('Invalid email');
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
        return this.role === UserRole.ADMIN || this.role === UserRole.PROFESSIONAL;
    }
}
