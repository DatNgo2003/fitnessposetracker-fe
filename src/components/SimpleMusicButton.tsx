import { Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';

interface SimpleMusicButtonProps {
  src: string;
  volume?: number;
  loop?: boolean;
  autoPlay?: boolean;
  className?: string;
}

export const SimpleMusicButton = ({
  src,
  volume = 0.25,
  loop = true,
  autoPlay = false,
  className = '',
}: SimpleMusicButtonProps) => {
  const { isPlaying, togglePlayPause } = useBackgroundMusic({
    src,
    volume,
    loop,
    autoPlay,
  });

  return (
    <motion.button
      onClick={togglePlayPause}
      className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
        isPlaying
          ? 'bg-green-500 hover:bg-green-600 shadow-2xl shadow-green-500/50'
          : 'bg-blue-500 hover:bg-blue-600 shadow-2xl shadow-blue-500/50'
      } ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title="Background Music"
    >
      <Music className="w-8 h-8 text-white" />
    </motion.button>
  );
};

export default SimpleMusicButton;
