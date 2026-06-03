import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, X, ChevronDown, Trash2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { usePlaylist, type Song } from '@/hooks/usePlaylist';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { AddSongDialog } from '@/components/AddSongDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BackgroundMusicPlayerProps {
  src?: string;
  volume?: number;
  loop?: boolean;
  autoPlay?: boolean;
  className?: string;
  isFloating?: boolean;
  songs?: Song[];
}

export const BackgroundMusicPlayer = ({
  src = '',
  volume = 0.3,
  loop = true,
  autoPlay = false,
  className = '',
  isFloating = false,
  songs = [],
}: BackgroundMusicPlayerProps) => {
  const playlist = usePlaylist({ initialSongs: songs });
  const currentSongUrl = playlist.currentSong?.url || src;

  const {
    isPlaying,
    isMuted,
    currentVolume,
    duration,
    currentTime,
    togglePlayPause,
    setVolume,
    toggleMute,
    seek,
    play,
  } = useBackgroundMusic({
    src: currentSongUrl,
    volume,
    loop,
    autoPlay,
  });

  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  // For floating version on all pages
  if (isFloating) {
    return (
      <div className={`fixed bottom-32 right-6 z-40 ${className}`}>
        <div className="relative">
          {/* Collapsed view - Circular button with visualizer */}
          {isCollapsed && (
            <motion.button
              onClick={() => setIsCollapsed(false)}
              className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                isPlaying
                  ? 'bg-green-500/70 hover:bg-green-500/80 shadow-2xl shadow-green-500/50'
                  : 'bg-blue-500/70 hover:bg-blue-500/80 shadow-2xl shadow-blue-500/50'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Background Music"
            >
              {/* Visualizer rings - bập bùng khi đang phát */}
              {isPlaying && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-[3px] border-white/60"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.8, 0, 0.8]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-[3px] border-white/70"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.7, 0, 0.7]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.3
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-[3px] border-white/50"
                    animate={{ 
                      scale: [1, 1.7, 1],
                      opacity: [0.6, 0, 0.6]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.6
                    }}
                  />
                </>
              )}
              
              <Music className="w-8 h-8 text-white relative z-10" />
              
              {isPlaying && (
                <motion.span
                  className="absolute top-2 right-2 w-3 h-3 bg-yellow-300 rounded-full z-10"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </motion.button>
          )}

          {/* Expanded view */}
          {!isCollapsed && (
            <motion.div
              className="bg-white/15 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-white/20 p-4 space-y-4 w-64"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-blue-300" />
                  <span className="text-white font-medium">Nhạc nền</span>
                </div>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60">
                    {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
                  </span>
                  <Slider
                    value={[currentTime]}
                    onValueChange={(value) => seek(value[0])}
                    max={duration || 100}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-xs text-white/60">
                    {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Play/Pause */}
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Trạng thái</span>
                <motion.button
                  onClick={togglePlayPause}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    isPlaying
                      ? 'bg-green-500/30 text-green-300 border border-green-400'
                      : 'bg-blue-500/30 text-blue-300 border border-blue-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isPlaying ? '⏸️ Dừng' : '▶️ Phát'}
                </motion.button>
              </div>

              {/* Volume Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-white/80 text-sm">Âm lượng</label>
                  <motion.button
                    onClick={toggleMute}
                    className="text-blue-300 hover:text-blue-200 p-1 h-auto"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
                <Slider
                  value={[isMuted ? 0 : currentVolume]}
                  onValueChange={(value) => {
                    setVolume(value[0]);
                  }}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
                <motion.div
                  className="text-xs text-center text-blue-300 font-medium"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {Math.round((isMuted ? 0 : currentVolume) * 100)}%
                </motion.div>
              </div>

              {/* Playlist Toggle */}
              {playlist.songs.length > 0 && (
                <motion.button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-400/50 hover:bg-blue-500/30 text-blue-300 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Danh sách ({playlist.songs.length})
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showPlaylist ? 'rotate-180' : ''}`}
                  />
                </motion.button>
              )}

              {/* Add Song Dialog */}
              <AddSongDialog onAddSong={(song) => playlist.addSong(song)} />

              {/* Playlist Items */}
              <AnimatePresence>
                {showPlaylist && playlist.songs.length > 0 && (
                  <motion.div
                    className="bg-black/30 rounded-lg p-2 space-y-1 max-h-40 overflow-y-auto"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {playlist.songs.map((song, index) => (
                      <motion.button
                        key={song.id}
                        onClick={() => {
                          playlist.selectSong(index);
                          // Seek về đầu
                          seek(0);
                          setTimeout(() => {
                            play();
                          }, 150);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                          index === playlist.currentSongIndex
                            ? 'bg-green-500/30 border border-green-400/50 text-green-300'
                            : 'hover:bg-white/10 text-white/70 hover:text-white'
                        }`}
                        whileHover={{ x: 4 }}
                        whileTap={{ x: 2 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{song.title}</p>
                            {song.artist && (
                              <p className="text-xs opacity-75 truncate">{song.artist}</p>
                            )}
                          </div>
                          {index === playlist.currentSongIndex && isPlaying && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                              className="ml-2"
                            >
                              <Play className="w-3 h-3 fill-current" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info with animation */}
              <div className="text-xs text-white/50 pt-2 border-t border-white/10">
                {isPlaying ? (
                  <motion.span
                    className="text-green-300 font-medium"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    🎵 Đang phát nhạc nền
                  </motion.span>
                ) : (
                  <span className="text-blue-300">⏸️ Nhạc nền đã dừng</span>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Original dropdown version for specific pages
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative text-white/70 hover:text-white hover:bg-white/10"
            title="Background Music"
          >
            <Music className="w-5 h-5" />
            {isPlaying && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="p-4 space-y-4">
            {/* Play/Pause */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Nhạc nền</span>
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlayPause}
                className={isPlaying ? 'bg-green-500/20 border-green-500' : ''}
              >
                {isPlaying ? '⏸️ Dừng' : '▶️ Phát'}
              </Button>
            </div>

            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">Âm lượng</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white/70 hover:text-white p-1"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
              <Slider
                value={[isMuted ? 0 : currentVolume]}
                onValueChange={(value) => {
                  setVolume(value[0]);
                }}
                max={1}
                step={0.01}
                className="w-full"
              />
              <div className="text-xs text-center text-muted-foreground">
                {Math.round((isMuted ? 0 : currentVolume) * 100)}%
              </div>
            </div>

            {/* Info */}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              {isPlaying ? (
                <span className="text-green-600">🎵 Đang phát nhạc nền</span>
              ) : (
                <span>Nhạc nền đã dừng</span>
              )}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};