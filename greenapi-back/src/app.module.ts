import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envSchema, type AppConfigService } from './config/env.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envSchema }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: AppConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', { infer: true }),
        port: config.get('DB_PORT', { infer: true }),
        username: config.get('DB_USER', { infer: true }),
        password: config.get('DB_PASSWORD', { infer: true }),
        database: config.get('DB_NAME', { infer: true }),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV', { infer: true }) !== 'production', // dev only
      }),
    }),
  ],
})
export class AppModule {}
