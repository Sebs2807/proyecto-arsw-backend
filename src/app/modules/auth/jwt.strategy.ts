import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { UserWorkspaceEntity } from 'src/database/entities/userworkspace.entity';

interface JwtPayload {
  id: string;
  email: string;
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
        (req: RequestWithCookies): string | null => {
          console.log('Cookies recibidas:', req?.cookies); // <-- aquí logueamos
          return req?.cookies?.accessToken ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  validate(payload: JwtPayload) {
    console.log('Payload decodificado:', payload); // <-- opcional
    return {
      id: payload.id,
      email: payload.email,
    };
  }
}
