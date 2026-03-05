import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveContributionUniqueConstraint1772348400000
  implements MigrationInterface
{
  name = 'RemoveContributionUniqueConstraint1772348400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove UNIQUE constraint to allow multiple contributions of the same type
    // from the same user on the same mission
    await queryRunner.query(
      `ALTER TABLE "contributions" DROP CONSTRAINT IF EXISTS "UQ_3756ee3b48056ae019b68d5acdb"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add the UNIQUE constraint (will fail if duplicates exist)
    await queryRunner.query(
      `ALTER TABLE "contributions" ADD CONSTRAINT "UQ_3756ee3b48056ae019b68d5acdb" UNIQUE ("userId", "missionId", "type")`,
    );
  }
}
