import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from 'common/exceptionFilter/http.exception.filter';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  const port = process.env.SERVER_PORT;
  await app.listen(port || 3000);
  console.log(`${port}번 포트로 서버열림`);
}
bootstrap();
