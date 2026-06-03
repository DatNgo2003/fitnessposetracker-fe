/**
 * PTAvatarTalking Component
 * 2D Avatar with talking animation, drag & drop, and lip-sync
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Mic, MicOff } from 'lucide-react';
import { useSTT } from '@/hooks/useSTT';

interface PTAvatarTalkingProps {
  isVisible: boolean;
  onClose: () => void;
  audioUrl?: string | null;
  isTalking?: boolean;
}

const PTAvatarTalking: React.FC<PTAvatarTalkingProps> = ({
  isVisible,
  onClose,
  audioUrl,
  isTalking = false,
}) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 390, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const avatarRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number | null>(null);

  // STT integration (with turn-taking support)
  const { isRecording, isProcessingLLM, toggleRecording, connect, disconnect } = useSTT();

  // Total frames available
  const TOTAL_FRAMES = 9;
  const BASE_FRAME_RATE = 100; // ms per frame when talking

  // Load all frames
  const frames = Array.from({ length: TOTAL_FRAMES }, (_, i) => `/avartar/${i + 1}.png`);

  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.avatar-image')) {
      setIsDragging(true);
      const rect = avatarRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    }
  }, []);

  // Handle drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - 310, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 310, e.clientY - dragOffset.y));
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Handle audio playback and lip-sync animation
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      const audio = audioRef.current;

      // Load and play audio
      audio.src = audioUrl;
      audio.play().catch(err => console.error('Audio play error:', err));

      // Start animation when audio plays
      const handlePlay = () => {
        setIsAnimating(true);
      };

      // Stop animation when audio ends
      const handleEnded = () => {
        setIsAnimating(false);
        setCurrentFrame(0);
      };

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('ended', handleEnded);
        audio.pause();
      };
    }
  }, [audioUrl]);

  // Animation loop for talking
  useEffect(() => {
    if (isAnimating || isTalking) {
      let lastTime = Date.now();

      const animate = () => {
        const now = Date.now();
        const elapsed = now - lastTime;

        if (elapsed >= BASE_FRAME_RATE) {
          setCurrentFrame(prev => (prev + 1) % TOTAL_FRAMES);
          lastTime = now;
        }

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      // When not talking, show first frame
      setCurrentFrame(0);
    }
  }, [isAnimating, isTalking]);

  // Disconnect STT when avatar becomes hidden
  // NOTE: We don't connect() automatically anymore to avoid Soniox timeout
  // Connection happens only when user clicks the mic button (startRecording)
  useEffect(() => {
    if (!isVisible) {
      disconnect();
    }
  }, [isVisible, disconnect]);

  // Handle mic button click
  const handleMicClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleRecording();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Avatar Container */}
      <div
        ref={avatarRef}
        className="fixed z-50 select-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Avatar Card - No Background */}
        <div className="relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X size={16} />
          </button>

          {/* Avatar Image with Animation */}
          <div className="avatar-image relative">
            <img
              src={frames[currentFrame]}
              alt={`Avatar frame ${currentFrame + 1}`}
              className="w-80 h-80 object-contain pointer-events-none"
              draggable={false}
            />

            {/* Talking Indicator */}
            {(isAnimating || isTalking) && (
              <div className="absolute bottom-2 right-2 flex space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-150"></div>
              </div>
            )}
          </div>

          {/* Status Text & Mic Button */}
          <div className="space-y-2 mt-2">
            <p className="text-sm font-medium text-white text-center bg-black/70 rounded-lg px-2 py-1">
              {isProcessingLLM ? '⏳ Đang xử lý...' : isRecording ? '🎤 Đang nghe...' : isAnimating || isTalking ? '🔊 Đang nói...' : '😊 Sẵn sàng'}
            </p>

            {/* Mic Button - disabled during processing */}
            <button
              onClick={handleMicClick}
              onMouseDown={(e) => e.stopPropagation()}
              disabled={isProcessingLLM}
              className={`w-full py-1.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg ${isProcessingLLM
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-purple-500 hover:bg-purple-600 text-white hover:scale-105'
                }`}
            >
              {isProcessingLLM ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Đang xử lý...</span>
                </>
              ) : isRecording ? (
                <>
                  <MicOff size={14} />
                  <span>Dừng</span>
                </>
              ) : (
                <>
                  <Mic size={14} />
                  <span>Nói</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} className="hidden" />
    </>
  );
};

export default PTAvatarTalking;
