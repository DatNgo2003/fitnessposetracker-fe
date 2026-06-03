import { BackgroundMusicPlayer } from '@/components/BackgroundMusicPlayer';
import { type Song } from '@/hooks/usePlaylist';

// Danh sách bài hát mặc định
const DEFAULT_SONGS: Song[] = [
  {
    id: '1',
    title: 'Chẳng Thể Cảm Hóa (Remix)',
    artist: 'Gym Coach',
    url: '/Chẳng Thể Cảm Hóa (Remix).mp3',
  },
  {
    id: '2',
    title: 'Nắng Ấm Trong Tim (Remix)',
    artist: 'Fitness Mix',
    url: '/Nắng Ấm Trong Tim (Remix).mp3',
  },
  {
    id: '3',
    title: 'Địa Ngục Trần Gian (Remix).mp3',
    artist: 'Tên Nghệ Sĩ',
    url: 'Địa Ngục Trần Gian (Remix).mp3',  // File phải có trong public/
  },
  {
    id: '4',
    title: 'Mashup Anh Đã Không Biết Cách Yêu Em x Trò Đùa (Remix)',
    artist: 'Tên Nghệ Sĩ',
    url: 'Mashup Anh Đã Không Biết Cách Yêu Em x Trò Đùa (Remix).mp3',  // File phải có trong public/
  },
  {
    id: '5',
    title: 'Top 20 Nhạc TikTok Hay 2025',
    artist: 'Tên Nghệ Sĩ',
    url: 'Top 20 Nhạc TikTok Hay 2025.mp3',  // File phải có trong public/
  },
  {
    id: '6',
    title: 'Ngàn Năm Ánh Sáng (Remix)',
    artist: 'Tên Nghệ Sĩ',
    url: 'Ngàn Năm Ánh Sáng (Remix).mp3',  // File phải có trong public/
  },
];

export const GlobalMusicPlayer = () => {
  return (
    <BackgroundMusicPlayer
      volume={0.25}
      loop={true}
      autoPlay={false}
      isFloating={true}
      songs={DEFAULT_SONGS}
    />
  );
};

export default GlobalMusicPlayer;
