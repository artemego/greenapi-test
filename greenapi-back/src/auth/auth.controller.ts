import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { CurrentUser, Public } from '@nestjs/authentication';
import type { Instance } from '../instances/instance.entity.js';
import { AuthService, toInstanceView, type InstanceView } from './auth.service.js';
import { loginSchema, type LoginDto } from './login.schema.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body({ schema: loginSchema }) dto: LoginDto): Promise<InstanceView> {
    return this.auth.login(dto);
  }

  @Public()
  @Post('logout')
  @HttpCode(204)
  logout(): Promise<void> {
    return this.auth.logout();
  }

  @Get('me')
  me(@CurrentUser() instance: Instance): InstanceView {
    return toInstanceView(instance);
  }
}
