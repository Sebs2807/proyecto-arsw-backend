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
    getCollections: jest.fn(),
    upsert: jest.fn(),
    search: jest.fn(),
    delete: jest.fn(),
  })),
}));

jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'log').mockImplementation(() => {});
