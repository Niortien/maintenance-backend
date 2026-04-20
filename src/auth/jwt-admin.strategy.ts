import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';

export interface JwtAdminPayload {
  sub: string;
  email: string;
  role: 'ADMIN';
}

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'fallback-secret',
    });
  }

  async validate(payload: JwtAdminPayload) {
    if (payload.role !== 'ADMIN') throw new UnauthorizedException('Accès admin requis');
    const admin = await this.prisma.admin.findUnique({ where: { id: Number(payload.sub) } });
    if (!admin) throw new UnauthorizedException('Session invalide');
    return admin;
  }
}
