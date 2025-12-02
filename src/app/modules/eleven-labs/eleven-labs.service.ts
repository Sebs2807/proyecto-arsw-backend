// elevenlabs.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ElevenLabsClient } from 'elevenlabs';

@Injectable()
export class ElevenLabsService {
  private readonly logger = new Logger(ElevenLabsService.name);
  private readonly client: ElevenLabsClient;

  constructor() {
    console.log('ELEVENLABS_API_KEY:', process.env.ELEVENLABS_API_KEY);
    this.client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });
  }

  async textToAudio(text: string): Promise<Buffer> {
    try {
      const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

      const stream = await this.client.textToSpeech.convert(voiceId, {
        model_id: 'eleven_turbo_v2',
        text,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
        output_format: 'ulaw_8000',
      });

      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }

      const completeBuffer = Buffer.concat(chunks);

      // Si tiene header WAV (RIFF....WAVEfmt), quitamos los primeros 44 bytes
      // (o buscamos 'data' y saltamos, pero 44 es estándar para PCM/u-law wavs simples)
      if (completeBuffer.subarray(0, 4).toString() === 'RIFF') {
        console.log('✂️ Eliminando header WAV del audio (44 bytes)');
        return completeBuffer.subarray(44);
      }

      return completeBuffer;
    } catch (error) {
      this.logger.error('❌ Error en textToAudio()', error);
      return Buffer.alloc(0);
    }
  }

  async *textToAudioStream(text: string): AsyncGenerator<Buffer> {
    try {
      const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

      const stream = await this.client.textToSpeech.convert(voiceId, {
        model_id: 'eleven_turbo_v2',
        text,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
        output_format: 'ulaw_8000',
      });

      let isFirstChunk = true;
      for await (const chunk of stream) {
        let buffer = Buffer.from(chunk);

        if (isFirstChunk) {
          isFirstChunk = false;
          if (buffer.subarray(0, 4).toString() === 'RIFF') {
            console.log('✂️ Eliminando header WAV del stream (44 bytes)');
            buffer = buffer.subarray(44);
          }
        }

        yield buffer;
      }
    } catch (error) {
      this.logger.error('❌ Error en textToAudioStream()', error);
    }
  }
}
