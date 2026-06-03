import fs from 'fs';
import path from 'path';
import { type Song } from '@/hooks/usePlaylist';

/**
 * Scan thư mục public/audio và trả về danh sách bài hát
 * Tự động nhận diện từ tên file
 */

const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.flac'];
const PUBLIC_AUDIO_DIR = path.join(process.cwd(), 'public');

export const scanAudioFiles = async (): Promise<Song[]> => {
  try {
    const files = fs.readdirSync(PUBLIC_AUDIO_DIR);
    
    const songs: Song[] = files
      .filter(file => AUDIO_EXTENSIONS.some(ext => file.toLowerCase().endsWith(ext)))
      .map((file, index) => {
        // Loại bỏ extension
        const nameWithoutExt = file.split('.')[0];
        
        // Format tên: thay dấu gạch ngang/dưới thành space, capitalize
        const formattedTitle = nameWithoutExt
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, char => char.toUpperCase());

        return {
          id: `song-${index}`,
          title: formattedTitle,
          url: `/${file}`,
          artist: 'Unknown',
          duration: 0,
        };
      });

    return songs;
  } catch (error) {
    console.error('Error scanning audio files:', error);
    return [];
  }
};

export default scanAudioFiles;
