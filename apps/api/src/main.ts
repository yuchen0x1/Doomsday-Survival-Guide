import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { version } from '../package.json';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { envInt, loadEnvFiles } from './config/load-env';
import {
  allowAnyCorsOrigin,
  parseCorsOrigins,
  parseTrustProxy,
  swaggerEnabled,
} from './config/runtime-config';

loadEnvFiles();

async function bootstrap(): Promise<void> {
  // bodyParser 关闭后自行挂载，以便控制上传体积上限（AI 识别图片为 base64）
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  const logger = new Logger('Bootstrap');

  const uploadMax = envInt('UPLOAD_MAX_BYTES', 5_242_880);
  const bodyLimit = `${Math.max(uploadMax * 2, 1024 * 1024)}b`;
  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ extended: true, limit: bodyLimit }));

  const trustProxy = parseTrustProxy(process.env.TRUST_PROXY);
  if (trustProxy !== false) app.set('trust proxy', trustProxy);

  app.setGlobalPrefix('api');
  const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGINS);
  const allowAnyOrigin = allowAnyCorsOrigin(
    process.env.NODE_ENV,
    process.env.ENABLE_CORS_WHITELIST,
  );
  if (allowAnyOrigin) {
    logger.warn('CORS 当前反射任意来源，仅允许用于本地开发；生产环境请配置 CORS_ORIGINS。');
  } else if (corsOrigins.length === 0) {
    logger.warn('CORS_ORIGINS 未配置：跨源浏览器请求将被拒绝，同源部署不受影响。');
  }
  app.enableCors({
    origin: allowAnyOrigin ? true : corsOrigins,
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

  const swaggerOn = swaggerEnabled(process.env.NODE_ENV, process.env.ENABLE_SWAGGER);
  if (swaggerOn) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('APOCALYPSE SURVIVAL API')
      .setDescription('末日生存指南后端 API：内容、审核、同步、AI 助手')
      .setVersion(process.env.API_VERSION ?? version)
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'APOCALYPSE SURVIVAL API Docs',
    });
  }

  const port = envInt('API_PORT', 3000);
  await app.listen(port, '0.0.0.0');
  logger.log(`API 就绪: http://localhost:${port}/api`);
  logger.log(
    swaggerOn
      ? `Swagger 文档: http://localhost:${port}/api/docs`
      : 'Swagger 文档已禁用（生产环境默认关闭，可设置 ENABLE_SWAGGER=true 开启）',
  );
  logger.log(`健康检查: http://localhost:${port}/api/health`);
}

void bootstrap();
