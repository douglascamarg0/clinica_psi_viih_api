
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { ResultDTO } from '../shared/result.dto';
import { TokenRepository } from './repositories/token.repository';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private tokenRepository: TokenRepository,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    /**
     * Gera access token e refresh token
     */
    async generateTokens(userId: number, email: string) {
        const payload = { email, sub: userId };

        const accessToken = this.jwtService.sign(payload);

        // Gera refresh token com secret diferente e expiração maior
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'API-VIIH-CAMARGO-REFRESH',
            expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
        });

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }

    /**
     * Hash do refresh token para salvar no banco
     */
    async hashRefreshToken(refreshToken: string): Promise<string> {
        return bcrypt.hash(refreshToken, 10);
    }

    /**
     * Calcula a data de expiração do refresh token
     */
    getRefreshTokenExpiry(): Date {
        const expiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
        const days = parseInt(expiration.replace('d', ''));
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);
        return expiryDate;
    }

    async login(loginDto: LoginDto): Promise<ResultDTO> {
        console.log('🔐 [AuthService] Tentativa de login:', { email: loginDto.email });
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            console.log('❌ [AuthService] Usuário não encontrado ou senha inválida');
            return {
                status: false,
                message: 'Email ou senha inválidos',
            };
        }

        console.log('✅ [AuthService] Usuário validado:', { id: user.id, email: user.email, role: user.role });

        // Gera tokens
        const tokens = await this.generateTokens(user.id, user.email);

        // Salva refresh token hasheado na tabela tokens
        const hashedRefreshToken = await this.hashRefreshToken(tokens.refresh_token);
        await this.tokenRepository.saveToken(user.email, hashedRefreshToken, this.getRefreshTokenExpiry());

        const response = {
            status: true,
            message: 'Login realizado com sucesso',
            data: {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                user: user
            }
        };

        console.log('📤 [AuthService] Resposta do login:', { 
            status: response.status, 
            userRole: response.data.user.role,
            userId: response.data.user.id 
        });

        return response;
    }

    /**
     * Renova os tokens usando o refresh token
     */
    async refreshTokens(refreshToken: string): Promise<ResultDTO> {
        try {
            // Verifica e decodifica o refresh token
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'API-VIIH-CAMARGO-REFRESH',
            });

            // Busca o usuário
            const user = await this.usersService.findById(payload.sub);
            if (!user) {
                throw new UnauthorizedException('Usuário não encontrado');
            }

            // Busca o token na tabela tokens
            const storedToken = await this.tokenRepository.findByUsername(user.email);
            if (!storedToken) {
                throw new UnauthorizedException('Refresh token não encontrado');
            }

            // Verifica se o refresh token expirou
            if (new Date() > storedToken.expiresAt) {
                // Remove token expirado
                await this.tokenRepository.deleteByUsername(user.email);
                throw new UnauthorizedException('Refresh token expirado');
            }

            // Compara o refresh token fornecido com o hasheado no banco
            const isRefreshTokenValid = await bcrypt.compare(refreshToken, storedToken.token);
            if (!isRefreshTokenValid) {
                throw new UnauthorizedException('Refresh token inválido');
            }

            // Gera novos tokens
            const tokens = await this.generateTokens(user.id, user.email);

            // Atualiza o refresh token na tabela tokens
            const hashedRefreshToken = await this.hashRefreshToken(tokens.refresh_token);
            await this.tokenRepository.saveToken(user.email, hashedRefreshToken, this.getRefreshTokenExpiry());

            const { password, ...userWithoutSensitiveData } = user;

            return {
                status: true,
                message: 'Tokens renovados com sucesso',
                data: {
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    user: userWithoutSensitiveData
                }
            };
        } catch (error) {
            return {
                status: false,
                message: error.message || 'Refresh token inválido ou expirado',
            };
        }
    }

    async register(user: any): Promise<ResultDTO> {
        return this.usersService.create(user);
    }
}
