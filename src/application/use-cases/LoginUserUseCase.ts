// ===========================================
// Use Case: Login User
// ===========================================

import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../domain/interfaces/repositories';
import { LoginDTO, AuthResponseDTO } from '../dtos';
import { UnauthorizedError } from '../../shared/errors/AppError';
import { generateTokens } from '../../shared/utils/jwt';

export class LoginUserUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(dto: LoginDTO): Promise<AuthResponseDTO> {
        // 1. Find user by email
        const user = await this.userRepository.findByEmail(dto.email.toLowerCase().trim());
        if (!user) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // 2. Check if account is active
        if (!user.isActive) {
            throw new UnauthorizedError('Account is deactivated');
        }

        // 3. Verify password
        if (!user.password) {
            throw new UnauthorizedError('This account uses social login. Please sign in with Google.');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // 4. Generate tokens
        const { accessToken, refreshToken } = generateTokens({
            userId: user.id!,
            role: user.role,
        });

        // 5. Save refresh token
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
