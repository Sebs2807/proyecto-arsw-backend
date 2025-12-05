import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { AgentsService } from '../../agents/agents.service';
import { KnowledgeService } from '../../knowledges/knowledges.service';
import { CardService } from '../../cards/cards.service';
import { CardEntity } from 'src/database/entities/card.entity';

@Injectable()
export class OpenAILiveService {
  private readonly logger = new Logger(OpenAILiveService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly agentsService: AgentsService,
    private readonly knowledgeService: KnowledgeService,
    @Inject(forwardRef(() => CardService))
    private readonly cardsService: CardService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Genera el primer saludo de un agente para un prospecto.
   */
  async generateFirstGreeting(agentId: string, cardId: string): Promise<string> {
    try {
      const agent = await this.agentsService.findOne(agentId);
      const card: CardEntity = await this.cardsService.findOne(cardId);

      const agentName = agent.name ?? 'Agente Virtual';
      const flow = agent.flowConfig ?? {};
      const temperature = agent.temperature ?? 0.7;
      const maxTokens = agent.maxTokens ?? 120;

      // === SISTEMA PROMPT ===
      const SYSTEM_PROMPT_GREETING = `
Eres el agente telefónico profesional y amable **${agentName}**.
Tu única tarea es iniciar la llamada con un saludo conciso y atractivo.
Responde **exclusivamente** con el texto que debe decir el agente.
`;

      // Obtener conocimientos relevantes para el nodo "greeting"
      const greetingKnowledge = await this.knowledgeService.search(5, agentId, undefined, [
        'greeting',
      ]);

      const knowledgeText = greetingKnowledge?.length
        ? greetingKnowledge.map((k) => `- ${k.payload?.title}: ${k.payload?.text}`).join('\n')
        : 'No hay conocimientos específicos para el nodo greeting.';

      // === USER PROMPT (Contexto Dinámico) ===
      const userPrompt = `
### Tarea: Generar Saludo Inicial
IMPORTANTE: *Esta llamada SIEMPRE la inicia el agente*.

### Información del prospecto
- Nombre: ${card.contactName ?? 'No especificado'}
- Empresa: ${card?.title ?? 'No especificado'}
- Industria: ${card?.industry ?? 'No especificada'}
- Prioridad: ${card?.priority ?? 'No especificada'}

### Objetivo del Saludo (Nodo: "greeting")
- Objetivo del Flujo: ${flow?.nodes?.['greeting']?.goal || 'Saludar, presentarse y establecer el motivo de la llamada.'}
- Instrucciones: Saluda de forma breve, amable y profesional. Personaliza usando nombre y empresa/industria. Explica claramente por qué llamas.

### Conocimientos relevantes para el saludo:
${knowledgeText}
`;

      // Llamada a OpenAI
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT_GREETING },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
      });

      const greetingText = response.choices[0]?.message?.content?.trim() ?? '';

      // Actualizar estado de la conversación en la tarjeta
      const conversationState = {
        currentNode: 'greeting',
        history: [
          ...(card.conversationState?.history ?? []),
          {
            node: 'greeting',
            text: greetingText,
            timestamp: new Date().toISOString(),
          },
        ],
      };

      await this.cardsService.updateConversationState(cardId, conversationState);

      // Emitir evento en tiempo real
      this.cardsService.realtimeGateway.emitGlobalUpdate('conversation:update', {
        cardId,
        conversationState,
      });

      return greetingText;
    } catch (err) {
      this.logger.error('Error en generateFirstGreeting()', err);
      return 'Hola, te habla nuestro asistente virtual.';
    }
  }

  /**
   * Ejecuta el flujo de conversación de un agente para un mensaje entrante
   */
  async runAgent(
    agentId: string,
    userMessage: string,
    conversationState: any,
    prospect: any,
  ): Promise<any> {
    try {
      const agent = await this.agentsService.findOne(agentId);

      // Obtener conocimientos relevantes
      const knowledgeResults = await this.knowledgeService.search(3, agentId, userMessage);
      const topMatches = knowledgeResults
        .map((k) => {
          let text: string;
          if (typeof k.payload?.text === 'string') {
            text = k.payload.text;
          } else if (k.payload?.text) {
            text = JSON.stringify(k.payload.text);
          } else {
            text = '';
          }
          return `- ${typeof k.payload?.title === 'string' ? k.payload.title : 'Untitled'}: ${text}`;
        })
        .join('\n');

      // === SISTEMA PROMPT ===
      const SYSTEM_PROMPT_RUN_AGENT = `
Eres un agente de ventas AI, profesional y directo.
Tu tarea es simular una conversación telefónica siguiendo un flujo de pasos.
Debes determinar si el objetivo del nodo actual se ha cumplido y si es necesario avanzar.
Devuelve SIEMPRE un objeto JSON que cumpla **estrictamente** con el formato requerido.
`;

      // === USER PROMPT (Contexto Dinámico) ===
      const userPrompt = `
### Contexto de la Interacción

1.  **Prospecto:**
    - Nombre: ${prospect.contactName} (${prospect.company})
    - Teléfono: ${prospect.contactPhone}
    
2.  **Flujo y Estado Actual:**
    - Nodo actual: "${conversationState.currentNode}"
    - Objetivo del nodo: "${agent.flowConfig?.nodes?.[conversationState.currentNode]?.goal || 'N/A'}"
    - Siguiente nodo predefinido: "${agent.flowConfig?.nodes?.[conversationState.currentNode]?.next || 'null'}"
    
3.  **Entrada del Usuario:** "${userMessage}"

4.  **Conocimientos Relevantes (Búsqueda):**
    ${topMatches}

### Reglas de Decisión
- Sigue **estrictamente** el flujo de conversación definido por el 'Nodo actual' y su 'Objetivo'.
- **Solo** pasa al siguiente nodo ('shouldMoveNext: true') si el objetivo del nodo actual se cumplió o si la respuesta del usuario lo hace necesario.

### Formato de Salida Requerido (JSON)
{
  "reply": "Texto que el agente debe decir en respuesta al usuario",
  "shouldMoveNext": true/false,
  "nextNode": "nombre_siguiente_nodo_o_null",
  "reason": "Explicación corta de por qué se avanza o se mantiene el nodo"
}
`;

      // Llamada a OpenAI
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT_RUN_AGENT },
          { role: 'user', content: userPrompt },
        ],
        temperature: agent.temperature ?? 0.7,
        max_tokens: agent.maxTokens ?? 300,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No content received from OpenAI');

      // El manejo del estado y la emisión WS se hace en el caller (RealtimeGateway)
      const agentResponse = JSON.parse(content);

      return agentResponse;
    } catch (error) {
      this.logger.error('Error en runAgent()', error);
      throw error;
    }
  }
}
