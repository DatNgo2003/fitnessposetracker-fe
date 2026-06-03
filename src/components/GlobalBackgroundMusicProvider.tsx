import React, { createContext, useContext, ReactNode } from 'react';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';

interface BackgroundMusicContextType {
  isPlaying: boolean;
  isMuted: boolean;
  currentVolume: number;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

const BackgroundMusicContext = createContext<BackgroundMusicContextType | undefined>(
  undefined
);

interface GlobalBackgroundMusicProviderProps {
  children: ReactNode;
  musicSrc?: string;
  initialVolume?: number;
  autoPlay?: boolean;
}

export const GlobalBackgroundMusicProvider = ({
  children,
  musicSrc = '/background-music.mp3',
  initialVolume = 0.25,
  autoPlay = false,
}: GlobalBackgroundMusicProviderProps) => {
  const music = useBackgroundMusic({
    src: musicSrc,
    volume: initialVolume,
    loop: true,
    autoPlay,
  });

  return (
    <BackgroundMusicContext.Provider value={music}>
      {children}
    </BackgroundMusicContext.Provider>
  );
};

export const useGlobalBackgroundMusic = () => {
  const context = useContext(BackgroundMusicContext);
  if (!context) {
    throw new Error(
      'useGlobalBackgroundMusic must be used within GlobalBackgroundMusicProvider'
    );
  }
  return context;
};
