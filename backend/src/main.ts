/**
 * Backend entrypoint. Loads .env (from backend/.env), then boots NestJS.
 */

import { config as loadEnv } from 'dotenv';
import { join } from 'path';

// Try a few candidate paths — Nx may launch us from repo root or from dist/.
loadEnv({ path: join(process.cwd(), 'backend/.env') });
loadEnv({ path: join(process.cwd(), '.env') });

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Backend running on http://localhost:${port}/api`);
}

bootstrap();
