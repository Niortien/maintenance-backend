import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';

export interface JwtPayload {
  sub: string;         // responsable id
  email: string;
  siteId: string;
  role: 'RESPONSABLE';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
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

  async validate(payload: JwtPayload) {
    const responsable = await this.prisma.responsableSite.findUnique({
      where: { id: payload.sub },
      include: { site: true },
    });
    if (!responsable) throw new UnauthorizedException('Session invalide');
    return responsable;
  }
}
