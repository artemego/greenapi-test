import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GreenApiModule } from '../green-api/green-api.module.js';
import { InstancesModule } from '../instances/instances.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { SessionAuth } from './session.auth.js';
import { Session } from './session.entity.js';
import { TypeOrmSessionStore } from './typeorm-session.store.js';

@Module({
  imports: [TypeOrmModule.forFeature([Session]), GreenApiModule, InstancesModule],
  controllers: [AuthController],
  providers: [AuthService, SessionAuth, TypeOrmSessionStore],
})
export class AuthModule {}
