import {useState, useEffect, useCallback, useRef} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import IonAsrService from '../services/IonAsrService';
import type {AudioStreamState, TranscriptionData, Message, PartialTextState, Stats, Hypothesis} from '../types/audio';

export const useAudioStream = (initialServerUrl: string = 'wss://techmark-ai.com/asr/ws') => {
  const [state, setState] = useState<AudioStreamState>({
    isRecording: false,
    isConnected: false,
    error: null,
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [partialText, setPartialText] = useState<PartialTextState>({});
  const [currentHypotheses, setCurrentHypotheses] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>({ chunks: 0, transcriptions: 0, time: '00:00' });
  const [serverUrl, setServerUrl] = useState<string>(initialServerUrl);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  const isMountedRef = useRef(true);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Permiso de Micrófono',
            message: 'Esta app necesita acceso al micrófono para grabar audio',
            buttonNeutral: 'Preguntar después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Aceptar',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (err) {
      console.error('Error al solicitar permisos:', err);
      return false;
    }
  };

  // Manejar transcripciones (igual que el ejemplo web)
  const handleTranscription = useCallback((data: TranscriptionData) => {
    if (!isMountedRef.current) return;

    const chunkId = data.chunk_index.toString();
    const transcriptionType = typeof data.transcription_type === 'number' 
      ? data.transcription_type 
      : parseInt(String(data.transcription_type));

    console.log('📝 Transcripción recibida:', {
      type: transcriptionType,
      chunk: chunkId,
      am: data.am_transcription,
      lm: data.lm_transcription
    });

    setStats(prev => ({ ...prev, transcriptions: prev.transcriptions + 1 }));

    switch (transcriptionType) {
      case 0: // PARTIAL_LOW
        if (data.am_transcription && data.am_transcription.length > 0) {
          setPartialText(prev => {
            const existing = prev[chunkId] || { text: '', confirmed: false };
            if (!existing.confirmed) {
              return {
                ...prev,
                [chunkId]: {
                  text: existing.text + ' ' + data.am_transcription[0],
                  confirmed: false
                }
              };
            }
            return prev;
          });
        }
        break;

      case 1: // CONFIRMED
        if (data.am_transcription && data.am_transcription.length > 0) {
          setPartialText(prev => ({
            ...prev,
            [chunkId]: {
              text: data.am_transcription[0],
              confirmed: true
            }
          }));
        }
        break;

      case 2: // RECOGNIZED
        if (data.lm_transcription && data.lm_transcription.length > 0) {
          const mainResult = data.lm_transcription[0];
          const hypotheses = data.lm_transcription.slice(1);

          // Agregar mensaje con el resultado final
          const newMessage: Message = {
            id: Date.now(),
            text: mainResult,
            timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            type: 'recognized'
          };

          setMessages(prev => [...prev, newMessage]);
          setCurrentHypotheses(hypotheses);
          setPartialText({});

          console.log('✅ Texto reconocido:', mainResult);
        }
        break;

      default:
        console.warn('⚠️ Tipo de transcripción desconocido:', transcriptionType);
        break;
    }
  }, []);

  const connect = useCallback(async (url?: string) => {
    try {
      const targetUrl = url || serverUrl;
      setState(prev => ({...prev, error: null}));
      
      // Configurar callbacks
      IonAsrService.setTranscriptionCallback(handleTranscription);
      
      IonAsrService.setConnectionCallback((connected) => {
        if (!isMountedRef.current) return;
        setState(prev => ({
          ...prev,
          isConnected: connected,
          isRecording: connected ? prev.isRecording : false,
        }));
      });

      IonAsrService.setErrorCallback((error) => {
        if (!isMountedRef.current) return;
        setState(prev => ({
          ...prev,
          error,
          isConnected: false,
          isRecording: false,
        }));
      });

      IonAsrService.setStatsCallback((chunks) => {
        if (!isMountedRef.current) return;
        setStats(prev => ({ ...prev, chunks }));
      });

      await IonAsrService.connect(targetUrl);

    } catch (error) {
      console.error('[useAudioStream] Error conectando:', error);
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Error al conectar',
          isConnected: false,
        }));
      }
    }
  }, [serverUrl, handleTranscription]);

  const disconnect = useCallback(() => {
    IonAsrService.disconnect();
    if (isMountedRef.current) {
      setState(prev => ({...prev, isConnected: false, isRecording: false}));
    }
    stopTimer();
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        setState(prev => ({...prev, error: 'Permiso de micrófono denegado'}));
        return;
      }
      if (!IonAsrService.isWSConnected()) {
        setState(prev => ({...prev, error: 'No hay conexión con el servidor ION-ASR'}));
        return;
      }

      await IonAsrService.startStreaming();
      startTimer();

      if (isMountedRef.current) {
        setState(prev => ({...prev, isRecording: true, error: null}));
      }
    } catch (error) {
      console.error('[useAudioStream] Error al iniciar grabación:', error);
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Error al iniciar grabación',
          isRecording: false,
        }));
      }
      stopTimer();
    }
  }, []);

  const stopRecording = useCallback(() => {
    IonAsrService.stopStreaming();
    if (isMountedRef.current) {
      setState(prev => ({...prev, isRecording: false}));
    }
    stopTimer();
  }, []);

  const clearAll = useCallback(() => {
    setMessages([]);
    setPartialText({});
    setCurrentHypotheses([]);
    setStats({ chunks: 0, transcriptions: 0, time: '00:00' });
    IonAsrService.disconnect();
  }, []);

  const updateServerUrl = useCallback((url: string) => {
    setServerUrl(url);
  }, []);

  const toggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  // Timer functions
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        setStats(prev => ({ ...prev, time: `${minutes}:${seconds}` }));
      }
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  // Renderizar texto parcial (para usar en la UI)
  const renderPartialText = useCallback(() => {
    const chunks = Object.entries(partialText).sort(([a], [b]) => parseInt(a) - parseInt(b));
    
    return chunks.map(([chunkId, data]) => ({
      key: chunkId,
      text: data.text,
      confirmed: data.confirmed
    }));
  }, [partialText]);

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      IonAsrService.stopStreaming();
      IonAsrService.disconnect();
      stopTimer();
    };
  }, [stopTimer]);

  return {
    ...state,
    messages,
    partialText: renderPartialText(),
    currentHypotheses,
    stats,
    serverUrl,
    showSettings,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    clearAll,
    updateServerUrl,
    toggleSettings,
  };
};