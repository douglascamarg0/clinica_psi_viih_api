import { UserRole } from '../users.entity';

export class CreateUserDto {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}

export class UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    isActive?: boolean;
}
