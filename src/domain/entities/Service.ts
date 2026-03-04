// ===========================================
// Domain Entity: Service
// ===========================================

export interface ServiceProps {
    id?: string;
    name: string;
    description?: string | null;
    duration: number; // in minutes
    price: number;
    isActive: boolean;
    businessId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Service {
    readonly id?: string;
    readonly name: string;
    readonly description?: string | null;
    readonly duration: number;
    readonly price: number;
    readonly isActive: boolean;
    readonly businessId: string;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;

    constructor(props: ServiceProps) {
        this.validate(props);
        Object.assign(this, props);
        this.name = props.name;
        this.duration = props.duration;
        this.price = props.price;
        this.isActive = props.isActive;
        this.businessId = props.businessId;
    }

    private validate(props: ServiceProps): void {
        if (!props.name || props.name.trim().length < 2) {
            throw new Error('Service name must be at least 2 characters');
        }
        if (props.duration <= 0 || props.duration > 480) {
            throw new Error('Duration must be between 1 and 480 minutes');
        }
        if (props.price < 0) {
            throw new Error('Price cannot be negative');
        }
        if (!props.businessId) {
            throw new Error('Business ID is required');
        }
    }

    getFormattedPrice(): string {
        return `R$ ${this.price.toFixed(2).replace('.', ',')}`;
    }

    getFormattedDuration(): string {
        const hours = Math.floor(this.duration / 60);
        const minutes = this.duration % 60;
        if (hours === 0) return `${minutes}min`;
        if (minutes === 0) return `${hours}h`;
        return `${hours}h ${minutes}min`;
    }
}
