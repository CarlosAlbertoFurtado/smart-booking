// ===========================================
// Use Case: Register User
// ===========================================

import bcrypt from 'bcryptjs';
import { User, UserRole } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/repositories';
import { RegisterDTO, AuthResponseDTO } from '../dtos';
import { ConflictError } from '../../shared/errors/AppError';
import { generateTokens } from '../../shared/utils/jwt';

export class RegisterUserUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(dto: RegisterDTO): Promise<AuthResponseDTO> {
        // 1. Check if email already exists
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new ConflictError('Email is already registered');
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(dto.password, 12);

        // 3. Create user entity (validates business rules)
        const userEntity = new User({
            email: dto.email.toLowerCase().trim(),
            password: hashedPassword,
            name: dto.name.trim(),
            phone: dto.phone,
            role: dto.role || UserRole.CLIENT,
            isActive: true,
        });

        // 4. Persist
        const user = await this.userRepository.create(userEntity);

        // 5. Generate tokens
        const { accessToken, refreshToken } = generateTokens({
            userId: user.id!,
            role: user.role,
        });

        // 6. Save refresh token
        await this.userRepository.updateRefreshToken(user.id!, refreshToken);

        return {
            user: {
                id: user.id!,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            accessToken,
            refreshToken,
        };
    }
}
