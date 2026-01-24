import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../domain/interfaces/repositories';
import { LoginDTO, AuthResponseDTO } from '../dtos';
import { UnauthorizedError } from '../../shared/errors/AppError';
import { generateTokens } from '../../shared/utils/jwt';

export class LoginUserUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(dto: LoginDTO): Promise<AuthResponseDTO> {
        const user = await this.userRepository.findByEmail(dto.email.toLowerCase().trim());
        if (!user) {
            throw new UnauthorizedError('Invalid email or password');
        }

        if (!user.isActive) {
            throw new UnauthorizedError('Account is deactivated');
        }

        if (!user.password) {
            throw new UnauthorizedError('This account uses social login');
        }

        const passwordValid = await bcrypt.compare(dto.password, user.password);
        if (!passwordValid) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const tokens = generateTokens({ userId: user.id!, role: user.role });
        await this.userRepository.updateRefreshToken(user.id!, tokens.refreshToken);

        return {
            user: { id: user.id!, email: user.email, name: user.name, role: user.role },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
}
