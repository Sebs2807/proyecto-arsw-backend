import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';

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
    console.log(process.env.BACKEND_URL + '/v1/auth/google/callback');
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.BACKEND_URL + '/v1/auth/google/callback',
      scope: ['email', 'profile', 'https://www.googleapis.com/auth/calendar'], // eliminado la coma extra
      accessType: 'offline',
      prompt: 'consent',
    });
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

    done(null, user);
  }
}
