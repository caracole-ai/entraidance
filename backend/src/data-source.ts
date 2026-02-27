import { DataSource } from 'typeorm';
import { join } from 'path';

// DataSource for TypeORM CLI (migrations generation/run)
export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: join(__dirname, '../gr_attitude.sqlite'),
  entities: [join(__dirname, '**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false, // Never auto-sync with CLI
  logging: false,
});
