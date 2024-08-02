
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.enableCors({
    origin: '*', // In production, specify your frontend URL
    methods: ['GET', 'POST','HEAD', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  // Add global exception filter for WebSocket exceptions
  app.useGlobalFilters(new WebSocketExceptionsFilter(logger));

  await app.listen(3000);
  logger.log('Application is running on: http://localhost:3000');
}
bootstrap();

// Custom WebSocket exceptions filter
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch()
export class WebSocketExceptionsFilter extends BaseWsExceptionFilter {
  constructor(private logger: Logger) {
    super();
  }

  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error(`WebSocket Exception: ${exception instanceof Error ? exception.message : exception}`);
    super.catch(exception, host);
  }
}






/*
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Logger } from '@nestjs/common';
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch()
export class WebSocketExceptionsFilter extends BaseWsExceptionFilter {
  constructor(private logger: Logger) {
    super();
  }

  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error(`WebSocket Exception: ${exception instanceof Error ? exception.message : exception}`);
    super.catch(exception, host);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.enableCors({
    origin: '*', // In production, specify your frontend URL
    methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  // Add global exception filter for WebSocket exceptions
  app.useGlobalFilters(new WebSocketExceptionsFilter(logger));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap().catch(err => {
  console.error('Failed to start the application:', err);
  process.exit(1);
});

*/