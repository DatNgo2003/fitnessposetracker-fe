import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackPanelProps {
  feedback: string;
  audioUrl: string;
  errors: string[];
}

export const FeedbackPanel = ({ feedback, audioUrl, errors }: FeedbackPanelProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayFeedback = () => {
    setIsPlaying(true);
    toast.success('Đang phát feedback (mock)');
    
    // Simulate audio playback
    setTimeout(() => {
      setIsPlaying(false);
      toast.info('Đã phát xong feedback');
    }, 3000);
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Phản hồi động tác</h3>
        <Button
          onClick={handlePlayFeedback}
          disabled={isPlaying}
          size="sm"
          className="bg-gradient-primary hover:shadow-glow transition-all"
        >
          {isPlaying ? (
            <>
              <VolumeX className="w-4 h-4 mr-2" />
              Đang phát...
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 mr-2" />
              Nghe feedback
            </>
          )}
        </Button>
      </div>

      {errors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-error">Lỗi phát hiện:</h4>
          <ul className="space-y-1">
            {errors.map((error, idx) => (
              <li
                key={idx}
                className="text-sm text-error-foreground bg-error/20 px-3 py-2 rounded-md flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 bg-error rounded-full animate-pulse" />
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Hướng dẫn:</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {feedback}
        </p>
      </div>
    </Card>
  );
};
