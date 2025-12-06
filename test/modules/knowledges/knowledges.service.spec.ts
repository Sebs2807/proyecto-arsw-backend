import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeService } from 'src/app/modules/knowledges/knowledges.service';
import { EmbeddingService } from 'src/app/modules/ai/services/embeding-model.service';
import { NotFoundException } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

describe('KnowledgeService', () => {
  let service: KnowledgeService;

  // -----------------------------
  // MOCKS
  // -----------------------------
  const mockEmbeddingService = {
    generate: jest.fn().mockResolvedValue(new Array(1536).fill(0.5)),
  };

  const mockQdrantClient = {
    getCollections: jest.fn(),
    createCollection: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
    search: jest.fn(),
    scroll: jest.fn(),
    retrieve: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeService,
        {
          provide: EmbeddingService,
          useValue: mockEmbeddingService,
        },
        {
          provide: QdrantClient,
          useValue: mockQdrantClient,
        },
      ],
    })
      .overrideProvider(KnowledgeService)
      .useFactory({
        factory: () =>
          new KnowledgeService(mockEmbeddingService as any),
      })
      .compile();

    service = module.get<KnowledgeService>(KnowledgeService);

    // Inyecta manualmente el mock de Qdrant porque es new QdrantClient() dentro del servicio
    (service as any).qdrant = mockQdrantClient;
  });

  // -----------------------------
  // onModuleInit + ensureCollectionExists
  // -----------------------------
  describe('onModuleInit', () => {
    it('crea la colección si no existe', async () => {
      mockQdrantClient.getCollections.mockResolvedValue({
        collections: [],
      });

      mockQdrantClient.createCollection.mockResolvedValue({});

      await service.onModuleInit();

      expect(mockQdrantClient.getCollections).toHaveBeenCalled();
      expect(mockQdrantClient.createCollection).toHaveBeenCalled();
    });

    it('NO crea la colección si ya existe', async () => {
      mockQdrantClient.getCollections.mockResolvedValue({
        collections: [{ name: 'knowledge' }],
      });

      await service.onModuleInit();

      expect(mockQdrantClient.createCollection).not.toHaveBeenCalled();
    });
  });

  // -----------------------------
  // createKnowledge
  // -----------------------------
  describe('createKnowledge', () => {
    it('debería crear un knowledge', async () => {
      const dto = {
        text: 'Hola',
        title: 'Título',
        category: 'faq',
        tags: [],
        metadata: {},
        agentId: 'A1',
      };

      const result = await service.createKnowledge(dto);

      expect(mockEmbeddingService.generate).toHaveBeenCalledWith(dto.text);
      expect(mockQdrantClient.upsert).toHaveBeenCalled();
      expect(result.id).toBeDefined();
    });
  });

  // -----------------------------
  // getPaginated
  // -----------------------------
  describe('getPaginated', () => {
    it('retorna datos paginados', async () => {
      mockQdrantClient.count.mockResolvedValue({ count: 15 });

      mockQdrantClient.search.mockResolvedValue([
        { id: '1', payload: {} },
        { id: '2', payload: {} },
      ]);

      const result = await service.getPaginated({
        page: 1,
        limit: 10,
        agentId: 'A1',
      });

      expect(mockQdrantClient.count).toHaveBeenCalled();
      expect(result.total).toBe(15);
      expect(result.totalPages).toBe(2);
      expect(result.points).toHaveLength(2);
    });
  });

  // -----------------------------
  // getOne
  // -----------------------------
  describe('getOne', () => {
    it('retorna un elemento existente', async () => {
      mockQdrantClient.retrieve.mockResolvedValue([{ id: '123', payload: {} }]);

      const result = await service.getOne('123');

      expect(result).toEqual({ id: '123', payload: {} });
    });

    it('lanza NotFoundException si no existe', async () => {
      mockQdrantClient.retrieve.mockResolvedValue([]);

      await expect(service.getOne('abc')).rejects.toThrow(NotFoundException);
    });
  });

  // -----------------------------
  // update
  // -----------------------------
  describe('update', () => {
    it('actualiza un knowledge', async () => {
      const dto = {
        text: 'nuevo texto',
        category: 'faq',
        metadata: {},
        relatedIds: [],
      };

      const result = await service.update('ID123', dto);

      expect(mockEmbeddingService.generate).toHaveBeenCalledWith(dto.text);
      expect(mockQdrantClient.upsert).toHaveBeenCalled();
      expect(result).toEqual({ id: 'ID123', ...dto });
    });
  });

  // -----------------------------
  // delete
  // -----------------------------
  describe('delete', () => {
    it('elimina un knowledge por id', async () => {
      await service.delete('999');

      expect(mockQdrantClient.delete).toHaveBeenCalledWith('knowledge', {
        points: ['999'],
      });
    });
  });

  // -----------------------------
  // search
  // -----------------------------
  describe('search', () => {
    it('realiza búsqueda semántica si hay texto', async () => {
      mockQdrantClient.search.mockResolvedValue([]);

      await service.search(5, 'A1', 'hola');

      expect(mockEmbeddingService.generate).toHaveBeenCalledWith('hola');
      expect(mockQdrantClient.search).toHaveBeenCalled();
    });

    it('usa vector dummy si NO hay texto', async () => {
      mockQdrantClient.search.mockResolvedValue([]);

      await service.search(5, 'A1', undefined);

      expect(mockEmbeddingService.generate).not.toHaveBeenCalled();
      expect(mockQdrantClient.search).toHaveBeenCalled();
    });

    it('aplica filtros (agentId, category, tags)', async () => {
      mockQdrantClient.search.mockResolvedValue([]);

      await service.search(5, 'A1', 'hola', ['tag1'], 0, 'faq');

      const filterArg = mockQdrantClient.search.mock.calls[0][1].filter.must;

      expect(filterArg).toContainEqual({ key: 'agentId', match: { value: 'A1' } });
      expect(filterArg).toContainEqual({ key: 'category', match: { value: 'faq' } });
      expect(filterArg).toContainEqual({ key: 'tags', match: { value: 'tag1' } });
    });
  });
});
