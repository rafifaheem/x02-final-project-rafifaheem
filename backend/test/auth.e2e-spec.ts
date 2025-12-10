import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let testEmail: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/auth/register (POST) - Success', () => {
        testEmail = `auth_test_${Math.floor(Math.random() * 10000)}@example.com`;
        return request(app.getHttpServer())
            .post('/auth/register')
            .send({ email: testEmail, password: 'password123', name: 'Auth User' })
            .expect(201)
            .expect((res) => {
                expect(res.body.email).toEqual(testEmail);
                expect(res.body.id).toBeDefined();
            });
    });

    it('/auth/register (POST) - Fail (Duplicate)', async () => {
        // Only attempt if the first register worked. 
        // Supertest runs sequentially in a single 'it', but separate 'it' might run based on Jest config. 
        // Assuming sequential execution or random email reuse safety.
        // Let's reuse the email from previous test which is persisted in DB unless cleaned.

        await request(app.getHttpServer())
            .post('/auth/register')
            .send({ email: testEmail, password: 'password123', name: 'Auth User 2' })
            .expect(409); // Conflict or 500 depending on implementation. Assuming NestJS standard exception or 500 if not handled.
    });

    it('/auth/login (POST) - Success', () => {
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: testEmail, password: 'password123' })
            .expect(201)
            .expect((res) => {
                expect(res.body.access_token).toBeDefined();
                expect(res.body.user).toBeDefined();
                expect(res.body.user.email).toBe(testEmail);
            });
    });

    it('/auth/login (POST) - Fail (Wrong Password)', () => {
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: testEmail, password: 'wrongpassword' })
            .expect(401);
    });
});
