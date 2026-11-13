import { StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';
import type { AppConfigService } from './config/env.js';

async function bootstrap() {
  // Open SSE streams would otherwise keep the server from closing on shutdown (and on every watch restart).
  const app = await NestFactory.create(AppModule, { forceCloseConnections: true });
  const config = app.get<AppConfigService>(ConfigService);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: config.get('FRONTEND_ORIGIN', { infer: true }),
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.enableShutdownHooks();

  await app.listen(config.get('PORT', { infer: true }));
}
await bootstrap();
