import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID:     config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL:  config.get<string>('GOOGLE_CALLBACK_URL') ?? 'http://localhost:8080/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, name, emails } = profile;
    const email: string = emails?.[0]?.value;
    const prenom: string = name?.givenName ?? '';
    const nom: string    = name?.familyName ?? '';

    try {
      const user = await this.authService.validateGoogleUser({ googleId: id, email, nom, prenom });
      done(null, user);
    } catch (err) {
      done(err, undefined);
    }
  }
}
