import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsDemoFlag1709294400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'isDemo',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'missions',
      new TableColumn({
        name: 'isDemo',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'contributions',
      new TableColumn({
        name: 'isDemo',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'offers',
      new TableColumn({
        name: 'isDemo',
        type: 'boolean',
        default: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'isDemo');
    await queryRunner.dropColumn('missions', 'isDemo');
    await queryRunner.dropColumn('contributions', 'isDemo');
    await queryRunner.dropColumn('offers', 'isDemo');
  }
}
