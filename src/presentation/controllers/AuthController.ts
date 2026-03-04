// ===========================================
// Controller: Auth
// ===========================================

import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/RegisterUserUseCase';
import { LoginUserUseCase } from '../../application/use-cases/LoginUserUseCase';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository';
import { registerSchema, loginSchema } from '../../shared/validators/schemas';

const userRepository = new PrismaUserRepository();

export class AuthController {
    /**
     * @swagger
     * /api/auth/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Auth]
     */
    static async register(req: Request, res: Response): Promise<void> {
        const dto = registerSchema.parse(req.body);
        const useCase = new RegisterUserUseCase(userRepository);
        const result = await useCase.execute(dto);

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: result,
        });
    }

    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     summary: Login with email and password
     *     tags: [Auth]
     */
    static async login(req: Request, res: Response): Promise<void> {
        const dto = loginSchema.parse(req.body);
        const useCase = new LoginUserUseCase(userRepository);
        const result = await useCase.execute(dto);

        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: result,
        });
    }

    /**
     * @swagger
     * /api/auth/me:
     *   get:
     *     summary: Get current authenticated user
     *     tags: [Auth]
     */
    static async me(req: Request, res: Response): Promise<void> {
        const userId = (req as { userId?: string }).userId;
        const user = await userRepository.findById(userId!);

        res.status(200).json({
            status: 'success',
            data: {
                id: user?.id,
                email: user?.email,
                name: user?.name,
                role: user?.role,
                phone: user?.phone,
                avatarUrl: user?.avatarUrl,
            },
        });
    }
}
