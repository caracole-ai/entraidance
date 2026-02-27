import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';

describe('Search & Filters (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;
  let missionIds: string[] = [];

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
    const email = `search-test-${Date.now()}@example.com`;
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'Test1234!',
        displayName: 'Search Test User',
      });

    authToken = registerRes.body.accessToken;

    // Create test missions with different properties (unique IDs to avoid conflicts)
    const timestamp = Date.now();
    const missions = [
      {
        title: `Déménagement urgent Paris ${timestamp}`,
        description: `Besoin aide déménagement ce weekend ${timestamp}`,
        category: 'demenagement',
        helpType: 'materiel',
        urgency: 'urgent',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: `Cours informatique ${timestamp}`,
        description: `Recherche prof pour apprendre Python ${timestamp}`,
        category: 'numerique',
        helpType: 'conseil',
        urgency: 'moyen',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: `Bricolage étagères ${timestamp}`,
        description: `Installation étagères IKEA ${timestamp}`,
        category: 'bricolage',
        helpType: 'materiel',
        urgency: 'faible',
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    for (const mission of missions) {
      const res = await request(app.getHttpServer())
        .post('/missions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mission);
      missionIds.push(res.body.id);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /missions/search', () => {
    it('should search missions by full-text query (title)', async () => {
      return request(app.getHttpServer())
        .get('/missions/search?q=déménagement')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.data[0].title).toContain('Déménagement');
        });
    });

    it('should search missions by full-text query (description)', async () => {
      return request(app.getHttpServer())
        .get('/missions/search?q=Python')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.data[0].description).toContain('Python');
        });
    });

    it('should filter by category', async () => {
      return request(app.getHttpServer())
        .get('/missions/search?category=numerique')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.every((m: any) => m.category === 'numerique')).toBe(true);
        });
    });

    it('should filter by urgency', async () => {
      return request(app.getHttpServer())
        .get('/missions/search?urgency=urgent')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.every((m: any) => m.urgency === 'urgent')).toBe(true);
        });
    });

    it('should filter by status', async () => {
      return request(app.getHttpServer())
        .get('/missions/search?status=ouverte')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.every((m: any) => m.status === 'ouverte')).toBe(true);
        });
    });

    it('should combine multiple filters', async () => {
      return request(app.getHttpServer())
        .get('/missions/search?category=demenagement&urgency=urgent')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          if (res.body.data.length > 0) {
            expect(res.body.data[0].category).toBe('demenagement');
            expect(res.body.data[0].urgency).toBe('urgent');
          }
        });
    });

    it('should sort by createdAt DESC by default', async () => {
      const res = await request(app.getHttpServer())
        .get('/missions/search')
        .expect(200);

      const dates = res.body.data.map((m: any) => new Date(m.createdAt).getTime());
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
      }
    });

    it('should sort by expiresAt ASC', async () => {
      const res = await request(app.getHttpServer())
        .get('/missions/search?sortBy=expiresAt&sortOrder=ASC')
        .expect(200);

      const dates = res.body.data.map((m: any) => new Date(m.expiresAt).getTime());
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1]).toBeLessThanOrEqual(dates[i]);
      }
    });

    it('should paginate results', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/missions/search?limit=1&page=1')
        .expect(200);

      expect(page1.body.data.length).toBe(1);
      expect(page1.body.page).toBe(1);
      expect(page1.body.limit).toBe(1);

      const page2 = await request(app.getHttpServer())
        .get('/missions/search?limit=1&page=2')
        .expect(200);

      expect(page2.body.data.length).toBeLessThanOrEqual(1);
      expect(page2.body.page).toBe(2);

      // Different results on different pages
      if (page1.body.data.length > 0 && page2.body.data.length > 0) {
        expect(page1.body.data[0].id).not.toBe(page2.body.data[0].id);
      }
    });

    it('should return pagination metadata', async () => {
      return request(app.getHttpServer())
        .get('/missions/search?limit=2')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(res.body).toHaveProperty('totalPages');
        });
    });

    it('should return empty array for non-matching query', async () => {
      return request(app.getHttpServer())
        .get('/missions/search?q=nonexistentxyz123')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toEqual([]);
          expect(res.body.total).toBe(0);
        });
    });

    it('should validate invalid category', async () => {
      return request(app.getHttpServer())
        .get('/missions/search?category=invalid')
        .expect(400);
    });

    it('should validate invalid urgency', async () => {
      return request(app.getHttpServer())
        .get('/missions/search?urgency=invalid')
        .expect(400);
    });

    it('should validate invalid sortBy', async () => {
      return request(app.getHttpServer())
        .get('/missions/search?sortBy=invalid')
        .expect(200); // Defaults to createdAt
    });
  });
});
