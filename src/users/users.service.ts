
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './users.entity';
import { CreateUserDto, UpdateUserDto } from './interface/users.dto';
import * as bcrypt from 'bcrypt';
import { ResultDTO } from '../shared/result.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async findByRole(role: UserRole): Promise<User[]> {
        return this.usersRepository.find({ where: { role } });
    }

    async findOne(email: string): Promise<User | undefined> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async findById(id: number): Promise<User | undefined> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async create(createUserDto: CreateUserDto): Promise<ResultDTO> {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

        const user = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
            role: createUserDto.role || UserRole.PACIENT,
        });

        try {
            await this.usersRepository.save(user);
            const { password, ...result } = user;
            return {
                status: true,
                message: 'Usuário criado com sucesso',
                data: result,
            };
        } catch (error) {
            return {
                status: false,
                message: 'Erro ao criar usuário. Email pode já estar em uso.',
                data: error,
            };
        }
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<ResultDTO> {
        const user = await this.findById(id);
        if (!user) return { status: false, message: 'Usuário não encontrado' };

        if (updateUserDto.password) {
            const salt = await bcrypt.genSalt();
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
        }

        await this.usersRepository.update(id, updateUserDto);
        return { status: true, message: 'Usuário atualizado com sucesso' };
    }
}
