import { useState, useEffect } from 'react';
import { type Song } from '@/hooks/usePlaylist';

/**
 * Hook để lấy danh sách audio files từ public folder
 * Tự động scan và format tên bài hát
 */
export const useAudioLibrary = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudioFiles = async () => {
      try {
        setLoading(true);
        
        // Lấy danh sách files từ public folder
        const response = await fetch('/api/audio-files');
        
        if (!response.ok) {
          throw new Error('Không thể lấy danh sách bài hát');
        }

        const data = await response.json();
        const files: string[] = data.files || [];

        // Chuyển đổi files thành Song objects
        const audioSongs: Song[] = files.map((file, index) => {
          // Loại bỏ extension
          const nameWithoutExt = file.split('.')[0];
          
          // Format tên: thay dấu gạch ngang/dưới thành space, capitalize
          const formattedTitle = nameWithoutExt
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());

          return {
            id: `song-${index}-${file}`,
            title: formattedTitle,
            url: `/${file}`,
            artist: 'Audio Library',
            duration: 0,
          };
        });

        setSongs(audioSongs);
        setError(null);
        console.log(`✅ Loaded ${audioSongs.length} audio files`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Lỗi không xác định';
        setError(message);
        console.error('Error fetching audio files:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioFiles();
  }, []);

  return { songs, loading, error };
};

export default useAudioLibrary;
