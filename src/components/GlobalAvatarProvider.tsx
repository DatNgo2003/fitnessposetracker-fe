/**
 * GlobalAvatarProvider Component
 * Provides PT Avatar across all pages
 */

import React, { useState, useEffect } from 'react';
import PTAvatarTalking from './PTAvatarTalking';
import AvatarToggleButton from './AvatarToggleButton';

interface GlobalAvatarProviderProps {
  children: React.ReactNode;
}

const GlobalAvatarProvider: React.FC<GlobalAvatarProviderProps> = ({ children }) => {
  const [isAvatarVisible, setIsAvatarVisible] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTalking, setIsTalking] = useState(false);

  // Listen for TTS audio events from STT WebSocket
  useEffect(() => {
    const handleTTSResponse = (event: CustomEvent) => {
      const { audio_url } = event.detail;
      if (audio_url) {
        // Construct full URL
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const fullAudioUrl = audio_url.startsWith('http') 
          ? audio_url 
          : `${API_BASE_URL}${audio_url}`;
        
        setAudioUrl(fullAudioUrl);
        setIsTalking(true);

        // Show avatar automatically when receiving TTS
        if (!isAvatarVisible) {
          setIsAvatarVisible(true);
        }

        // Stop talking animation after audio completes (estimate 5 seconds)
        setTimeout(() => {
          setIsTalking(false);
        }, 5000);
      }
    };

    // Listen for custom event from STT hook/component
    window.addEventListener('tts_response', handleTTSResponse as EventListener);

    return () => {
      window.removeEventListener('tts_response', handleTTSResponse as EventListener);
    };
  }, [isAvatarVisible]);

  // Listen for voice feedback playback events to trigger avatar animation
  useEffect(() => {
    const handleVoiceFeedback = (event: CustomEvent) => {
      const { state } = event.detail || {};
      if (state === 'start') {
        setIsAvatarVisible(true);
        setIsTalking(true);
      } else if (state === 'end') {
        setIsTalking(false);
      }
    };

    window.addEventListener('voice_feedback_avatar', handleVoiceFeedback as EventListener);

    return () => {
      window.removeEventListener('voice_feedback_avatar', handleVoiceFeedback as EventListener);
    };
  }, []);

  const handleToggleAvatar = () => {
    setIsAvatarVisible(prev => !prev);
  };

  const handleCloseAvatar = () => {
    setIsAvatarVisible(false);
  };

  return (
    <>
      {children}
      
      {/* Avatar Toggle Button */}
      <AvatarToggleButton
        isAvatarVisible={isAvatarVisible}
        onToggle={handleToggleAvatar}
      />

      {/* PT Avatar */}
      <PTAvatarTalking
        isVisible={isAvatarVisible}
        onClose={handleCloseAvatar}
        audioUrl={audioUrl}
        isTalking={isTalking}
      />
    </>
  );
};

export default GlobalAvatarProvider;
