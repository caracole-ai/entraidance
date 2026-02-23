import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module.js';
import {
  MissionCategory,
  HelpType,
  Urgency,
  Visibility,
} from '../../src/shared/enums.js';

describe('Missions (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let userId: string;
  let missionId: string;

  const testUser = {
    email: `missions-test-${Date.now()}@example.com`,
    password: 'Test1234!',
    displayName: 'Mission Tester',
  };

  const testMission = {
    title: 'Besoin d\'aide pour déménagement',
    description: 'Je cherche 2 personnes pour m\'aider à déménager ce week-end. Camion fourni.',
    category: MissionCategory.AIDE_A_LA_PERSONNE,
    helpType: HelpType.PHYSICAL,
    urgency: Urgency.MEDIUM,
    visibility: Visibility.PUBLIC,
    locationLat: 48.8566,
    locationLng: 2.3522,
    locationRadiusKm: 5,
    tags: ['déménagement', 'transport'],
  };

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

    // Create test user and login
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);
    
    userId = registerRes.body.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /missions', () => {
    it('should reject mission creation without JWT', () => {
      return request(app.getHttpServer())
        .post('/missions')
        .send(testMission)
        .expect(401);
    });

    it('should create a mission with valid data and JWT', () => {
      return request(app.getHttpServer())
        .post('/missions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testMission)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('title', testMission.title);
          expect(res.body).toHaveProperty('description', testMission.description);
          expect(res.body).toHaveProperty('category', testMission.category);
          expect(res.body).toHaveProperty('helpType', testMission.helpType);
          expect(res.body).toHaveProperty('urgency', testMission.urgency);
          expect(res.body).toHaveProperty('visibility', testMission.visibility);
          expect(res.body).toHaveProperty('status', 'open');
          expect(res.body).toHaveProperty('creatorId', userId);
          missionId = res.body.id;
        });
    });

    it('should reject mission with short title', () => {
      return request(app.getHttpServer())
        .post('/missions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...testMission,
          title: 'Help',
        })
        .expect(400);
    });

    it('should reject mission with short description', () => {
      return request(app.getHttpServer())
        .post('/missions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...testMission,
          description: 'Too short',
        })
        .expect(400);
    });

    it('should reject mission with invalid category', () => {
      return request(app.getHttpServer())
        .post('/missions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...testMission,
          category: 'INVALID_CATEGORY',
        })
        .expect(400);
    });

    it('should reject mission with invalid urgency', () => {
      return request(app.getHttpServer())
        .post('/missions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...testMission,
          urgency: 'SUPER_URGENT',
        })
        .expect(400);
    });
  });

  describe('GET /missions', () => {
    it('should list all missions (public endpoint)', () => {
      return request(app.getHttpServer())
        .get('/missions')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          const mission = res.body.find((m: any) => m.id === missionId);
          expect(mission).toBeDefined();
        });
    });

    it('should filter missions by category', () => {
      return request(app.getHttpServer())
        .get('/missions')
        .query({ category: MissionCategory.AIDE_A_LA_PERSONNE })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((mission: any) => {
            expect(mission.category).toBe(MissionCategory.AIDE_A_LA_PERSONNE);
          });
        });
    });

    it('should filter missions by urgency', () => {
      return request(app.getHttpServer())
        .get('/missions')
        .query({ urgency: Urgency.MEDIUM })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((mission: any) => {
            expect(mission.urgency).toBe(Urgency.MEDIUM);
          });
        });
    });

    it('should filter missions by status', () => {
      return request(app.getHttpServer())
        .get('/missions')
        .query({ status: 'open' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((mission: any) => {
            expect(mission.status).toBe('open');
          });
        });
    });
  });

  describe('GET /missions/:id', () => {
    it('should get a mission by id', () => {
      return request(app.getHttpServer())
        .get(`/missions/${missionId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', missionId);
          expect(res.body).toHaveProperty('title', testMission.title);
          expect(res.body).toHaveProperty('description', testMission.description);
        });
    });

    it('should return 404 for non-existent mission', () => {
      return request(app.getHttpServer())
        .get('/missions/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PATCH /missions/:id', () => {
    it('should reject update without JWT', () => {
      return request(app.getHttpServer())
        .patch(`/missions/${missionId}`)
        .send({ title: 'Updated Title' })
        .expect(401);
    });

    it('should update mission with valid data and JWT', () => {
      const updatedTitle = 'Déménagement urgent - besoin d\'aide';
      return request(app.getHttpServer())
        .patch(`/missions/${missionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: updatedTitle })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('title', updatedTitle);
        });
    });

    it('should reject update with short title', () => {
      return request(app.getHttpServer())
        .patch(`/missions/${missionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Help' })
        .expect(400);
    });
  });

  describe('GET /missions/:id/contributions', () => {
    it('should get mission contributions', () => {
      return request(app.getHttpServer())
        .get(`/missions/${missionId}/contributions`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('GET /missions/:id/correlations', () => {
    it('should get mission correlations', () => {
      return request(app.getHttpServer())
        .get(`/missions/${missionId}/correlations`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('POST /missions/:id/close', () => {
    it('should reject close without JWT', () => {
      return request(app.getHttpServer())
        .post(`/missions/${missionId}/close`)
        .send({ summary: 'Mission completed successfully' })
        .expect(401);
    });

    it('should close mission with valid data and JWT', () => {
      return request(app.getHttpServer())
        .post(`/missions/${missionId}/close`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          summary: 'Déménagement réussi avec 2 bénévoles. Merci beaucoup!',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'closed');
          expect(res.body).toHaveProperty('closedAt');
          expect(res.body).toHaveProperty('closureSummary');
        });
    });

    it('should reject closing an already closed mission', () => {
      return request(app.getHttpServer())
        .post(`/missions/${missionId}/close`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          summary: 'Trying to close again',
        })
        .expect(400); // Should return bad request or conflict
    });
  });
});
