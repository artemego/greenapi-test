import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from '@nestjs/authentication';
import { AuthModule } from './auth/auth.module.js';
import { ChatsModule } from './chats/chats.module.js';
import { envSchema, type AppConfigService } from './config/env.js';
import { EventsModule } from './events/events.module.js';
import { InstancesModule } from './instances/instances.module.js';
import { MessagesModule } from './messages/messages.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envSchema }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: AppConfigService) => {
        const ca = config.get('DB_SSL_CA', { infer: true });
        return {
          type: 'postgres',
          host: config.get('DB_HOST', { infer: true }),
          port: config.get('DB_PORT', { infer: true }),
          username: config.get('DB_USER', { infer: true }),
          password: config.get('DB_PASSWORD', { infer: true }),
          database: config.get('DB_NAME', { infer: true }),
          autoLoadEntities: true,
          ssl: ca ? { ca } : config.get('DB_SSL', { infer: true }),
          synchronize:
            config.get('DB_SYNCHRONIZE', { infer: true }) ??
            config.get('NODE_ENV', { infer: true }) !== 'production',
        };
      },
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
    // Production: the same container serves the built frontend, so the browser reaches the API
    // (and its SSE stream) on one origin with no proxy in between. Off when STATIC_DIR is unset.
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: AppConfigService) => {
        const rootPath = config.get('STATIC_DIR', { infer: true });
        return rootPath ? [{ rootPath, exclude: ['/api/{*path}'] }] : [];
      },
    }),
    InstancesModule,
    AuthModule,
    ChatsModule,
    MessagesModule,
    EventsModule,
  ],
})
export class AppModule {}
