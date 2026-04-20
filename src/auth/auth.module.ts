import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAdminStrategy } from './jwt-admin.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtAdminGuard } from './jwt-admin.guard';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'fallback-secret',
        signOptions: { expiresIn: 604800 }, // 7 jours
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAdminStrategy, JwtAuthGuard, JwtAdminGuard],
  exports: [JwtAuthGuard, JwtAdminGuard, JwtStrategy, JwtAdminStrategy, JwtModule],
})
export class AuthModule {}

export { JwtAuthGuard } from './jwt-auth.guard';
