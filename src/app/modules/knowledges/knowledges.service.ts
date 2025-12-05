import { Injectable, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import crypto from 'crypto';
import { EmbeddingService } from '../ai/services/embeding-model.service';
import { CreateKnowledgeDto } from './dtos/createKnowledge.dto';
import { title } from 'process';

// DTO para la respuesta paginada del servicio
export interface PaginatedResponse<T> {
  points: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// DTO para la lógica de actualización
export class KnowledgeDto {
  text: string; // Texto principal
  category: string; // Categoría del conocimiento
  metadata?: Record<string, any>; // Metadata adicional
  label?: string; // Etiqueta o nombre del conocimiento
  relatedIds?: string[]; // IDs de conocimientos relacionados
  agentId?: string; // ID del agente asociado
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
        agentId: dto.agentId,
      },
    };

    await this.qdrant.upsert(this.collection, { points: [point] });

    this.logger.log(`Knowledge creado: ${pointId}`);
    return point;
  }

  /**
   * Obtener conocimientos paginados con filtros
   * Este es el nuevo método que reemplaza la lógica de `findAll` del controller.
   */
  async getPaginated({
    page = 1,
    limit = 10,
    search,
    agentId,
    category,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    agentId?: string;
    category?: string;
  }): Promise<PaginatedResponse<any>> {
    const offset = (page - 1) * limit;

    // 1. Construir el filtro para Qdrant (AgentId y Category)
    const filterConditions: any[] = [];
    
    // Filtrar por agentId (OBLIGATORIO)
    if (agentId) {
      filterConditions.push({ key: 'agentId', match: { value: agentId } });
    }
    
    // Filtrar por category
    if (category) {
      filterConditions.push({ key: 'category', match: { value: category } });
    }

    const filter = filterConditions.length > 0 
      ? { must: filterConditions }
      : undefined;

    // 2. Obtener el Conteo Total (necesario para la paginación)
    const countResult = await this.qdrant.count(this.collection, { 
      filter, 
      exact: true 
    });
    const totalItems = countResult.count;
    const totalPages = Math.ceil(totalItems / limit);

    // 3. Obtener los Puntos Pagados y Filtrados
    // Reutilizamos la lógica de `search` para buscar por vector/texto y aplicar filtros.
    const searchResults = await this.search(
      limit, 
      agentId, 
      search, 
      undefined, // tags (no implementado en QueryKnowledgeDto)
      offset, // AÑADIDO: Offset para la paginación
      category, // AÑADIDO: Category para el filtrado
    );

    return {
      points: searchResults as any, // Los puntos de Qdrant
      total: totalItems,
      page: page,
      limit: limit,
      totalPages: totalPages,
    };
  }


  /** Obtener todos los conocimientos (DEPRECADO, pero dejado para compatibilidad interna) */
  async getAll(limit = 100, offset = 0) {
    // Esto es solo un scroll, no tiene la metadata de paginación que el FE necesita
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

  /** * Buscar conocimientos con filtros opcionales
   * @param top - Número máximo de resultados (limit)
   * @param agentId - Filtrar por agente específico (OBLIGATORIO para el uso)
   * @param text - Texto para búsqueda semántica (opcional)
   * @param tags - Array de tags para filtrar (opcional)
   * @param offset - Para paginación (AÑADIDO)
   * @param category - Para filtrado (AÑADIDO)
   */
  async search(
    top = 5, 
    agentId?: string, 
    text?: string, 
    tags?: string[], 
    offset = 0, // AÑADIDO
    category?: string // AÑADIDO
  ) {
    // Si hay texto, usar búsqueda semántica; si no, usar vector dummy (para obtener todos los puntos)
    const vector = text 
      ? await this.embeddingService.generate(text)
      : new Array(this.vectorSize).fill(0);
    
    const filterConditions: any[] = [];
    
    // Filtrar por agentId si se proporciona
    if (agentId) {
      filterConditions.push({ key: 'agentId', match: { value: agentId } });
    }
    
    // Filtrar por category si se proporciona
    if (category) {
      filterConditions.push({ key: 'category', match: { value: category } });
    }

    // Filtrar por tags si se proporcionan
    if (tags && tags.length > 0) {
      tags.forEach(tag => {
        filterConditions.push({ key: 'tags', match: { value: tag } });
      });
    }

    const filter = filterConditions.length > 0 
      ? { must: filterConditions }
      : undefined;

    return await this.qdrant.search(this.collection, {
      vector,
      limit: top,
      offset: offset, // AÑADIDO: Usar offset para paginación
      with_payload: true,
      filter,
    });
  }
}