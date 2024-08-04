
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


/**
 * Custom exception filter for WebSocket exceptions
 */
@Catch()
export class WebSocketExceptionsFilter extends BaseWsExceptionFilter {
  constructor(private logger: Logger) {
    super();
  }

  
  /**
   * Catches and logs WebSocket exceptions
   * @param exception - The caught exception
   * @param host - The arguments host
   */
  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error(`WebSocket Exception: ${exception instanceof Error ? exception.message : exception}`);
    super.catch(exception, host);
  }
}





