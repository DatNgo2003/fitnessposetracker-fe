import { useState, useCallback } from 'react';
import { type Song } from '@/hooks/usePlaylist';

/**
 * Hook để lấy metadata từ audio file
 * Tự động nhận diện tên bài hát, artist, duration
 */
export const useAudioMetadata = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractMetadata = useCallback(async (url: string): Promise<Partial<Song>> => {
    try {
      setLoading(true);
      setError(null);

      // Tạo audio element để lấy duration
      const audio = new Audio();
      
      return new Promise((resolve, reject) => {
        audio.onloadedmetadata = () => {
          // Lấy tên file từ URL
          const urlParts = url.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const nameWithoutExt = fileName.split('.')[0];
          
          // Format tên: thay dấu gạch ngang, gạch dưới bằng space và capitalize
          const formattedTitle = nameWithoutExt
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());

          resolve({
            title: formattedTitle,
            duration: audio.duration,
          });
          
          setLoading(false);
        };

        audio.onerror = () => {
          setError('Không thể tải file audio');
          reject(new Error('Failed to load audio'));
          setLoading(false);
        };

        audio.src = url;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(message);
      setLoading(false);
      throw err;
    }
  }, []);

  return { extractMetadata, loading, error };
};

export default useAudioMetadata;
