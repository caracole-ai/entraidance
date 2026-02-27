import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';

describe('User Profile (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    // Register and login
    const email = `profile-test-${Date.now()}@example.com`;
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'Test1234!',
        displayName: 'Profile Test User',
      });

    authToken = registerRes.body.accessToken;
    userId = registerRes.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('PATCH /users/me/profile', () => {
    it('should update user profile with skills', async () => {
      return request(app.getHttpServer())
        .patch('/users/me/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          skills: ['Déménagement', 'Bricolage', 'Informatique'],
          bio: 'Je suis passionné par aider les autres',
          availabilityHours: 10,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.skills).toEqual([
            'Déménagement',
            'Bricolage',
            'Informatique',
          ]);
          expect(res.body.bio).toBe('Je suis passionné par aider les autres');
          expect(res.body.availabilityHours).toBe(10);
          expect(res.body.profileCompletion).toBeGreaterThan(0);
        });
    });

    it('should update interests and preferences', async () => {
      return request(app.getHttpServer())
        .patch('/users/me/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          interests: ['Éducation', 'Environnement'],
          maxDistanceKm: 25,
          preferredCategories: ['demenagement', 'bricolage'],
          preferredUrgencies: ['urgent', 'moyen'],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.interests).toEqual(['Éducation', 'Environnement']);
          expect(res.body.maxDistanceKm).toBe(25);
          expect(res.body.preferredCategories).toEqual([
            'demenagement',
            'bricolage',
          ]);
          expect(res.body.preferredUrgencies).toEqual(['urgent', 'moyen']);
        });
    });

    it('should reject too many skills (>20)', async () => {
      const tooManySkills = Array.from({ length: 21 }, (_, i) => `Skill ${i}`);

      return request(app.getHttpServer())
        .patch('/users/me/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          skills: tooManySkills,
        })
        .expect(400);
    });

    it('should reject invalid availability hours', async () => {
      return request(app.getHttpServer())
        .patch('/users/me/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          availabilityHours: 200, // > 168 hours/week
        })
        .expect(400);
    });

    it('should reject bio too long (>500 chars)', async () => {
      const longBio = 'a'.repeat(501);

      return request(app.getHttpServer())
        .patch('/users/me/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bio: longBio,
        })
        .expect(400);
    });
  });

  describe('GET /users/me/profile-completion', () => {
    it('should return profile completion percentage', async () => {
      return request(app.getHttpServer())
        .get('/users/me/profile-completion')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('profileCompletion');
          expect(typeof res.body.profileCompletion).toBe('number');
          expect(res.body.profileCompletion).toBeGreaterThanOrEqual(0);
          expect(res.body.profileCompletion).toBeLessThanOrEqual(100);
        });
    });

    it('should show higher completion after adding fields', async () => {
      // Get initial completion
      const initialRes = await request(app.getHttpServer())
        .get('/users/me/profile-completion')
        .set('Authorization', `Bearer ${authToken}`);

      const initialCompletion = initialRes.body.profileCompletion;

      // Add profile fields
      await request(app.getHttpServer())
        .patch('/users/me/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          skills: ['Test'],
          interests: ['Test'],
          bio: 'Test bio',
          availabilityHours: 5,
          maxDistanceKm: 50,
          preferredCategories: ['demenagement'],
          preferredUrgencies: ['urgent'],
        });

      // Get updated completion
      const updatedRes = await request(app.getHttpServer())
        .get('/users/me/profile-completion')
        .set('Authorization', `Bearer ${authToken}`);

      const updatedCompletion = updatedRes.body.profileCompletion;

      // Should be >= initial (may already be 100% if all fields filled)
      expect(updatedCompletion).toBeGreaterThanOrEqual(initialCompletion);
      expect(updatedCompletion).toBeGreaterThan(75); // At least 75% after filling many fields
    });
  });

  describe('GET /users/me', () => {
    it('should include profile fields in user response', async () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('skills');
          expect(res.body).toHaveProperty('interests');
          expect(res.body).toHaveProperty('bio');
          expect(res.body).toHaveProperty('availabilityHours');
          expect(res.body).toHaveProperty('maxDistanceKm');
        });
    });
  });
});
