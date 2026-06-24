import 'dotenv/config';
import { Migrator } from '@mikro-orm/migrations';
import { defineConfig } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SeedManager } from '@mikro-orm/seeder';

export default defineConfig({
  dbName: process.env.ORM_NAME,
  user: process.env.ORM_USER,
  password: process.env.ORM_PASSWORD,
  host: process.env.ORM_HOST,
  port: Number(process.env.ORM_PORT),
  driverOptions: {
    ssl: { rejectUnauthorized: false },
  },
  metadataProvider: TsMorphMetadataProvider,
  entities: ['dist/src/**/*.entity.js'],
  entitiesTs: [],
  debug: process.env.NODE_ENV !== 'production',
  extensions: [Migrator, SeedManager],
  seeder: {
    path: './seeders',
    pathTs: undefined,
    defaultSeeder: 'DatabaseSeeder',
    glob: '!(*.d).{js,ts}',
    emit: 'ts',
    fileName: (className) => className,
  },
});
