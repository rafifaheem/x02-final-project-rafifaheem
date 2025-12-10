import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('TasksController (e2e)', () => {
    let app: INestApplication;
    let jwtToken: string;
    let userId: number;
    let taskId: number;
    const testEmail = `task_test_${Math.floor(Math.random() * 10000)}@example.com`;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        // Setup: Register and Login
        await request(app.getHttpServer())
            .post('/auth/register')
            .send({ email: testEmail, password: 'password', name: 'Task User' });

        const loginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: testEmail, password: 'password' });

        jwtToken = loginRes.body.access_token;
        userId = loginRes.body.user.id;
    });

    afterAll(async () => {
        await app.close();
    });

    it('/tasks (POST) - Create Task', () => {
        return request(app.getHttpServer())
            .post('/tasks')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
                title: 'New E2E Task',
                description: 'Task Description',
                priority: 'high',
                dueDate: new Date().toISOString()
            })
            .expect(201)
            .expect((res) => {
                expect(res.body.title).toEqual('New E2E Task');
                expect(res.body.id).toBeDefined();
                taskId = res.body.id;
            });
    });

    it('/tasks (GET) - List Tasks', () => {
        return request(app.getHttpServer())
            .get('/tasks')
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.find(t => t.id === taskId)).toBeDefined();
            });
    });

    it('/tasks/:id (PATCH) - Update Task', () => {
        return request(app.getHttpServer())
            .patch(`/tasks/${taskId}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({ isComplete: true })
            .expect(200)
            .expect((res) => {
                expect(res.body.isComplete).toBe(true);
            });
    });

    it('/tasks/public/:userId (GET) - View Public Tasks', async () => {
        // First make it public
        await request(app.getHttpServer())
            .patch(`/tasks/${taskId}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({ isPublic: true });

        return request(app.getHttpServer())
            .get(`/tasks/public/${userId}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                const task = res.body.find(t => t.id === taskId);
                expect(task).toBeDefined();
                expect(task.title).toBe('New E2E Task');
            });
    });

    it('/tasks/:id (DELETE) - Delete Task', () => {
        return request(app.getHttpServer())
            .delete(`/tasks/${taskId}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(200);
    });

    it('/tasks (GET) - Verify Deletion', () => {
        return request(app.getHttpServer())
            .get('/tasks')
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.find(t => t.id === taskId)).toBeUndefined();
            });
    });
});
