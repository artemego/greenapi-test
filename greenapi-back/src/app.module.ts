import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from '@nestjs/authentication';
import { AuthModule } from './auth/auth.module.js';
import { envSchema, type AppConfigService } from './config/env.js';
import { InstancesModule } from './instances/instances.module.js';

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
    // Opaque session cookie + global guard: every route needs a session unless @Public().
    AuthenticationModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: AppConfigService) => ({
        session: {
          cookieName: 'sid',
          absoluteTtl: `${config.get('SESSION_TTL_DAYS', { infer: true })}d`,
          idleTtl: 0,
          cookie: {
            secure: config.get('NODE_ENV', { infer: true }) === 'production',
            sameSite: 'lax',
          },
          // Lets the frontend call the API directly from its own origin, not only via a proxy.
          trustedOrigins: [config.get('FRONTEND_ORIGIN', { infer: true })],
        },
      }),
    }),
    InstancesModule,
    AuthModule,
  ],
})
export class AppModule {}
