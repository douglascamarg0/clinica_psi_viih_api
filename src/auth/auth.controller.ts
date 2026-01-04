import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResultDTO } from '../shared/result.dto';
import { CreateUserDto } from '../users/interface/users.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<ResultDTO> {
        return this.authService.login(loginDto);
    }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto): Promise<ResultDTO> {
        return this.authService.register(createUserDto);
    }

    @Post('refresh')
    async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<ResultDTO> {
        return this.authService.refreshTokens(refreshTokenDto.refreshToken);
    }
}
