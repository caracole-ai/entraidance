import { DataSource } from 'typeorm';
import { seedDemoData, clearDemoData } from './seeders/demo-data.seeder';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_PATH || './data/gr-attitude.db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: false,
});

async function main() {
  const command = process.argv[2];

  try {
    await dataSource.initialize();
    console.log('✅ Database connection established');

    if (command === 'seed') {
      await seedDemoData(dataSource);
    } else if (command === 'clear') {
      await clearDemoData(dataSource);
    } else {
      console.log('Usage:');
      console.log('  npm run seed        - Add demo data');
      console.log('  npm run seed:clear  - Remove all demo data');
      process.exit(1);
    }

    await dataSource.destroy();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

main();
