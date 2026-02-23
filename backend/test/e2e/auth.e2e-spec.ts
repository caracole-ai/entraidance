import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module.js';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'Test1234!',
    displayName: 'Test User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply same validation as main app
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email', testUser.email);
          expect(res.body).toHaveProperty('displayName', testUser.displayName);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should reject registration with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409); // Conflict
    });

    it('should reject registration with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test1234!',
          displayName: 'Test',
        })
        .expect(400);
    });

    it('should reject registration with weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'new@example.com',
          password: 'weak',
          displayName: 'Test',
        })
        .expect(400);
    });

    it('should reject password without uppercase letter', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'new@example.com',
          password: 'test1234!',
          displayName: 'Test',
        })
        .expect(400);
    });

    it('should reject password without number', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'new@example.com',
          password: 'TestTest!',
          displayName: 'Test',
        })
        .expect(400);
    });

    it('should reject short display name', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'new@example.com',
          password: 'Test1234!',
          displayName: 'A',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('email', testUser.email);
          expect(res.body.user).not.toHaveProperty('password');
          accessToken = res.body.accessToken;
        });
    });

    it('should reject login with wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should reject login with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test1234!',
        })
        .expect(401);
    });

    it('should reject login with missing credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(401);
    });
  });

  describe('POST /auth/change-password', () => {
    it('should reject change-password without JWT', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewTest1234!',
        })
        .expect(401);
    });

    it('should reject change-password with invalid JWT', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewTest1234!',
        })
        .expect(401);
    });

    it('should change password with valid JWT and current password', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewTest1234!',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Password changed successfully');
        });
    });

    it('should login with new password after change', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'NewTest1234!',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
        });
    });

    it('should reject old password after change', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(401);
    });
  });

  describe('OAuth Flows', () => {
    // Note: OAuth flows are complex to test in e2e because they involve
    // external providers (Google, Facebook) and browser redirects.
    // These should be tested with integration tests or manual testing.
    
    it('should redirect to Google OAuth page', () => {
      return request(app.getHttpServer())
        .get('/auth/google')
        .expect(302) // Redirect
        .expect((res) => {
          expect(res.headers.location).toContain('accounts.google.com');
        });
    });

    it('should redirect to Facebook OAuth page', () => {
      return request(app.getHttpServer())
        .get('/auth/facebook')
        .expect(302) // Redirect
        .expect((res) => {
          expect(res.headers.location).toContain('facebook.com');
        });
    });

    // TODO: Add integration tests for full OAuth callback flow
    // This requires mocking Google/Facebook responses or using test credentials
  });
});
