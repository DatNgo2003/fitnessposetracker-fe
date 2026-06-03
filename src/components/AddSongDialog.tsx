import { useState } from 'react';
import { Plus, Loader, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAudioMetadata } from '@/hooks/useAudioMetadata';
import { type Song } from '@/hooks/usePlaylist';

interface AddSongDialogProps {
  onAddSong: (song: Song) => void;
}

export const AddSongDialog = ({ onAddSong }: AddSongDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [artist, setArtist] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { extractMetadata, loading } = useAudioMetadata();

  const handleDetectMetadata = async () => {
    if (!url.trim()) {
      setError('Vui lòng nhập đường dẫn URL');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const metadata = await extractMetadata(url);
      
      const newSong: Song = {
        id: `song-${Date.now()}`,
        title: metadata.title || 'Unknown Song',
        artist: artist || 'Unknown Artist',
        url: url,
        duration: metadata.duration || 0,
      };

      onAddSong(newSong);
      
      // Reset form
      setUrl('');
      setArtist('');
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi thêm bài hát');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/20 border border-green-400/50 hover:bg-green-500/30 text-green-300 text-sm transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-4 h-4" />
        Thêm bài hát
      </motion.button>

      {isOpen && (
        <motion.div
          className="mt-3 space-y-3 p-3 bg-black/40 rounded-lg border border-white/20"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          {/* URL Input */}
          <div>
            <label className="text-xs text-white/70 block mb-1">Đường dẫn URL:</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/music/song.mp3"
              className="w-full px-2 py-1 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Artist Input */}
          <div>
            <label className="text-xs text-white/70 block mb-1">Artist (tùy chọn):</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Tên artist hoặc bỏ trống"
              className="w-full px-2 py-1 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="flex items-center gap-2 p-2 rounded-lg bg-red-500/20 border border-red-400/50 text-red-300 text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleDetectMetadata}
              disabled={isLoading || loading || !url.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm py-1"
            >
              {isLoading || loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Thêm
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                setIsOpen(false);
                setError(null);
              }}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm py-1"
            >
              Hủy
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-white/50 space-y-1">
            <p>💡 Tên bài hát sẽ tự động được nhận diện từ file</p>
            <p>🎵 Hỗ trợ: MP3, WAV, OGG, M4A</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AddSongDialog;
