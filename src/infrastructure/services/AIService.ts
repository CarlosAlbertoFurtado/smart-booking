import OpenAI from 'openai';
import { IAIService } from '../../domain/interfaces/repositories';
import { IBookingRepository } from '../../domain/interfaces/repositories';
import { logger } from '../../shared/utils/logger';

export class AIService implements IAIService {
    private client: OpenAI | null = null;

    constructor(private bookingRepository: IBookingRepository) {
        if (process.env.OPENAI_API_KEY) {
            this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        } else {
            logger.warn('OPENAI_API_KEY not set — AI suggestions will use fallback logic');
        }
    }

    async suggestAvailableSlots(
        professionalId: string,
        date: Date,
        duration: number,
    ): Promise<string[]> {
        const existingBookings = await this.bookingRepository.findByProfessionalAndDate(
            professionalId, date,
        );

        const busySlots = existingBookings.map(b => ({
            start: b.startTime,
            end: b.endTime,
        }));

        // try the AI path first
        if (this.client) {
            try {
                return await this.askOpenAI(busySlots, duration);
            } catch (err) {
                logger.warn({ err }, 'openai_suggestion_failed_using_fallback');
            }
        }

        // fallback: varre horário comercial de 30 em 30min
        return this.findFreeSlots(busySlots, duration);
    }

    private async askOpenAI(
        busySlots: { start: string; end: string }[],
        duration: number,
    ): Promise<string[]> {
        const response = await this.client!.chat.completions.create({
            model: 'gpt-3.5-turbo',
            temperature: 0.3,
            messages: [
                {
                    role: 'system',
                    content: 'You suggest available time slots for a booking system. Respond ONLY with a JSON array of strings in HH:MM format.',
                },
                {
                    role: 'user',
                    content: `Business hours: 08:00–18:00. Already booked: ${JSON.stringify(busySlots)}. Find up to 5 free slots of ${duration} minutes.`,
                },
            ],
        });

        const raw = response.choices[0]?.message?.content?.trim() || '[]';
        return JSON.parse(raw);
    }

    private findFreeSlots(
        busySlots: { start: string; end: string }[],
        duration: number,
    ): string[] {
        const OPEN = 8 * 60;   // 08:00
        const CLOSE = 18 * 60; // 18:00
        const STEP = 30;
        const slots: string[] = [];

        for (let t = OPEN; t + duration <= CLOSE && slots.length < 5; t += STEP) {
            const start = this.minutesToHHMM(t);
            const end = this.minutesToHHMM(t + duration);

            const conflicts = busySlots.some(
                b => start < b.end && end > b.start,
            );

            if (!conflicts) {
                slots.push(start);
            }
        }

        return slots;
    }

    private minutesToHHMM(totalMinutes: number): string {
        const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
        const m = String(totalMinutes % 60).padStart(2, '0');
        return `${h}:${m}`;
    }
}
