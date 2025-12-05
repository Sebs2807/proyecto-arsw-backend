import { Test } from '@nestjs/testing';
import { JwtStrategy } from '../../../src/app/modules/auth/jwt.strategy';
import { ExtractJwt, Strategy as JwtStrategyBase } from 'passport-jwt';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;

  beforeEach(async () => {
    process.env.JWT_ACCESS_SECRET = 'test-secret';

    const moduleRef = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    jwtStrategy = moduleRef.get(JwtStrategy);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('should extract JWT from request cookies', async () => {
    const extractor = ExtractJwt.fromExtractors([
      (req) => req?.cookies?.accessToken ?? null,
    ]);

    const req = {
      cookies: {
        accessToken: 'my-test-token',
      },
    };

    const token = extractor(req as any);
    expect(token).toBe('my-test-token');
  });

  it('should return null if no accessToken cookie exists', async () => {
    const extractor = ExtractJwt.fromExtractors([
      (req) => req?.cookies?.accessToken ?? null,
    ]);

    const req = { cookies: {} };

    const token = extractor(req as any);
    expect(token).toBeNull();
  });

  it('should validate and return the payload data', () => {
    const payload = {
      id: '123',
      email: 'test@example.com',
    };

    const result = jwtStrategy.validate(payload);

    expect(result).toEqual({
      id: '123',
      email: 'test@example.com',
    });
  });

  it('should extract token using the same extractor as the strategy internally', () => {
    const extractor = ExtractJwt.fromExtractors([
      (req) => req?.cookies?.accessToken ?? null,
    ]);

    const req = {
      cookies: {
        accessToken: 'internal-token-123',
      },
    };

    const token = extractor(req as any);
    expect(token).toBe('internal-token-123');
  });

  it('should return null when request is null', () => {
    const extractor = ExtractJwt.fromExtractors([
      (req) => req?.cookies?.accessToken ?? null,
    ]);

    const token = extractor(null as any);
    expect(token).toBeNull();
  });

  it('should return null when cookies object is undefined', () => {
    const extractor = ExtractJwt.fromExtractors([
      (req) => req?.cookies?.accessToken ?? null,
    ]);

    const req = {};
    const token = extractor(req as any);
    expect(token).toBeNull();
  });
});
