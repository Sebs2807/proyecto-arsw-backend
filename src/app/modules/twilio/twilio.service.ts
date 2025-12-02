import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { language } from 'googleapis/build/src/apis/language';
import * as Twilio from 'twilio';

@Injectable()
export class TwilioService {
  private client: Twilio.Twilio;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (accountSid && authToken) {
      this.client = new Twilio.Twilio(accountSid, authToken);
    }
  }

  generateConversationRelayTwiML(wsUrl: string, agentId: string, welcomeGreeting: string): string {
    const response = new Twilio.twiml.VoiceResponse();

    const connect = response.connect();

    // ConversationRelay TTS
    // Usamos addChild porque la librería de Twilio puede no tener el tipado para conversationRelay aún
    // TwilioService.ts
    const relay = connect.addChild('ConversationRelay', {
      url: wsUrl,

      // **AÑADIR STT/TTS como atributos planos (¡Obligatorio!)**
      language: 'es-MX', // <-- Código de idioma regional compatible para STT y TTS

      // **OPCIONAL: Para forzar el proveedor de STT**
      transcriptionProvider: 'deepgram', // Twilio recomienda Deepgram para mejor STT
      speechModel: 'nova-3-general', // Modelo recomendado por Deepgram

      // **Configuración ElevenLabs (TTS)**
      ttsProvider: 'ElevenLabs',
      voice: 'o2vbTbO3g4GrKUg7rehy', // <-- Usar solo el ID base para evitar el error 64101
      elevenlabsTextNormalization: 'on',

      // Otros atributos
      welcomeGreeting: welcomeGreeting,
      interruptible: 'true', // Asegúrate de que sea un string 'true' o 'false'
    });

    // Agregar parámetros custom si los necesitas
    relay.addChild('Parameter', { name: 'agentId', value: agentId });

    return response.toString();
  }

  async initiateCall(to: string, agentId: string, publicUrl: string): Promise<string> {
    const from = this.configService.get<string>('TWILIO_VERIFIED_CALLER_ID');
    console.log('TWILIO_VERIFIED_CALLER_ID:', from);

    if (!from) {
      throw new Error('TWILIO_VERIFIED_CALLER_ID not configured');
    }

    const url = `${publicUrl}/twilio/voice?agentId=${agentId}`;

    console.log(`Iniciando llamada Twilio a ${to} desde ${from} con URL: ${url}`);

    const call = await this.client.calls.create({
      to: '+573202293663',
      from: '+19802819598',
      url,
      method: 'GET',
    });

    console.log(`Llamada iniciada con SID: ${call.sid}`);

    return call.sid;
  }
}
