import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/app/modules/auth/auth.controller';
import { AuthService } from 'src/app/modules/auth/auth.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/app/modules/auth/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let res: Partial<Response>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            loginOrCreateGoogleUser: jest.fn(),
            refreshAccessToken: jest.fn(),
          },
        },
      ],
    })
      // Override guards to avoid real Google/JWT auth during tests
      .overrideGuard(AuthGuard('google'))
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);

    // Mocked Express response object
    res = {
      redirect: jest.fn(),
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  // --- GOOGLE AUTH REDIRECT ---
  it('should redirect to login if Google authentication fails', async () => {
    const req: any = { user: null };
    process.env.FRONTEND_URL = 'https://frontend.com';

    await controller.googleAuthRedirect(req, res as any);

    expect(res.redirect).toHaveBeenCalledWith(
      'https://frontend.com/login?error=google_auth_failed',
    );
  });

  it('should authenticate correctly with Google and set cookies', async () => {
    const req: any = {
      user: {
        email: 'test@mail.com',
        firstName: 'Test',
        lastName: 'User',
        picture: 'pic.jpg',
        refreshToken: 'google-refresh',
      },
    };
    process.env.FRONTEND_URL = 'https://frontend.com';

    jest.spyOn(authService, 'loginOrCreateGoogleUser').mockResolvedValue({
      accessToken: 'mockAccess',
      refreshToken: 'mockRefresh',
    });

    await controller.googleAuthRedirect(req, res as any);

    expect(authService.loginOrCreateGoogleUser).toHaveBeenCalledWith(
      'test@mail.com',
      'Test',
      'User',
      'pic.jpg',
      'google-refresh',
    );
    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.redirect).toHaveBeenCalledWith('https://frontend.com/dashboard');
  });

  // --- REFRESH TOKEN ---
  it('should return an error if there is no refresh token', async () => {
    const req: any = { cookies: {} };

    const result = await controller.refreshToken(req, res as any);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No se encontró refresh token' });
    // FIXED: Assert that the result is the mocked response object
    expect(result).toEqual(res);
  });

  it('should refresh token successfully', async () => {
    const req: any = { cookies: { refreshToken: 'oldToken' } };

    jest.spyOn(authService, 'refreshAccessToken').mockResolvedValue({
      accessToken: 'newAccess',
      refreshToken: 'newRefresh',
    });

    const result = await controller.refreshToken(req, res as any);

    expect(authService.refreshAccessToken).toHaveBeenCalledWith('oldToken');
    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ accessToken: 'newAccess' });
  });

  // --- PROFILE ---
  it('should return the authenticated user profile', () => {
    const req: any = {
      user: {
        id: '1',
        email: 'user@mail.com',
        firstName: 'User',
        lastName: 'Name',
        picture: 'avatar.jpg',
        roles: ['USER'],
      },
    };

    const result = controller.getProfile(req);

    expect(result).toEqual({
      id: '1',
      email: 'user@mail.com',
      firstName: 'User',
      lastName: 'Name',
      picture: 'avatar.jpg',
      roles: ['USER'],
    });
  });
});
