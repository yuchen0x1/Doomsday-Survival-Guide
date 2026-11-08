import 'reflect-metadata';
import { json, urlencoded } from 'express';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';
import { envInt, loadEnvFiles } from './config/load-env';

loadEnvFiles();

async function bootstrap(): Promise<void> {
  // bodyParser 关闭后自行挂载，以便控制上传体积上限（AI 识别图片为 base64）
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  const uploadMax = envInt('UPLOAD_MAX_BYTES', 5_242_880);
  const bodyLimit = `${Math.max(uploadMax * 2, 1024 * 1024)}b`;
  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ extended: true, limit: bodyLimit }));

  app.setGlobalPrefix('api');
  app.enableCors({
    origin:
      process.env.ENABLE_CORS_WHITELIST === 'true'
        ? (process.env.CORS_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean)
        : true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('APOCALYPSE SURVIVAL API')
    .setDescription('末日生存指南后端 API：内容、审核、同步、AI 助手')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'APOCALYPSE SURVIVAL API Docs',
  });

  const port = envInt('API_PORT', 3000);
  await app.listen(port, '0.0.0.0');
  const logger = new Logger('Bootstrap');
  logger.log(`API 就绪: http://localhost:${port}/api`);
  logger.log(`Swagger 文档: http://localhost:${port}/api/docs`);
  logger.log(`健康检查: http://localhost:${port}/api/health`);
}

void bootstrap();
