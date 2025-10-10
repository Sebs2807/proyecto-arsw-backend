import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';

interface JwtPayload {
  id: string;
  email: string;
  roles?: string[];
}

interface RequestWithCookies extends Request {
  cookies: {
    accessToken?: string;
    refreshToken?: string;
    [key: string]: string | undefined;
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: RequestWithCookies): string | null => req?.cookies?.accessToken ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  validate(payload: JwtPayload) {
    return {
      id: payload.id,
      email: payload.email,
      roles: payload.roles ?? [],
    };
  }
}
