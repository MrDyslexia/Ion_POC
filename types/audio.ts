export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
  audioSource: number;
  bufferSize: number;
}

export interface TranscriptionData {
  chunk_index: number;
  transcription_type: number;
  am_transcription: string[];
  lm_transcription: string[];
}

export interface WebSocketMessage {
  type: 'connected' | 'started' | 'transcription' | 'stopped' | 'error' | 'end';
  data?: TranscriptionData;
  message?: string;
}

export interface Message {
  id: number;
  text: string;
  timestamp: string;
  type: 'recognized';
}

export interface PartialTextState {
  [chunkId: string]: {
    text: string;
    confirmed: boolean;
  };
}

export interface Stats {
  chunks: number;
  transcriptions: number;
  time: string;
}

export interface AudioStreamState {
  isRecording: boolean;
  isConnected: boolean;
  error: string | null;
}

// Nuevos tipos para la UI mejorada
export interface Hypothesis {
  text: string;
  rank: number;
}

export interface AppState {
  isRecording: boolean;
  isConnected: boolean;
  error: string | null;
  messages: Message[];
  partialText: PartialTextState;
  currentHypotheses: string[];
  stats: Stats;
  showSettings: boolean;
  serverUrl: string;
}

export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  sampleRate: 16000,
  channels: 1,
  bitsPerSample: 16,
  audioSource: 6,
  bufferSize: 4096,
};