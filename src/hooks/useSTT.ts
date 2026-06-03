import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { sttDebug } from '@/utils/sttDebug';

interface STTToken {
  text: string;
  is_final: boolean;
}

interface LLMResponse {
  type: 'llm_response';
  user_text: string;
  ai_response: string;
  processing_time?: number;
}

interface STTMessage {
  type: 'transcript' | 'partial' | 'error' | 'finished' | 'ping' | 'info' | 'llm_response' | 'llm_error' | 'tts_response' | 'tts_error' | 'tts_info' | 'tts_processing' | 'processing_started' | 'processing_complete';
  transcript?: string;
  tokens?: STTToken[];
  finished?: boolean;
  error_code?: string;
  error_message?: string;
  message?: string;
  // LLM fields
  user_text?: string;
  ai_response?: string;
  processing_time?: number;
  // TTS fields
  text?: string;
  audio_url?: string;
  audio_filename?: string;
}

interface UseSTTOptions {
  onTranscript?: (transcript: string) => void;
  onPartial?: (tokens: STTToken[]) => void;
  onError?: (error: string) => void;
  onFinished?: (finalTranscript: string) => void;
  onLLMResponse?: (userText: string, aiResponse: string, processingTime?: number) => void;
  onTTSResponse?: (text: string, audioUrl: string, processingTime?: number) => void;
}

