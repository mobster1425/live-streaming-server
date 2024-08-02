
/*
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
*/

import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StreamingModule } from './streaming/streaming.module';
 import { AppController } from './app.controller';
 import { AppService } from './app.service';

@Module({
  imports: [AuthModule, UsersModule, StreamingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}