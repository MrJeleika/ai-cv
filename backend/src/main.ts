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

  // Allowed browser origins: localhost for dev, the production frontend, plus
  // any extra origins from FRONTEND_ORIGIN (comma-separated, e.g. CF preview URLs).
  // Origins must have no trailing slash/path — match the browser's Origin header.
  const allowedOrigins = [
    'http://localhost:4200',
    'http://localhost:3000',
    'https://ai-cv.jeleika.com',
    ...(process.env.FRONTEND_ORIGIN?.split(',')
      .map((o) => o.trim())
      .filter(Boolean) ?? []),
  ];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Backend running on http://localhost:${port}/api`);
}

bootstrap();
