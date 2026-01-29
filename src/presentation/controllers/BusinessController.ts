import { Request, Response } from 'express';
import { PrismaBusinessRepository } from '../../infrastructure/repositories/PrismaBusinessRepository';
import { AuthenticatedRequest } from '../middlewares/auth';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
import { Business } from '../../domain/entities/Business';

const businessRepository = new PrismaBusinessRepository();

export class BusinessController {
    static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
        const { name, description, phone, email, address, city, state } = req.body;
        const slug = Business.generateSlug(name);

        const existing = await businessRepository.findBySlug(slug);
        if (existing) {
            res.status(409).json({ status: 'error', message: 'Business with this name already exists' });
            return;
        }

        const business = await businessRepository.create({
            name,
            slug,
            description: description || null,
            phone: phone || null,
            email: email || null,
            address: address || null,
            city: city || null,
            state: state || null,
            logoUrl: null,
            isActive: true,
            ownerId: req.userId!,
        } as Business);

        res.status(201).json({ status: 'success', data: business });
    }

    static async list(req: AuthenticatedRequest, res: Response): Promise<void> {
        const businesses = await businessRepository.findByOwner(req.userId!);
        res.status(200).json({ status: 'success', data: businesses });
    }

    static async getById(req: Request, res: Response): Promise<void> {
        const business = await businessRepository.findById(req.params.id);
        if (!business) throw new NotFoundError('Business');
        res.status(200).json({ status: 'success', data: business });
    }

    static async getBySlug(req: Request, res: Response): Promise<void> {
        const business = await businessRepository.findBySlug(req.params.slug);
        if (!business) throw new NotFoundError('Business');
        res.status(200).json({ status: 'success', data: business });
    }

    static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
        const business = await businessRepository.findById(req.params.id);
        if (!business) throw new NotFoundError('Business');
        if (business.ownerId !== req.userId) throw new ForbiddenError();

        const updated = await businessRepository.update(req.params.id, req.body);
        res.status(200).json({ status: 'success', data: updated });
    }

    static async remove(req: AuthenticatedRequest, res: Response): Promise<void> {
        const business = await businessRepository.findById(req.params.id);
        if (!business) throw new NotFoundError('Business');
        if (business.ownerId !== req.userId) throw new ForbiddenError();

        await businessRepository.delete(req.params.id);
        res.status(204).send();
    }
}
