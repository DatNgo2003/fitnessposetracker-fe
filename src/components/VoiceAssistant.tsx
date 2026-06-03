import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, X, Volume2, VolumeX } from 'lucide-react';
import { useSTT } from '@/hooks/useSTT';
import { PTCharacter } from '@/components/PTCharacter';
import { toast } from 'sonner';

interface VoiceAssistantProps {
  onClose: () => void;
}

export const VoiceAssistant = ({ onClose }: VoiceAssistantProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSentence, setCurrentSentence] = useState('');
  const [completeSentences, setCompleteSentences] = useState<string[]>([]);
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingAudio, setPendingAudio] = useState<string | null>(null);
  
  // Refs for sentence detection
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef('');
  const sentenceBufferRef = useRef('');

  const {
    isConnected,
    isRecording,
    currentTranscript,
    partialText,
    error: sttError,
    toggleRecording,
    connect,
  } = useSTT({
    onTranscript: (transcript) => {
      handleTranscriptUpdate(transcript);
    },
    onPartial: (tokens) => {
      const partial = tokens.filter(t => !t.is_final).map(t => t.text).join('');
      setCurrentSentence(partial);
    },
    onError: (error) => {
      toast.error(`STT Error: ${error}`);
    },
    onFinished: (finalTranscript) => {
      handleSentenceComplete(finalTranscript);
    },
    onLLMResponse: (userText, aiResponse, processingTime) => {
      handleLLMResponse(userText, aiResponse, processingTime);
    },
    onTTSResponse: (text, audioUrl, processingTime) => {
      handleTTSResponse(text, audioUrl, processingTime);
    },
  });

  // Auto-connect khi component mount (chỉ một lần)
  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, []); // Chỉ chạy một lần khi mount

  // Xử lý transcript update và detect câu hoàn chỉnh
  const handleTranscriptUpdate = (transcript: string) => {
    const newText = transcript.replace(lastTranscriptRef.current, '').trim();
    if (newText) {
      sentenceBufferRef.current += ' ' + newText;
      lastTranscriptRef.current = transcript;
      
      // Reset silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      
      // Detect sentence endings
      if (newText.match(/[.!?]$/) || newText.includes('<end>')) {
        handleSentenceComplete(sentenceBufferRef.current.trim());
      } else {
        // Set timer for silence detection (2 seconds)
        silenceTimerRef.current = setTimeout(() => {
          if (sentenceBufferRef.current.trim()) {
            handleSentenceComplete(sentenceBufferRef.current.trim());
          }
        }, 2000);
      }
    }
  };

  // Xử lý khi có câu hoàn chỉnh
  const handleSentenceComplete = (sentence: string) => {
    const cleanSentence = sentence.replace(/<end>/g, '').trim();
    if (cleanSentence && cleanSentence.length > 3) {
      setCompleteSentences(prev => [...prev, cleanSentence]);
      // LLM sẽ tự động được gọi từ backend khi có transcript final
      setIsProcessing(true); // Hiển thị trạng thái đang xử lý
      
      // Reset buffer
      sentenceBufferRef.current = '';
      lastTranscriptRef.current = '';
      setCurrentSentence('');
    }
  };

  // Xử lý phản hồi từ LLM
  const handleLLMResponse = (userText: string, aiResponse: string, processingTime?: number) => {
    console.log(`🤖 LLM Response received in ${processingTime?.toFixed(2)}s:`, aiResponse);
    setAiResponse(aiResponse);
    setIsProcessing(false);
    
    // Hiển thị thông báo thành công
    toast.success(`AI đã trả lời trong ${processingTime?.toFixed(1)}s`);
    // TTS sẽ được xử lý tự động từ backend
  };

  // Xử lý phản hồi từ TTS
  const handleTTSResponse = (text: string, audioUrl: string, processingTime?: number) => {
    console.log(`🔊 TTS Response received in ${processingTime?.toFixed(2)}s:`, audioUrl);
    
    // Phát audio thật từ URL
    playAudio(audioUrl);
    
    // Hiển thị thông báo
    toast.success(`Âm thanh đã tạo trong ${processingTime?.toFixed(1)}s`);
  };

  // Phát audio từ URL
  const playAudio = async (audioUrl: string) => {
    try {
      setIsSpeaking(true);
      
      // Tạo URL đầy đủ
      const fullUrl = `http://localhost:8000${audioUrl}`;
      console.log('🎵 Playing audio from:', fullUrl);
      
      const audio = new Audio(fullUrl);
      
      audio.onloadstart = () => {
        console.log('🎵 Audio loading started');
      };
      
      audio.oncanplaythrough = () => {
        console.log('🎵 Audio can play through');
        // Try to play with user gesture fallback
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('🎵 Audio playing successfully');
            })
            .catch(e => {
              console.error('❌ Audio play error:', e);
              setIsSpeaking(false);
              
              // If autoplay fails, show notification to user
              if (e.name === 'NotAllowedError') {
                setPendingAudio(fullUrl);
                toast.error('Trình duyệt chặn auto-play. Click nút phát để nghe âm thanh.');
              } else {
                toast.error('Không thể phát âm thanh');
              }
            });
        }
      };
      
      audio.onended = () => {
        console.log('🎵 Audio playback ended');
        setIsSpeaking(false);
      };
      
      audio.onerror = (e) => {
        console.error('❌ Audio error:', e);
        setIsSpeaking(false);
        toast.error('Lỗi khi phát âm thanh');
      };
      
    } catch (error) {
      console.error('❌ Error playing audio:', error);
      setIsSpeaking(false);
      toast.error('Không thể phát âm thanh');
    }
  };

  // Manual play audio when auto-play is blocked
  const playPendingAudio = () => {
    if (pendingAudio) {
      playAudio(pendingAudio);
      setPendingAudio(null);
    }
  };

  const handleMicToggle = async () => {
    try {
      if (isRecording) {
        setIsListening(false);
        // Clear any pending timers
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      } else {
        setIsListening(true);
        setCompleteSentences([]);
        setCurrentSentence('');
        setAiResponse('');
        sentenceBufferRef.current = '';
        lastTranscriptRef.current = '';
      }
      
      await toggleRecording();
    } catch (error) {
      console.error('Mic toggle error:', error);
      toast.error('Lỗi microphone');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Close Button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="sm"
        className="absolute top-6 right-6 text-white hover:bg-white/10 z-10"
      >
        <X className="w-6 h-6" />
      </Button>


      {/* Main Content */}
      <div className="relative z-10 text-center space-y-8 max-w-2xl mx-auto px-8">
        
        {/* Character Container */}
        <div className="relative">
          <PTCharacter
            isListening={isListening}
            isSpeaking={isSpeaking}
            isProcessing={isProcessing}
            isConnected={isConnected}
          />
        </div>

        {/* Status Text */}
        <div className="space-y-4">
          <motion.h1 
            className="text-4xl font-bold text-white"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🤖 AI Coach
          </motion.h1>
          
          <div className="text-white/80 space-y-2">
            {!isConnected ? (
              <motion.p 
                className="text-xl text-yellow-300"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🔄 Đang kết nối...
              </motion.p>
            ) : isProcessing ? (
              <motion.p 
                className="text-xl"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🤔 Đang suy nghĩ...
              </motion.p>
            ) : isSpeaking ? (
              <motion.p 
                className="text-xl text-green-300"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                🗣️ Đang trả lời...
              </motion.p>
            ) : isListening ? (
              <motion.p 
                className="text-xl text-purple-300"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                👂 Đang nghe...
              </motion.p>
            ) : (
              <p className="text-xl">Nhấn microphone để trò chuyện</p>
            )}
          </div>
        </div>


        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          {/* Microphone Button */}
          <motion.button
            onClick={handleMicToggle}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
              isRecording
                ? 'bg-green-500 hover:bg-green-600 shadow-2xl shadow-green-500/50'
                : isConnected
                  ? 'bg-red-500 hover:bg-red-600 shadow-2xl shadow-red-500/50'
                  : 'bg-gray-500 cursor-not-allowed opacity-50'
            }`}
            whileHover={{ scale: isConnected ? 1.1 : 1 }}
            whileTap={{ scale: isConnected ? 0.95 : 1 }}
            disabled={!isConnected}
          >
            {isRecording ? <Mic className="w-8 h-8 text-white" /> : <MicOff className="w-8 h-8 text-white" />}
          </motion.button>

          {/* Manual Audio Play Button */}
          {pendingAudio && (
            <motion.button
              onClick={playPendingAudio}
              className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <Volume2 className="w-6 h-6" />
            </motion.button>
          )}

          {/* Connection Status - Minimal for natural experience */}
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-2 transition-colors ${
              isConnected ? 'bg-green-500' : sttError ? 'bg-red-500' : 'bg-yellow-500'
            }`} />
            <p className="text-xs text-white/60">
              {isConnected ? 'Sẵn sàng' : sttError ? 'Lỗi' : 'Kết nối...'}
            </p>
          </div>
        </div>

        {/* Complete Sentences Log - Hidden for natural experience */}
        {/* {completeSentences.length > 0 && (
          <div className="text-left bg-black/20 rounded-lg p-4 max-h-32 overflow-y-auto">
            <p className="text-xs text-white/60 mb-2">Câu đã xử lý:</p>
            {completeSentences.map((sentence, index) => (
              <p key={index} className="text-sm text-white/80 mb-1">
                {index + 1}. {sentence}
              </p>
            ))}
          </div>
        )} */}

        {/* Error Display - Hidden for natural experience */}
        {/* {sttError && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 text-center">
            <p className="text-sm mb-3">{sttError}</p>
            <Button
              onClick={() => {
                console.log('🔄 Manual retry connection...');
                connect();
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
              size="sm"
            >
              🔄 Thử lại kết nối
            </Button>
          </div>
        )} */}
      </div>
    </div>
  );
};
