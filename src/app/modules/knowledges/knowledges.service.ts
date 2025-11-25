// // knowledge.service.ts
// import { Injectable } from '@nestjs/common';
// import { QdrantClient } from '@qdrant/js-client-rest';
// import { KnowledgeDto } from './knowledge.dto';
// import { embeddingModel } from '../ai/embeddingModel';

// @Injectable()
// export class KnowledgeService {
//   private qdrant = new QdrantClient({ url: 'http://localhost:6333' });
//   private collection = 'knowledge';

//   async createCollectionIfNotExists() {
//     await this.qdrant.ensureCollection(this.collection, {
//       vectors: { size: 1536, distance: 'Cosine' },
//     });
//   }

//   async createKnowledge(dto: KnowledgeDto) {
//     await this.createCollectionIfNotExists();

//     const vector = await embeddingModel(dto.text);

//     const point = {
//       id: crypto.randomUUID(),
//       vector,
//       payload: {
//         text: dto.text,
//         metadata: dto.metadata || {},
//       },
//     };

//     await this.qdrant.upsert(this.collection, { points: [point] });
//     return point;
//   }

//   async getAll() {
//     return await this.qdrant.scroll(this.collection, {});
//   }

//   async getOne(id: string) {
//     return await this.qdrant.retrieve(this.collection, { ids: [id] });
//   }

//   async update(id: string, dto: KnowledgeDto) {
//     const vector = await embeddingModel(dto.text);

//     await this.qdrant.upsert(this.collection, {
//       points: [
//         {
//           id,
//           vector,
//           payload: {
//             text: dto.text,
//             metadata: dto.metadata || {},
//           },
//         },
//       ],
//     });

//     return { id, ...dto };
//   }

//   async delete(id: string) {
//     return await this.qdrant.delete(this.collection, { points: [id] });
//   }
// }
