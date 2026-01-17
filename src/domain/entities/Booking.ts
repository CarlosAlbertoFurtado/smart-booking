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
    startTime: string; // HH:MM
    endTime: string;
    status: BookingStatus;
    notes?: string;
    cancelReason?: string;
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
    readonly notes?: string;
    readonly cancelReason?: string;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;

    constructor(props: BookingProps) {
        this.validate(props);
        Object.assign(this, props);
        this.clientId = props.clientId;
        this.professionalId = props.professionalId;
        this.serviceId = props.serviceId;
        this.businessId = props.businessId;
        this.date = props.date;
        this.startTime = props.startTime;
        this.endTime = props.endTime;
        this.status = props.status;
    }

    private validate(props: BookingProps): void {
        const timeFormat = /^([01]\d|2[0-3]):([0-5]\d)$/;

        if (!timeFormat.test(props.startTime)) {
            throw new Error('Invalid start time format (expected HH:MM)');
        }
        if (!timeFormat.test(props.endTime)) {
            throw new Error('Invalid end time format (expected HH:MM)');
        }
        if (props.startTime >= props.endTime) {
            throw new Error('Start time must be before end time');
        }
    }

    getDurationInMinutes(): number {
        const [startH, startM] = this.startTime.split(':').map(Number);
        const [endH, endM] = this.endTime.split(':').map(Number);
        return (endH * 60 + endM) - (startH * 60 + startM);
    }

    conflictsWith(otherStart: string, otherEnd: string): boolean {
        return this.startTime < otherEnd && this.endTime > otherStart;
    }

    canBeCancelled(): boolean {
        return [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(this.status);
    }

    canBeCompleted(): boolean {
        return this.status === BookingStatus.CONFIRMED;
    }

    isPast(): boolean {
        return this.date < new Date();
    }

    isPending(): boolean {
        return this.status === BookingStatus.PENDING;
    }

    isConfirmed(): boolean {
        return this.status === BookingStatus.CONFIRMED;
    }
}
