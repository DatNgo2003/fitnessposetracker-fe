import { useEffect, useRef, useState } from 'react';

interface UseBackgroundMusicProps {
  src: string;
  volume?: number;
  loop?: boolean;
  autoPlay?: boolean;
}

export const useBackgroundMusic = ({
  src,
  volume = 0.3,
  loop = true,
  autoPlay = true,
}: UseBackgroundMusicProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(volume);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const wasPlayingRef = useRef(false); // Lưu trạng thái playing trước khi đổi src
  const prevSrcRef = useRef<string>(''); // Lưu src trước đó

  // Setup audio element một lần
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audioRef.current = audio;

      // Xử lý khi audio kết thúc
      audio.addEventListener('ended', () => {
        if (!loop) {
          setIsPlaying(false);
        }
      });

      // Xử lý khi audio đang phát
      audio.addEventListener('play', () => {
        setIsPlaying(true);
      });

      // Xử lý khi audio bị dừng
      audio.addEventListener('pause', () => {
        setIsPlaying(false);
      });

      // Xử lý duration
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });

      // Xử lý currentTime (update thanh progress)
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });
    }
  }, []);

  // Xử lý khi src thay đổi
  useEffect(() => {
    if (!audioRef.current || !src) return;

    // Lưu trạng thái playing trước khi đổi src
    const wasPlaying = prevSrcRef.current !== '' && prevSrcRef.current !== src ? isPlaying : false;
    wasPlayingRef.current = wasPlaying;
    prevSrcRef.current = src;
    
    // Cập nhật src khi thay đổi
    audioRef.current.src = src;
    audioRef.current.loop = loop;
    audioRef.current.volume = isMuted ? 0 : volume;
    audioRef.current.currentTime = 0;

    // Khi audio load xong, tự động play nếu đang playing hoặc autoPlay = true
    const handleCanPlay = () => {
      if (wasPlayingRef.current || autoPlay) {
        audioRef.current?.play().catch(err => {
          console.log('⚠️ Autoplay bị chặn:', err);
          console.log('💡 Người dùng cần nhấn để bắt đầu âm thanh');
        });
      }
    };

    audioRef.current.addEventListener('canplay', handleCanPlay, { once: true });

    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.removeEventListener('canplay', handleCanPlay);
      }
    };
  }, [src, loop, autoPlay, volume, isMuted]);

  const play = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
      });
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
        });
      }
    }
  };

  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setCurrentVolume(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : clampedVolume;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = currentVolume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, duration));
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  return {
    isPlaying,
    isMuted,
    currentVolume,
    duration,
    currentTime,
    play,
    pause,
    togglePlayPause,
    setVolume,
    toggleMute,
    seek,
  };
};
