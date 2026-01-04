
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersController } from '../../../src/users/users.controller';
import { UsersService } from '../../../src/users/users.service';
import { AuthGuard } from '@nestjs/passport';

// Mock ResultDTO
const mockResult = (data?: any) => ({
    status: true,
    message: 'Success',
    data,
});

const mockUsersService = {
    findAll: jest.fn().mockResolvedValue([
        { id: 1, name: 'Test User', email: 'test@example.com' } // Service returns entity array usually
    ]),
    findById: jest.fn().mockImplementation((id: number) => {
        if (id === 1) return Promise.resolve({ id: 1, name: 'Test User', email: 'test@example.com' });
        return Promise.resolve(undefined);
    }),
    create: jest.fn().mockResolvedValue(mockResult({ id: 1, name: 'New User' })),
    update: jest.fn().mockResolvedValue(mockResult()),
};

describe('UsersController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                { provide: UsersService, useValue: mockUsersService }
            ],
        })
            .overrideGuard(AuthGuard('jwt'))
            .useValue({ canActivate: () => true }) // Bypass Auth Guard
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/users (GET) - Should return all users', () => {
        return request(app.getHttpServer())
            .get('/users')
            .expect(200)
            .expect((res) => {
                expect(res.body.status).toBe(true);
                expect(Array.isArray(res.body.data)).toBe(true);
            });
    });

    it('/users/:id (GET) - Should return a specific user', () => {
        return request(app.getHttpServer())
            .get('/users/1')
            .expect(200)
            .expect((res) => {
                expect(res.body.data.id).toBe(1);
            });
    });

    it('/users (POST) - Should create a user', () => {
        return request(app.getHttpServer())
            .post('/users')
            .send({ name: 'New User', email: 'new@test.com', password: '123' })
            .expect(201)
            .expect((res) => {
                expect(res.body.status).toBe(true);
            });
    });

    afterAll(async () => {
        await app.close();
    });
});
