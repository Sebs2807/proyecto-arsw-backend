import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';

interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `https://structural-clerk-concert-mature.trycloudflare.com/v1/auth/google/callback`,
      scope: ['email', 'profile', 'https://www.googleapis.com/auth/calendar'],
    });
  }

  authorizationParams(): Record<string, string> {
    return {
      access_type: 'offline',
      prompt: 'consent',
    };
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const emails = profile.emails ?? [];
    const photos = profile.photos ?? [];
    const name = profile.name ?? { givenName: '', familyName: '' };

    const user: GoogleUser = {
      email: emails[0]?.value ?? '',
      firstName: name.givenName ?? '',
      lastName: name.familyName ?? '',
      picture: photos[0]?.value ?? '',
      accessToken,
      refreshToken,
    };

    console.log('REFRESH TOKEN =>', refreshToken);

    done(null, user);
  }
}
