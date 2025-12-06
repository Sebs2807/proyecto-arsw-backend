import { Logger } from '@nestjs/common';

beforeAll(() => {
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
  jest.spyOn(Logger.prototype, 'verbose').mockImplementation(() => {});
});

jest.mock('@qdrant/js-client-rest', () => ({
  QdrantClient: jest.fn().mockImplementation(() => ({
    upsert: jest.fn(),
    search: jest.fn(),
    delete: jest.fn(),
  })),
}));

jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'log').mockImplementation(() => {});

jest.mock(
  'livekit-server-sdk',
  () => {
    const mockAddGrant = jest.fn();
    const mockToJwt = jest.fn(async () => 'mocked-jwt-token');

    const AccessToken = jest.fn().mockImplementation((apiKey, apiSecret, options) => ({
      apiKey,
      apiSecret,
      options,
      addGrant: mockAddGrant,
      toJwt: mockToJwt,
    }));

    return { AccessToken };
  },
  { virtual: true },
);
