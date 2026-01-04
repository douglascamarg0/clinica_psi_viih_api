
import { Controller, Get, Post, Body, Put, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './interface/users.dto';
import { ResultDTO } from '../shared/result.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async findAll(): Promise<ResultDTO> {
        const users = await this.usersService.findAll();
        return {
            status: true,
            message: 'Lista de usuários recuperada com sucesso',
            data: users.map(({ password, ...user }) => user),
        };
    }

    @Get('role/:role')
    @UseGuards(AuthGuard('jwt'))
    async findByRole(@Param('role') role: string): Promise<ResultDTO> {
        const users = await this.usersService.findByRole(role as any);
        return {
            status: true,
            message: `Lista de usuários com role ${role} recuperada com sucesso`,
            data: users.map(({ password, ...user }) => user),
        };
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    async findOne(@Param('id') id: string): Promise<ResultDTO> {
        const user = await this.usersService.findById(+id);
        if (!user) {
            return { status: false, message: 'Usuário não encontrado' };
        }
        const { password, ...result } = user;
        return {
            status: true,
            message: 'Usuário encontrado',
            data: result,
        };
    }

    @Post()
    async create(@Body() createUserDto: CreateUserDto): Promise<ResultDTO> {
        return this.usersService.create(createUserDto);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<ResultDTO> {
        return this.usersService.update(+id, updateUserDto);
    }
}
