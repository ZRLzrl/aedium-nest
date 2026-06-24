import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import mikroOrmConfig from './mikro-orm.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticlesModule } from './articles/articles.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    UsersModule,
    ArticlesModule,
    MikroOrmModule.forRoot(mikroOrmConfig),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // 全局应用 AuthGuard
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // 全局应用 RolesGuard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
