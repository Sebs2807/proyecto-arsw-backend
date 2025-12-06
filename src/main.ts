import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as fs from 'node:fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/http-interceptor.filter';
import { RealtimeGateway } from './gateways/realtime.gateway';

export async function bootstrap() {
const isLocal = process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'development';
  let app;
  
  if (isLocal) {
      console.log('Running in Local/Dev mode with HTTPS.');
      const httpsOptions = {
          key: fs.readFileSync('./certs/synapse+1-key.pem') as Buffer,
          cert: fs.readFileSync('./certs/synapse+1.pem') as Buffer,
      };

      app = await NestFactory.create(AppModule, { httpsOptions });
  } else {
      console.log('Running in Production/Azure mode with HTTP.');
      app = await NestFactory.create(AppModule);
  }
  app.use(cookieParser());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Synapse API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  const server = app.getHttpServer();
  const realtime = app.get(RealtimeGateway);

  realtime.registerTwilioWS(server);

  // Global Pipes & Filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(3000);
}