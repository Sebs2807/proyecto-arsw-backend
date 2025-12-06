import { Test, TestingModule } from '@nestjs/testing';
import { EmbeddingService } from 'src/app/modules/ai/services/embeding-model.service'; 

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    embeddings: {
      create: jest.fn(),
    },
  }));
});

import OpenAI from 'openai';

describe('EmbeddingService', () => {
  let service: EmbeddingService;
  let openaiMock: jest.Mocked<OpenAI>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmbeddingService],
    }).compile();

    service = module.get<EmbeddingService>(EmbeddingService);

    openaiMock = (service as any).openai; 
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate embeddings', async () => {
    const mockEmbedding = [0.1, 0.2, 0.3];

    openaiMock.embeddings.create.mockResolvedValue({
      data: [
        {
          embedding: mockEmbedding,
        },
      ],
    } as any);

    const result = await service.generate('hola mundo');

    expect(result).toEqual(mockEmbedding);
    expect(openaiMock.embeddings.create).toHaveBeenCalledWith({
      model: 'text-embedding-3-small',
      input: 'hola mundo',
    });
  });

  it('should throw error if OpenAI fails', async () => {
    openaiMock.embeddings.create.mockRejectedValue(new Error('API error'));

    await expect(service.generate('text')).rejects.toThrow('API error');
  });
});
