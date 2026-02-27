import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

const isProduction = process.env.NODE_ENV === 'production';

export default registerAs('database', (): TypeOrmModuleOptions => {
  const dbType = process.env.DB_TYPE || 'sqlite';

  if (dbType === 'postgres') {
    // Support Render's DATABASE_URL or individual vars
    if (process.env.DATABASE_URL) {
      return {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl: isProduction
          ? { rejectUnauthorized: false }
          : false,
        autoLoadEntities: true,
        synchronize: !isProduction, // Dev: auto-sync | Prod: migrations
        migrationsRun: isProduction, // Auto-run migrations in production
        migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
      };
    }

    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'gr_user',
      password: process.env.DB_PASSWORD || 'gr_password',
      database: process.env.DB_DATABASE || 'gr_attitude',
      autoLoadEntities: true,
      synchronize: !isProduction, // Dev: auto-sync | Prod: migrations
      migrationsRun: isProduction, // Auto-run migrations in production
      migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
    };
  }

  return {
    type: 'better-sqlite3',
    database: join(process.cwd(), 'gr_attitude.sqlite'),
    autoLoadEntities: true,
    synchronize: !isProduction, // Dev: auto-sync | Prod: migrations
    migrationsRun: isProduction, // Auto-run migrations in production
    migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
  };
});
