

// src/streaming/streaming.module.ts
import { Module } from '@nestjs/common';
import { StreamingGateway } from './streaming.gateway';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';


@Module({
    imports: [
        JwtModule.register({
          secret: 'secret-key', // Replace with your actual secret key
          signOptions: { expiresIn: '1h' },
        }),
        AuthModule, // Import AuthModule if it exports JwtService
      ],
  providers: [StreamingGateway],
})
export class StreamingModule {}