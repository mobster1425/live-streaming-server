import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { SimpleAuthGuard } from './simple-auth.guard';

@Module({
  imports: [UsersModule],
  providers: [AuthService, SimpleAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, SimpleAuthGuard],
})
export class AuthModule {}