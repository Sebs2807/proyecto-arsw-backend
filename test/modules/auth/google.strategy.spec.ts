import { Test, TestingModule } from '@nestjs/testing';
import { GoogleStrategy } from '../../../src/app/modules/auth/google.strategy';
import { Profile } from 'passport-google-oauth20';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;

  beforeEach(async () => {
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.BACKEND_URL = 'http://localhost:3000';

    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleStrategy],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
  });

  it('should return authorization params', () => {
    const params = strategy.authorizationParams();
    expect(params).toEqual({
      access_type: 'offline',
      prompt: 'consent',
    });
  });

  it('should validate and return GoogleUser object', (done) => {
    const mockProfile: Profile = {
      id: '123',
      provider: 'google',
      emails: [{ value: 'test@example.com' }],
      photos: [{ value: 'http://image.jpg' }],
      name: { givenName: 'John', familyName: 'Doe' },
      displayName: 'John Doe',
      _raw: '',
      _json: {},
    };

    strategy.validate(
      'access-test',
      'refresh-test',
      mockProfile,
      (err, user) => {
        try {
          expect(err).toBeNull();
          expect(user).toEqual({
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            picture: 'http://image.jpg',
            accessToken: 'access-test',
            refreshToken: 'refresh-test',
          });
          done();
        } catch (error) {
          done(error);
        }
      },
    );
  });

  it('should validate with missing profile info', (done) => {
    const mockProfile: Profile = {
      id: '321',
      provider: 'google',
      emails: [],
      photos: [],
      name: null,
      displayName: '',
      _raw: '',
      _json: {},
    };

    strategy.validate('a', 'r', mockProfile, (err, user) => {
      try {
        expect(err).toBeNull();
        expect(user).toEqual({
          email: '',
          firstName: '',
          lastName: '',
          picture: '',
          accessToken: 'a',
          refreshToken: 'r',
        });
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
