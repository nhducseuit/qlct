import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Enable CORS for all routes
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strips properties that do not have any decorators
    forbidNonWhitelisted: true, // Throw an error if non-whitelisted values are provided
    transform: true, // Automatically transform payloads to DTO instances
    transformOptions: {
      enableImplicitConversion: true, // Allows class-validator to convert string params to numbers, booleans etc.
    },
  }));

  const config = new DocumentBuilder()
    .setTitle('QLTC API')
    .setDescription('API documentation for Quản Lý Chi Tiêu application')
    .setVersion('1.0')
    .addBearerAuth() // For JWT
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // API docs will be available at /api-docs
  
  // You can also configure CORS more granularly if needed:
  // app.enableCors({ origin: 'http://localhost:9000', methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', credentials: true });
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`[NestJS server]: Application is running on: http://localhost:${port}`);
}
bootstrap();