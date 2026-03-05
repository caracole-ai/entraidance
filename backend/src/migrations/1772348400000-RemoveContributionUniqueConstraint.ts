import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveContributionUniqueConstraint1772348400000
  implements MigrationInterface
{
  name = 'RemoveContributionUniqueConstraint1772348400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // SQLite doesn't support DROP CONSTRAINT, so we need to recreate the table
    
    // 1. Create new table without UNIQUE constraint
    await queryRunner.query(`
      CREATE TABLE "contributions_new" (
        "id" varchar PRIMARY KEY NOT NULL,
        "userId" varchar NOT NULL,
        "missionId" varchar NOT NULL,
        "type" varchar NOT NULL,
        "message" text,
        "status" varchar NOT NULL DEFAULT 'active',
        "isDemo" boolean NOT NULL DEFAULT (0),
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_contributions_user" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_contributions_mission" FOREIGN KEY ("missionId") REFERENCES "missions" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    // 2. Copy data from old table
    await queryRunner.query(`
      INSERT INTO "contributions_new" ("id", "userId", "missionId", "type", "message", "status", "isDemo", "createdAt")
      SELECT "id", "userId", "missionId", "type", "message", "status", "isDemo", "createdAt"
      FROM "contributions"
    `);

    // 3. Drop old table
    await queryRunner.query(`DROP TABLE "contributions"`);

    // 4. Rename new table
    await queryRunner.query(`ALTER TABLE "contributions_new" RENAME TO "contributions"`);

    // 5. Recreate indexes (without the UNIQUE one)
    await queryRunner.query(`CREATE INDEX "IDX_contributions_userId" ON "contributions" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_contributions_missionId" ON "contributions" ("missionId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add the UNIQUE constraint by recreating the table
    // This will fail if duplicates exist
    
    await queryRunner.query(`
      CREATE TABLE "contributions_new" (
        "id" varchar PRIMARY KEY NOT NULL,
        "userId" varchar NOT NULL,
        "missionId" varchar NOT NULL,
        "type" varchar NOT NULL,
        "message" text,
        "status" varchar NOT NULL DEFAULT 'active',
        "isDemo" boolean NOT NULL DEFAULT (0),
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_contributions_user" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_contributions_mission" FOREIGN KEY ("missionId") REFERENCES "missions" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "UQ_contributions_user_mission_type" UNIQUE ("userId", "missionId", "type")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "contributions_new" ("id", "userId", "missionId", "type", "message", "status", "isDemo", "createdAt")
      SELECT "id", "userId", "missionId", "type", "message", "status", "isDemo", "createdAt"
      FROM "contributions"
    `);

    await queryRunner.query(`DROP TABLE "contributions"`);
    await queryRunner.query(`ALTER TABLE "contributions_new" RENAME TO "contributions"`);
    await queryRunner.query(`CREATE INDEX "IDX_contributions_userId" ON "contributions" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_contributions_missionId" ON "contributions" ("missionId")`);
  }
}
