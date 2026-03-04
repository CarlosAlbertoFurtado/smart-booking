// ===========================================
// Domain Entity: Booking
// Core business logic for appointment scheduling
// ===========================================

export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
    NO_SHOW = 'NO_SHOW',
}

export interface BookingProps {
    id?: string;
    clientId: string;
    professionalId: string;
    serviceId: string;
    businessId: string;
    date: Date;
    startTime: string;
    endTime: string;
    status: BookingStatus;
    notes?: string | null;
    cancelReason?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Booking {
    readonly id?: string;
    readonly clientId: string;
    readonly professionalId: string;
    readonly serviceId: string;
    readonly businessId: string;
    readonly date: Date;
    readonly startTime: string;
    readonly endTime: string;
    readonly status: BookingStatus;
    readonly notes?: string | null;
    readonly cancelReason?: string | null;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;

    constructor(props: BookingProps) {
        this.validate(props);
        this.id = props.id;
        this.clientId = props.clientId;
        this.professionalId = props.professionalId;
        this.serviceId = props.serviceId;
        this.businessId = props.businessId;
        this.date = props.date;
        this.startTime = props.startTime;
        this.endTime = props.endTime;
        this.status = props.status;
        this.notes = props.notes;
        this.cancelReason = props.cancelReason;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }

    private validate(props: BookingProps): void {
        if (!props.clientId) throw new Error('Client ID is required');
        if (!props.professionalId) throw new Error('Professional ID is required');
        if (!props.serviceId) throw new Error('Service ID is required');
        if (!props.businessId) throw new Error('Business ID is required');
        if (!props.date) throw new Error('Date is required');

        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(props.startTime)) {
            throw new Error('Invalid start time format (expected HH:MM)');
        }
        if (!timeRegex.test(props.endTime)) {
            throw new Error('Invalid end time format (expected HH:MM)');
        }
        if (props.startTime >= props.endTime) {
            throw new Error('Start time must be before end time');
        }
    }

    isPending(): boolean {
        return this.status === BookingStatus.PENDING;
    }

    isConfirmed(): boolean {
        return this.status === BookingStatus.CONFIRMED;
    }

    canBeCancelled(): boolean {
        return [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(this.status);
    }

    canBeCompleted(): boolean {
        return this.status === BookingStatus.CONFIRMED;
    }

    isInThePast(): boolean {
        return this.date < new Date();
    }

    getDurationInMinutes(): number {
        const [startH, startM] = this.startTime.split(':').map(Number);
        const [endH, endM] = this.endTime.split(':').map(Number);
        return (endH * 60 + endM) - (startH * 60 + startM);
    }

    /**
     * Check if this booking conflicts with another time slot
     */
    conflictsWith(otherStart: string, otherEnd: string): boolean {
        return this.startTime < otherEnd && this.endTime > otherStart;
    }
}
