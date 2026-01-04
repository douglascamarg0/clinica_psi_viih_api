
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../src/users/users.service';
import { User } from '../../../src/users/users.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockUsersRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((user) => Promise.resolve({ id: 1, ...user })),
    find: jest.fn().mockResolvedValue([mockUser]),
    findOne: jest.fn().mockImplementation(({ where: { email, id } }) => {
        if (email === mockUser.email || id === mockUser.id) return Promise.resolve(mockUser);
        return Promise.resolve(undefined);
    }),
    update: jest.fn().mockResolvedValue(true),
};

describe('UsersService', () => {
    let service: UsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUsersRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new user successfully', async () => {
            // Mock bcrypt hash to avoid actual hashing cost/complexity in unit test issues
            jest.spyOn(bcrypt, 'genSalt').mockImplementation(() => Promise.resolve('salt'));
            jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedPassword'));

            const dto = { name: 'Test', email: 'new@example.com', password: 'pass' };
            const result = await service.create(dto);

            expect(result.status).toBe(true);
            expect(result.message).toBe('Usuário criado com sucesso');
            expect(mockUsersRepository.create).toHaveBeenCalled();
            expect(mockUsersRepository.save).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
            const users = await service.findAll();
            expect(users).toEqual([mockUser]);
        });
    });

    describe('findById', () => {
        it('should find a user by id', async () => {
            const user = await service.findById(1);
            expect(user).toEqual(mockUser);
        });

        it('should return undefined if user not found', async () => {
            mockUsersRepository.findOne.mockResolvedValueOnce(undefined);
            const user = await service.findById(99);
            expect(user).toBeUndefined();
        });
    });
});
