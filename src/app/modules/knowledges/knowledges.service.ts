// knowledge.service.ts
import { Injectable, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import crypto from 'crypto';
import { EmbeddingService } from '../ai/services/embeding-model.service';
import { CreateKnowledgeDto } from './dtos/createKnowledge.dto';
import { title } from 'process';

// DTO
export class KnowledgeDto {
  text: string; // Texto principal
  category: string; // Categoría del conocimiento
  metadata?: Record<string, any>; // Metadata adicional
  label?: string; // Etiqueta o nombre del conocimiento
  relatedIds?: string[]; // IDs de conocimientos relacionados
}

@Injectable()
export class KnowledgeService implements OnModuleInit {
  private readonly logger = new Logger(KnowledgeService.name);
  private readonly qdrant = new QdrantClient({
    url: process.env.QDRANT_URL,
  });
  private readonly collection = 'knowledge';
  private readonly vectorSize = 1536;

  constructor(private readonly embeddingService: EmbeddingService) {}

  // Inicialización: crear colección si no existe
  async onModuleInit() {
    await this.ensureCollectionExists();
  }

  // Crear colección si no existe
  private async ensureCollectionExists() {
    const cols = await this.qdrant.getCollections();
    const exists = cols.collections.some((c: any) => c.name === this.collection);

    if (!exists) {
      await this.qdrant.createCollection(this.collection, {
        vectors: { size: this.vectorSize, distance: 'Cosine' },
      });
      this.logger.log(`Collection "${this.collection}" creada correctamente.`);
    }
  }

  /** Crear un nuevo conocimiento */
  async createKnowledge(dto: CreateKnowledgeDto) {
    const vector = await this.embeddingService.generate(dto.text);
    const pointId = crypto.randomUUID();

    const point = {
      id: pointId,
      vector,
      payload: {
        title: dto.title,
        text: dto.text,
        category: dto.category,
        tags: dto.tags || [],
        metadata: dto.metadata || {},
      },
    };

    await this.qdrant.upsert(this.collection, { points: [point] });

    this.logger.log(`Knowledge creado: ${pointId}`);
    return point;
  }

  /** Obtener todos los conocimientos */
  async getAll(limit = 100, offset = 0) {
    return await this.qdrant.scroll(this.collection, { limit, offset });
  }

  /** Obtener un conocimiento por ID */
  async getOne(id: string) {
    const result = await this.qdrant.retrieve(this.collection, { ids: [id] });
    if (!result || !result[0]) throw new NotFoundException(`Knowledge ${id} not found`);
    return result[0];
  }

  /** Actualizar un conocimiento existente */
  async update(id: string, dto: KnowledgeDto) {
    const vector = await this.embeddingService.generate(dto.text);
    await this.qdrant.upsert(this.collection, {
      points: [
        {
          id,
          vector,
          payload: {
            text: dto.text,
            label: dto.label || dto.text.substring(0, 50),
            category: dto.category,
            metadata: dto.metadata || {},
            relatedIds: dto.relatedIds || [],
          },
        },
      ],
    });
    this.logger.log(`Knowledge actualizado: ${id}`);
    return { id, ...dto };
  }

  /** Eliminar un conocimiento */
  async delete(id: string) {
    await this.qdrant.delete(this.collection, { points: [id] });
    this.logger.log(`Knowledge eliminado: ${id}`);
    return { message: `Knowledge ${id} eliminado correctamente` };
  }

  /** Buscar conocimientos similares por texto */
  async search(text: string, top = 5) {
    const vector = await this.embeddingService.generate(text);
    return await this.qdrant.search(this.collection, {
      vector,
      limit: top,
      with_payload: true,
    });
  }

  /** Buscar por etiqueta */
  async searchByLabel(label: string, top = 5) {
    return await this.qdrant.search(this.collection, {
      vector: new Array(this.vectorSize).fill(0), // Dummy vector solo para filtro
      limit: top,
      with_payload: true,
      filter: { must: [{ key: 'label', match: { value: label } }] },
    });
  }
}
