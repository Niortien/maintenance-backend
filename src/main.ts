import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({ origin: ['http://localhost:3000', 'http://localhost:3001'] });

  // Serve uploaded images as static files → accessible via /uploads/equipements/<filename>
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

   const config = new DocumentBuilder()
    .setTitle('Maintenance API')
    .setDescription('The Maintenance API description')
    .setVersion('1.0')
    .addTag('cats')

    

    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
