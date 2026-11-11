import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instance } from './instance.entity.js';
import { InstancesService } from './instances.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Instance])],
  providers: [InstancesService],
  exports: [InstancesService],
})
export class InstancesModule {}
