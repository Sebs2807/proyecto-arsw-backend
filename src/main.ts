import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('./certs/synapse+1-key.pem'),
    cert: fs.readFileSync('./certs/synapse+1.pem'),
  };

  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.use(cookieParser());

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.enableCors({
    origin: 'https://localhost:5173',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
