
import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, LessThan, DataSource } from 'typeorm';
import { Token } from '../entities/token.entity';
import { User } from '../../users/users.entity';

@Injectable()
export class TokenRepository {
    constructor(
        @InjectRepository(Token)
        private tokenRepository: Repository<Token>,
        @InjectDataSource()
        private dataSource: DataSource,
    ) { }

    /**
     * Salva um novo token para o usuário
     * Remove tokens antigos do mesmo usuário antes de salvar
     */
    async saveToken(email: string, hashedToken: string, expiry: Date): Promise<void> {
        // Busca o usuário pelo email para obter o userId
        const userRepository = this.dataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { email } });

        if (!user) {
            throw new Error(`Usuário com email ${email} não encontrado`);
        }

        // Remove tokens antigos do usuário
        await this.deleteByUserId(user.id);

        // Salva o novo token
        const token = this.tokenRepository.create({
            userId: user.id,
            token: hashedToken,
            type: 'refresh_token',
            expiresAt: expiry,
            blacklisted: false,
        });

        await this.tokenRepository.save(token);
    }

    /**
     * Busca o token mais recente de um usuário pelo email
     */
    async findByUsername(email: string): Promise<Token | null> {
        const userRepository = this.dataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { email } });

        if (!user) {
            return null;
        }

        return this.tokenRepository.findOne({
            where: { userId: user.id, type: 'refresh_token' },
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Busca o token pelo userId
     */
    async findByUserId(userId: number): Promise<Token | null> {
        return this.tokenRepository.findOne({
            where: { userId, type: 'refresh_token' },
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Remove todos os tokens de um usuário pelo userId
     */
    async deleteByUserId(userId: number): Promise<void> {
        await this.tokenRepository.delete({ userId });
    }

    /**
     * Remove todos os tokens de um usuário pelo email
     */
    async deleteByUsername(email: string): Promise<void> {
        const userRepository = this.dataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { email } });

        if (user) {
            await this.deleteByUserId(user.id);
        }
    }

    /**
     * Remove tokens expirados do banco de dados
     */
    async deleteExpiredTokens(): Promise<void> {
        await this.tokenRepository.delete({
            expiresAt: LessThan(new Date()),
        });
    }

    /**
     * Verifica se existe um token válido para o usuário
     */
    async hasValidToken(email: string): Promise<boolean> {
        const token = await this.findByUsername(email);

        if (!token) return false;

        // Verifica se o token não expirou e não está blacklisted
        return new Date() < token.expiresAt && !token.blacklisted;
    }
}
