import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as fs from 'node:fs';
import * as https from 'node:https';
import { readFileSync } from 'node:fs';
import 'reflect-metadata';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/http-interceptor.filter';

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

export async function bootstrap() {
  console.log('Cargando aplicación...');
  const httpsOptions = {
    key: readFileSync('./certs/synapse+1-key.pem'),
    cert: readFileSync('./certs/synapse+1.pem'),
  };
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Synapse API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalFilters(new AllExceptionsFilter());

  console.log('Iniciando la aplicación...');
  await app.listen(3000);
  console.log('Aplicación iniciada en el puerto 3000');
}

(async () => {
  try {
    console.log('Iniciando bootstrap...');
    await bootstrap();
  } catch (error) {
    console.error('Error durante el bootstrap:', error);
  }
})();

