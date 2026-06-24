import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = Number(process.env.PORT);

  // 全局管道管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true, // 禁止非白名单属性
      transformOptions: {
        // 开启隐式转换, 例如：将字符串转换为数字
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger 配置（仅开发环境启用）
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Aedium example')
      .setDescription('The aedium API description')
      .setVersion('1.0')
      .addTag('aedium')
      .addServer('http://localhost:' + PORT, 'localhost')
      .addBearerAuth()
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory, {
      jsonDocumentUrl: 'swagger/json',
    });
  }

  await app.listen(PORT);
}
bootstrap();
