import 'dotenv/config';
// import { UserSchema } from './modules/user/user.entity.js';
import { Migrator } from '@mikro-orm/migrations';
import { defineConfig } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
// import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { SeedManager } from '@mikro-orm/seeder';

export default defineConfig({
  // for simplicity, we use the SQLite database, as it's available pretty much everywhere
  dbName: process.env.ORM_NAME,
  user: process.env.ORM_USER,
  password: process.env.ORM_PASSWORD,
  host: process.env.ORM_HOST,
  port: Number(process.env.ORM_PORT),
  // explicitly list your entities - we'll create the User entity next
  // entities: [UserSchema],

  // 需要关闭 ssl，才能链接neon
  driverOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
  },

  metadataProvider: TsMorphMetadataProvider,
  // metadataProvider: ReflectMetadataProvider,
  entities: ['dist/**/*.entity.js'],
  // Glob patterns for TypeScript source files (used in development)
  entitiesTs: ['src/**/*.entity.ts'],
  // enable debug mode to log SQL queries and discovery information
  debug: process.env.NODE_ENV !== 'production',

  extensions: [Migrator, SeedManager],

  seeder: {
    path: 'seeders',
    pathTs: 'src/seeders',
    defaultSeeder: 'DatabaseSeeder',
    glob: '!(*.d).{js,ts}',
    emit: 'ts',
    fileName: (className: string) => className,
  },
});
