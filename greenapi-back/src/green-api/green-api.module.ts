import { Module } from '@nestjs/common';
import { GreenApiClient } from './green-api.client.js';

@Module({
  providers: [GreenApiClient],
  exports: [GreenApiClient],
})
export class GreenApiModule {}
