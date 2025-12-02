// openai-live.service.ts

import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { AgentsService } from '../../agents/agents.service';
import { KnowledgeService } from '../../knowledges/knowledges.service';
import { writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { createReadStream } from 'fs';
import { encode } from 'wav-encoder';

@Injectable()
export class OpenAILiveService {
  private readonly logger = new Logger(OpenAILiveService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly agentsService: AgentsService,
    private readonly knowledgeService: KnowledgeService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateFirstGreeting(agentId: string): Promise<string> {
    try {
      const agent = await this.agentsService.findOne(agentId);

      // Sanitizar valores
      const agentName = agent.name ?? 'Agente Virtual';
      const flow = agent.flowConfig ?? {};
      const boards = agent.boards ?? [];
      const lists = agent.lists ?? [];
      const temperature = agent.temperature ?? 0.7;
      const maxTokens = agent.maxTokens ?? 120;

      const knowledgeFromBoards = boards.map((b) => ({
        id: b.id,
        title: b.title ?? '',
        description: b.description ?? '',
      }));

      const knowledgeFromLists = lists.map((l) => ({
        id: l.id,
        title: l.title ?? '',
        description: l.description ?? '',
      }));

      const prompt = `
      Eres el agente telefónico **${agentName}**.
      El usuario acaba de contestar la llamada.

      ### Objetivo del Agente
      Sigue al pie de la letra el siguiente JSONFlow:
      ${JSON.stringify(flow, null, 2)}

      ### Base de Conocimiento (Boards + Lists)
      Úsala para contextualizar el saludo.
      Boards:
      ${JSON.stringify(knowledgeFromBoards, null, 2)}

      Lists:
      ${JSON.stringify(knowledgeFromLists, null, 2)}

      ### Instrucciones
      - Genera un saludo breve y profesional.
      - Adáptalo al flow.
      - No menciones nada técnico.
      - Solo produce texto.
    `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un agente telefónico profesional.' },
          { role: 'user', content: prompt },
        ],
        temperature,
        max_tokens: maxTokens,
      });

      console.log('Saludo generado por IA:', response.choices[0].message.content);

      return response.choices[0].message.content ?? '';
    } catch (err) {
      this.logger.error('Error en generateFirstGreeting()', err);
      return 'Hola, te habla nuestro asistente virtual. ¿En qué puedo ayudarte hoy?';
    }
  }
  /**
   * Transcribe un buffer de audio a texto usando la API de OpenAI
   * @param audioBuffer Buffer de audio (wav, mp3, etc.)
   * @returns texto transcrito
   */
  /**
   * Transcribe un buffer de Twilio MediaStream a texto
   * @param audioBuffer Buffer base64 -> PCM 16-bit
   */
  async transcribeAudio(audioBuffer: Buffer, sampleRate = 16000): Promise<string> {
    try {
      // Convertir PCM16 a Float32
      const pcm16 = new Int16Array(
        audioBuffer.buffer,
        audioBuffer.byteOffset,
        audioBuffer.length / 2,
      );
      const float32 = Float32Array.from(pcm16, (v) => v / 32768);

      // Generar WAV
      const wavData = {
        sampleRate, // Usar el sampleRate dinámico
        channelData: [float32], // mono
      };

      const wavBuffer = await encode(wavData);
      const filePath = join(tmpdir(), `twilio_${Date.now()}.wav`);
      writeFileSync(filePath, Buffer.from(wavBuffer));

      // Transcribir usando OpenAI Whisper
      const transcription = await this.openai.audio.transcriptions.create({
        file: createReadStream(filePath),
        model: 'whisper-1',
      });

      return transcription.text ?? '';
    } catch (error) {
      this.logger.error('Error transcribiendo audio', error);
      throw error;
    }
  }


  async runAgent(
    agentId: string,
    userMessage: string,
    conversationState: any,
    prospect: any,
  ): Promise<any> {
    try {
      const agent = await this.agentsService.findOne(agentId);

      // 1. Retrieve relevant knowledge
      const knowledgeResults = await this.knowledgeService.search(userMessage, 3);
      const topMatches = knowledgeResults
        .map((k) => `- ${k.payload?.title || 'Untitled'}: ${k.payload?.text || ''}`)
        .join('\n');

      // 2. Construct the prompt
      const prompt = `
Tu rol: Eres un agente de ventas AI que sigue un flujo de llamada estructurado paso a paso.

### INFORMACIÓN DEL PROSPECTO
- Nombre: ${prospect.contactName}
- Empresa: ${prospect.company}
- Industria: ${prospect.industry}
- Teléfono: ${prospect.contactPhone}

### CONTEXTO DEL FLUJO
- Nodo actual del flujo: "${conversationState.currentNode}"
- Objetivo del nodo: "${agent.flowConfig?.nodes?.[conversationState.currentNode]?.goal || 'N/A'}"
- Siguiente nodo: "${agent.flowConfig?.nodes?.[conversationState.currentNode]?.next || 'null'}"

### CONTEXTO DE LA CONVERSACIÓN
- Último mensaje del usuario (transcripción): "${userMessage}"
- Embeddings relevantes encontrados (conocimiento):
  ${topMatches}

### INSTRUCCIONES
1. **Sigue estrictamente el flujo**.
2. La *única* razón para moverte al siguiente nodo es:
   - Ya cumpliste el *goal* del nodo actual.
   - O el usuario ya te dio la información necesaria.
3. Devuelve SIEMPRE un JSON con esta estructura:

{
  "reply": "Lo que debes decir por voz",
  "shouldMoveNext": true/false,
  "nextNode": "nombre_del_siguiente_nodo_o_null",
  "reason": "Explicación muy corta de por qué"
}

### TU TAREA
Genera la respuesta al prospecto y determina si debes avanzar al siguiente nodo.
`;

      // 3. Call OpenAI
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un agente de ventas AI.' },
          { role: 'user', content: prompt },
        ],
        temperature: agent.temperature || 0.7,
        max_tokens: agent.maxTokens || 300,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      this.logger.error('Error in runAgent', error);
      throw error;
    }
  }
}