export const useSTT = (options: UseSTTOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingLLM, setIsProcessingLLM] = useState(false); // Turn-taking: track when AI is processing
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [partialText, setPartialText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Kết nối WebSocket
  const connect = useCallback(() => {
    // Nếu đã connected, không làm gì
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('🟢 Already connected, skipping...');
      return;
    }

    // Nếu đang connecting, đợi nó xong
    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('🔄 WebSocket is connecting, waiting...');
      return;
    }

    // Cleanup old WebSocket if exists (CLOSING or CLOSED state)
    if (wsRef.current) {
      console.log('🧹 Cleaning up old WebSocket...');
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.onopen = null;
      if (wsRef.current.readyState !== WebSocket.CLOSED) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    // Use WebSocket URL from environment variable
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const wsUrl = API_BASE_URL.replace(/^http/, 'ws').replace('/api', '') + '/ws/stt';
    console.log('Connecting to STT WebSocket:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('🟢 STT WebSocket connected successfully');
      console.log('WebSocket URL:', wsUrl);
      console.log('WebSocket readyState:', ws.readyState);
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const data: STTMessage = JSON.parse(event.data);
        console.log('STT WebSocket message received:', data);

        switch (data.type) {
          case 'transcript':
            console.log('📌 Final transcript received:', data.transcript);
            if (data.transcript) {
              setCurrentTranscript(data.transcript);
              options.onTranscript?.(data.transcript);
            }
            break;

          case 'partial':
            if (data.tokens) {
              const partialText = data.tokens
                .filter(token => !token.is_final)
                .map(token => token.text)
                .join('');
              console.log('💬 Partial transcript:', partialText);
              setPartialText(partialText);
              options.onPartial?.(data.tokens);
            }
            break;

          case 'finished':
            console.log('✅ STT session finished:', data.transcript);
            if (data.transcript) {
              setCurrentTranscript(data.transcript);
              options.onFinished?.(data.transcript);
            }
            stopRecording();
            break;

          case 'llm_response':
            console.log('🤖 LLM response received:', data.ai_response);
            if (data.user_text && data.ai_response) {
              options.onLLMResponse?.(data.user_text, data.ai_response, data.processing_time);
            }
            break;

          case 'llm_error':
            const llmErrorMsg = data.error_message || 'LLM processing failed';
            console.error('❌ LLM Error:', llmErrorMsg);
            toast.error(`LLM Error: ${llmErrorMsg}`);
            break;

          case 'tts_response':
            console.log('🔊 TTS response received:', data.audio_url);
            if (data.text && data.audio_url) {
              options.onTTSResponse?.(data.text, data.audio_url, data.processing_time);

              // Dispatch custom event for GlobalAvatarProvider
              const ttsEvent = new CustomEvent('tts_response', {
                detail: {
                  text: data.text,
                  audio_url: data.audio_url,
                  processing_time: data.processing_time,
                },
              });
              window.dispatchEvent(ttsEvent);
            }
            break;

          case 'tts_error':
            const ttsErrorMsg = data.error_message || 'TTS processing failed';
            console.error('❌ TTS Error:', ttsErrorMsg);
            toast.error(`TTS Error: ${ttsErrorMsg}`);
            break;

          case 'tts_info':
            const ttsInfoMsg = data.message || 'TTS info';
            console.log('ℹ️ TTS Info:', ttsInfoMsg);
            toast.info(ttsInfoMsg);
            break;

          case 'tts_processing':
            const ttsProcessingMsg = data.message || 'TTS processing';
            console.log('🔄 TTS Processing:', ttsProcessingMsg);
            toast.info(ttsProcessingMsg);
            break;

          case 'error':
            const errorMsg = data.error_message || 'Unknown STT error';
            console.error('❌ STT Error:', data.error_code, errorMsg);
            setError(errorMsg);
            options.onError?.(errorMsg);
            toast.error(`STT Error: ${errorMsg}`);
            stopRecording();
            break;

          case 'info':
            console.log('ℹ️ STT Info:', data.message);
            if (data.message) {
              toast.info(data.message);
            }
            break;

          // Turn-taking: Handle processing state signals
          case 'processing_started':
            console.log('🔒 Turn-taking: AI processing started');
            setIsProcessingLLM(true);
            break;

          case 'processing_complete':
            console.log('🔓 Turn-taking: AI processing complete, ready for new input');
            setIsProcessingLLM(false);
            break;

          case 'ping':
            // Keep-alive ping, no action needed
            break;
        }
      } catch (err) {
        console.error('Error parsing STT message:', err);
      }
    };

    ws.onclose = () => {
      console.log('STT WebSocket disconnected');
      setIsConnected(false);
      setIsRecording(false);
    };

    ws.onerror = (err) => {
      console.error('STT WebSocket error:', err);
      setError('WebSocket connection error');
      setIsConnected(false);
    };

    wsRef.current = ws;
  }, [options]);

  // Ngắt kết nối WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      // Gửi signal đóng kết nối
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'close' }));
      }
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsRecording(false);
  }, []);

  // Bắt đầu ghi âm
  const startRecording = useCallback(async () => {
    try {
      if (!isConnected) {
        console.log('🔄 Not connected, connecting first...');
        connect();
        // Đợi kết nối với timeout
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Connection timeout'));
          }, 5000);

          const checkConnection = () => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              console.log('✅ Connection established, ready to record');
              clearTimeout(timeout);
              resolve(true);
            } else {
              setTimeout(checkConnection, 100);
            }
          };
          checkConnection();
        });
      }

      // Yêu cầu quyền truy cập microphone với config giống test client
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Tạo AudioContext với config giống test client
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });

      sourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);

      // Sử dụng buffer size nhỏ hơn giống test client (1024 thay vì 4096)
      processorRef.current = audioContextRef.current.createScriptProcessor(1024, 1, 1);

      let audioChunkCount = 0;

      // Set processing flag trước khi tạo audio processor
      isProcessingRef.current = true;

      processorRef.current.onaudioprocess = (event) => {
        // Đơn giản hóa logic giống test client
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          return;
        }

        if (!isProcessingRef.current) {
          return;
        }

        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);

        // Calculate RMS for debugging
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);

        // Convert float32 to int16 CHÍNH XÁC giống như test client
        const int16Array = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          // Sử dụng CHÍNH XÁC công thức từ test_stt_client.html line 293-294
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Debug logging với RMS (ẩn cho trải nghiệm tự nhiên)
        audioChunkCount++;
        // if (audioChunkCount % 25 === 0) {
        //   console.log(`🎤 STT Audio Chunk #${audioChunkCount}: Buffer=${int16Array.length}, RMS=${rms.toFixed(4)}, WS=${wsRef.current.readyState}`);
        // }

        // Log mỗi chunk trong 10 chunks đầu để debug (ẩn cho trải nghiệm tự nhiên)
        // if (audioChunkCount <= 10) {
        //   console.log(`🔊 Audio chunk #${audioChunkCount}: RMS=${rms.toFixed(4)}, Samples=[${Array.from(int16Array.slice(0, 3)).join(',')}...]`);
        // }

        // Gửi audio data qua WebSocket - CHÍNH XÁC giống test client
        try {
          // Gửi trực tiếp buffer như test client, không cần slice
          wsRef.current.send(int16Array.buffer);

          // Log first few sends for debugging (ẩn cho trải nghiệm tự nhiên)
          // if (audioChunkCount <= 5) {
          //   console.log(`✅ Successfully sent audio chunk #${audioChunkCount}, size: ${int16Array.buffer.byteLength} bytes, first few samples:`, 
          //     Array.from(int16Array.slice(0, 5)));
          // }
        } catch (error) {
          console.error('❌ Error sending audio data:', error);
        }
      };

      // Set recording state TRƯỚC khi kết nối audio nodes
      setIsRecording(true);
      setCurrentTranscript('');
      setPartialText('');
      setError(null);

      // Kết nối audio nodes SAU khi đã set recording state
      sourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      // Debug info
      console.log('🎤 Recording started with config:');
      sttDebug.logAudioContext(audioContextRef.current);
      sttDebug.logMediaStream(mediaStreamRef.current);
      sttDebug.logWebSocket(wsRef.current);

      toast.success('Bắt đầu ghi âm');

    } catch (err) {
      console.error('Error starting recording:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMsg);
      toast.error(`Lỗi ghi âm: ${errorMsg}`);
    }
  }, [isConnected, connect, isRecording]);

  // Dừng ghi âm
  const stopRecording = useCallback(() => {
    console.log('🛑 Stopping recording...');

    // Set processing flag to false TRƯỚC khi dọn dẹp
    isProcessingRef.current = false;
    setIsRecording(false);

    // Dọn dẹp audio resources giống như test client
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    // Dừng media stream tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Gửi signal kết thúc ghi âm và đóng WebSocket hoàn toàn
    // Điều này cho phép reconnection mới hoạt động ngay khi user bật lại mic
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'close' }));
      }
      // Đóng WebSocket để cho phép tạo connection mới
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }

    toast.success('Đã dừng ghi âm');
  }, []);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      isProcessingRef.current = false;
      stopRecording();
      disconnect();
    };
  }, [stopRecording, disconnect]);

  return {
    isConnected,
    isRecording,
    isProcessingLLM, // Turn-taking: expose processing state
    currentTranscript,
    partialText,
    error,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    toggleRecording,
  };
};
