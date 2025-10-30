import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserWorkspaceEntity } from 'src/database/entities/userworkspace.entity';

interface RequestWithCookies extends Request {
  cookies: { [key: string]: string };
}

export interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
  };
}

interface GoogleUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  refreshToken: string;
}

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const googleUser = req.user as GoogleUserPayload;

    if (!googleUser) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
    }

    const { accessToken, refreshToken } = await this.authService.loginOrCreateGoogleUser(
      googleUser.email,
      googleUser.firstName,
      googleUser.lastName,
      googleUser.picture,
      googleUser.refreshToken,
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return res.redirect(`${process.env.FRONTEND_URL}/`);
  }

  @Get('refresh-token')
  async refreshToken(@Req() req: RequestWithCookies, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No se encontró refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshAccessToken(refreshToken);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    if (newRefreshToken) {
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
    }

    return { accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: RequestWithUser) {
    return {
      id: req.user.id,
      email: req.user.email,
    };
  }
}
