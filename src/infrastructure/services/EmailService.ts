import nodemailer from 'nodemailer';
import { IEmailService } from '../../domain/interfaces/repositories';
import { Booking } from '../../domain/entities/Booking';
import { logger } from '../../shared/utils/logger';

// usa Ethereal em dev, trocar SMTP_* pra SES/Sendgrid em prod
export class EmailService implements IEmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || '',
            },
        });
    }

    async sendBookingConfirmation(booking: Booking, clientEmail: string): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: `"SmartBooking" <${process.env.SMTP_FROM || 'noreply@smartbooking.dev'}>`,
                to: clientEmail,
                subject: `Booking confirmed – ${booking.date.toLocaleDateString('pt-BR')} at ${booking.startTime}`,
                html: this.confirmationTemplate(booking),
            });
            logger.info({ bookingId: booking.id, to: clientEmail }, 'confirmation_email_sent');
        } catch (err) {
            // emails should never crash the request — log and move on
            logger.warn({ err, bookingId: booking.id }, 'confirmation_email_failed');
        }
    }

    async sendBookingCancellation(booking: Booking, clientEmail: string): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: `"SmartBooking" <${process.env.SMTP_FROM || 'noreply@smartbooking.dev'}>`,
                to: clientEmail,
                subject: `Booking cancelled – ${booking.date.toLocaleDateString('pt-BR')}`,
                html: this.cancellationTemplate(booking),
            });
            logger.info({ bookingId: booking.id, to: clientEmail }, 'cancellation_email_sent');
        } catch (err) {
            logger.warn({ err, bookingId: booking.id }, 'cancellation_email_failed');
        }
    }


    private confirmationTemplate(booking: Booking): string {
        return `
            <h2>Your booking is confirmed!</h2>
            <p><strong>Date:</strong> ${booking.date.toLocaleDateString('pt-BR')}</p>
            <p><strong>Time:</strong> ${booking.startTime} – ${booking.endTime}</p>
            <p><strong>Duration:</strong> ${booking.getDurationInMinutes()} min</p>
            ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
            <hr/>
            <p style="color:#888">SmartBooking – Scheduling made easy</p>
        `.trim();
    }

    private cancellationTemplate(booking: Booking): string {
        return `
            <h2>Your booking has been cancelled</h2>
            <p><strong>Date:</strong> ${booking.date.toLocaleDateString('pt-BR')}</p>
            <p><strong>Time:</strong> ${booking.startTime} – ${booking.endTime}</p>
            ${booking.cancelReason ? `<p><strong>Reason:</strong> ${booking.cancelReason}</p>` : ''}
            <hr/>
            <p style="color:#888">SmartBooking – Scheduling made easy</p>
        `.trim();
    }
}
