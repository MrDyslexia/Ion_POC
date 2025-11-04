import LiveAudioStream from 'react-native-live-audio-stream';
import { AudioConfig, DEFAULT_AUDIO_CONFIG, TranscriptionData, WebSocketMessage } from '../types/audio';

class IonAsrService {
  private ws: WebSocket | null = null;
  private isStreaming = false;
  private isConnected = false;
  private config: AudioConfig = DEFAULT_AUDIO_CONFIG;
  
  // Callbacks
  private transcriptionCallback: ((data: TranscriptionData) => void) | null = null;
  private connectionCallback: ((connected: boolean) => void) | null = null;
  private errorCallback: ((error: string) => void) | null = null;
  private statsCallback: ((chunks: number) => void) | null = null;
  private messageCallback: ((message: WebSocketMessage) => void) | null = null;

  private chunksSent = 0;

  async connect(serverUrl: string = 'wss://techmark-ai.com/asr/ws'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('[ION-ASR] Conectando a:', serverUrl);

        this.disconnect();

        this.ws = new WebSocket(serverUrl);

        this.ws.onopen = () => {
          console.log('[ION-ASR] ✅ WebSocket conectado exitosamente');
          this.isConnected = true;
          this.connectionCallback?.(true);
          this.messageCallback?.({ type: 'connected' });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log('[ION-ASR] Mensaje recibido:', message);
            
            this.messageCallback?.(message);

            switch (message.type) {
              case 'connected':
                console.log('📡 Conectado al servidor');
                break;

              case 'started':
                console.log('🎙️ Stream iniciado');
                break;

              case 'transcription':
                if (message.data) {
                  this.transcriptionCallback?.(message.data);
                }
                break;

              case 'stopped':
                console.log('⏹️ Stream detenido');
                break;

              case 'error':
                console.error('❌ Error del servidor:', message.message);
                this.errorCallback?.(message.message || 'Error del servidor');
                break;

              case 'end':
                console.log('🏁 Stream terminado');
                break;

              default:
                console.warn('[ION-ASR] Tipo de mensaje desconocido:', message.type);
                break;
            }
          } catch (error) {
            console.error('[ION-ASR] Error parsing message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[ION-ASR] ❌ Error WebSocket:', error);
          const errorMsg = 'Error de conexión WebSocket';
          this.errorCallback?.(errorMsg);
          reject(new Error(errorMsg));
        };

        this.ws.onclose = (event) => {
          console.log('[ION-ASR] 🔌 WebSocket cerrado:', event.code, event.reason);
          this.isConnected = false;
          this.isStreaming = false;
          this.connectionCallback?.(false);
        };

        // Timeout de conexión
        setTimeout(() => {
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            console.log('[ION-ASR] ⏱️ Timeout de conexión');
            this.disconnect();
            reject(new Error('Timeout: No se pudo conectar al servidor ION-ASR'));
          }
        }, 10000);

      } catch (error) {
        console.error('[ION-ASR] Error en connect:', error);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  disconnect(): void {
    console.log('[ION-ASR] Desconectando...');
    
    if (this.isStreaming) {
      this.stopStreaming();
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.isStreaming = false;
    this.chunksSent = 0;
  }

  async startStreaming(): Promise<void> {
    if (this.isStreaming) {
      console.warn('[ION-ASR] ⚠️ El streaming ya está activo');
      return;
    }

    if (!this.isConnected || !this.ws) {
      throw new Error('No hay conexión WebSocket activa con ION-ASR');
    }

    try {
      console.log('[ION-ASR] Iniciando streaming con config:', this.config);

      // Enviar comando de inicio al servidor
      this.ws.send(JSON.stringify({ type: 'start' }));

      // Configurar LiveAudioStream
      LiveAudioStream.init({
        sampleRate: this.config.sampleRate,
        channels: this.config.channels,
        bitsPerSample: this.config.bitsPerSample,
        audioSource: this.config.audioSource,
        bufferSize: this.config.bufferSize,
        wavFile: 'audio_stream.wav',
      });

      LiveAudioStream.on('data', (data: any) => {
        if (!this.isConnected || !this.isStreaming || !this.ws) return;

        try {
          let audioData: Int16Array;

          if (typeof data === 'string') {
            // Decodificar base64
            const binaryString = atob(data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.codePointAt(i) ?? 0;
            }
            audioData = new Int16Array(bytes.buffer);
          } else if (data instanceof Uint8Array) {
            audioData = new Int16Array(
              data.buffer,
              data.byteOffset,
              data.byteLength / 2,
            );
          } else {
            console.warn('[ION-ASR] Formato de dato no reconocido:', typeof data);
            return;
          }

          if (audioData.length === 0) {
            console.warn('[ION-ASR] Chunk vacío');
            return;
          }

          // Convertir Int16Array a Float32Array (como en el ejemplo web)
          const float32Array = new Float32Array(audioData.length);
          for (let i = 0; i < audioData.length; i++) {
            float32Array[i] = audioData[i] / 32768; // Normalizar a [-1, 1]
          }

          // Convertir a base64 (igual que el ejemplo web)
          const audioBase64 = this.float32ArrayToBase64(float32Array);

          // Enviar audio al servidor (mismo formato que el ejemplo web)
          const message = {
            type: 'audio',
            audio_data: audioBase64,
            sample_rate: this.config.sampleRate
          };

          this.ws.send(JSON.stringify(message));

          this.chunksSent++;
          this.statsCallback?.(this.chunksSent);

          if (this.chunksSent % 100 === 0) {
            console.log(`[ION-ASR] 📤 Chunks enviados: ${this.chunksSent}`);
          }

        } catch (error) {
          console.error('[ION-ASR] Error procesando chunk de audio:', error);
        }
      });

      LiveAudioStream.start();
      this.isStreaming = true;
      
      console.log('[ION-ASR] ✅ Streaming iniciado exitosamente');

    } catch (error) {
      console.error('[ION-ASR] Error al iniciar streaming:', error);
      this.isStreaming = false;
      throw error;
    }
  }

  stopStreaming(): void {
    if (!this.isStreaming) {
      return;
    }
    try {
      console.log('[ION-ASR] 🛑 Deteniendo streaming...');
      
      // Enviar comando de stop al servidor
      if (this.ws && this.isConnected) {
        try {
          this.ws.send(JSON.stringify({ type: 'stop' }));
        } catch (error) {
          console.error('[ION-ASR] Error enviando stop:', error);
        }
      }

      // Detener LiveAudioStream
      LiveAudioStream.stop()
        .catch((error: any) => {
          console.error('[ION-ASR] Error deteniendo LiveAudioStream:', error);
        });

      this.isStreaming = false;
      console.log('[ION-ASR] ✅ Streaming de audio detenido');
    } catch (error) {
      console.error('[ION-ASR] Error al detener streaming:', error);
      this.isStreaming = false;
    }
  }

  // Convertir Float32Array a base64 (igual que el ejemplo web)
  private float32ArrayToBase64(float32Array: Float32Array): string {
    try {
      const buffer = new ArrayBuffer(float32Array.length * 4);
      const view = new Float32Array(buffer);
      view.set(float32Array);
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCodePoint(bytes[i]);
      }
      return btoa(binary);
    } catch (error) {
      console.error('[ION-ASR] Error en float32ArrayToBase64:', error);
      return '';
    }
  }

  // Setters para callbacks
  setTranscriptionCallback(callback: (data: TranscriptionData) => void): void {
    this.transcriptionCallback = callback;
  }

  setConnectionCallback(callback: (connected: boolean) => void): void {
    this.connectionCallback = callback;
  }

  setErrorCallback(callback: (error: string) => void): void {
    this.errorCallback = callback;
  }

  setStatsCallback(callback: (chunks: number) => void): void {
    this.statsCallback = callback;
  }

  setMessageCallback(callback: (message: WebSocketMessage) => void): void {
    this.messageCallback = callback;
  }

  setAudioConfig(config: Partial<AudioConfig>): void {
    this.config = { ...this.config, ...config };
  }

  isWSConnected(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  isRecording(): boolean {
    return this.isStreaming;
  }

  getChunksSent(): number {
    return this.chunksSent;
  }
}

// Asegúrate de exportar una instancia única
export default new IonAsrService();