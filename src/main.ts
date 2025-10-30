import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as fs from 'fs';
import 'reflect-metadata';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/http-interceptor.filter';

export async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('./certs/synapse+1-key.pem') as Buffer,
    cert: fs.readFileSync('./certs/synapse+1.pem') as Buffer,
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

  // Interceptor global para respuestas
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Filtro global para errores
  app.useGlobalFilters(new AllExceptionsFilter());

  //await app.listen(process.env.PORT ?? 3000);
  await app.listen(3000);
}
void bootstrap();
