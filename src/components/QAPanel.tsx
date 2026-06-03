import { useState } from 'react';
import { VoiceAssistant } from './VoiceAssistant';
import { Button } from '@/components/ui/button';
import { X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QAPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QAPanel = ({ isOpen, onClose }: QAPanelProps) => {
  const [useVoiceMode, setUseVoiceMode] = useState(true);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {useVoiceMode ? (
            // Voice Assistant Mode (Fullscreen)
            <motion.div
              className="fixed inset-0 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <VoiceAssistant onClose={onClose} />
              
              {/* Mode toggle button */}
              <motion.button
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
                onClick={() => setUseVoiceMode(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Chế độ Chat</span>
              </motion.button>
            </motion.div>
          ) : (
            // Traditional Chat Mode (Sidebar)
            <motion.div
              className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-2xl z-50 flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-primary/10">
                <h3 className="text-lg font-bold text-foreground">Hỏi đáp AI</h3>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setUseVoiceMode(true)}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-primary/20"
                    title="Chuyển sang chế độ Voice"
                  >
                    🎤
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-primary/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Chat content placeholder */}
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div className="text-6xl">🎤</div>
                  <h3 className="text-xl font-bold text-foreground">Voice Assistant</h3>
                  <p className="text-muted-foreground">
                    Trải nghiệm tương tác bằng giọng nói hiện đại
                  </p>
                  <Button
                    onClick={() => setUseVoiceMode(true)}
                    className="bg-gradient-primary hover:shadow-glow transition-all"
                  >
                    Bắt đầu Voice Chat
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};
