import bcrypt from 'bcryptjs';
import { User, UserRole } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/repositories';
import { RegisterDTO, AuthResponseDTO } from '../dtos';
import { ConflictError } from '../../shared/errors/AppError';
import { generateTokens } from '../../shared/utils/jwt';

export class RegisterUserUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(dto: RegisterDTO): Promise<AuthResponseDTO> {
        const existing = await this.userRepository.findByEmail(dto.email);
        if (existing) {
            throw new ConflictError('Email is already registered');
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);

        const user = new User({
            email: dto.email.toLowerCase().trim(),
            password: passwordHash,
            name: dto.name.trim(),
            role: dto.role || UserRole.CLIENT,
            isActive: true,
        });

        const created = await this.userRepository.create(user);

        const tokens = generateTokens({ userId: created.id!, role: created.role });
        await this.userRepository.updateRefreshToken(created.id!, tokens.refreshToken);

        return {
            user: { id: created.id!, email: created.email, name: created.name, role: created.role },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
}
