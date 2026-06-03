/**
 * Video Processing Progress Component
 * Shows animated progress bar with percentage and status message
 */
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface VideoProcessingProgressProps {
  sessionId: string;
  onComplete?: () => void;
}

export default function VideoProcessingProgress({
  sessionId,
  onComplete
}: VideoProcessingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Đang khởi tạo...');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const wsUrl = API_BASE_URL.replace('http', 'ws') + `/ws/progress/${sessionId}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Progress WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setProgress(data.progress || 0);
        setMessage(data.message || 'Đang xử lý...');

        // Call onComplete when progress reaches 100%
        if (data.progress >= 100 && onComplete) {
          setTimeout(() => {
            onComplete();
          }, 500); // Small delay for smooth animation
        }
      } catch (error) {
        console.error('Error parsing progress data:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setMessage('Lỗi kết nối');
    };

    ws.onclose = () => {
      console.log('Progress WebSocket closed');
      setIsConnected(false);
    };

    // Cleanup on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [sessionId, onComplete]);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-2 border-blue-100">
      <CardContent className="pt-6">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-blue-600">
              Đang Xử Lý Video AI
            </h3>
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>

          {/* Progress Bar with Gradient */}
          <div className="space-y-3">
            <div className="relative">
              <Progress
                value={progress}
                className="h-4 bg-gray-200"
              />
              {/* Animated shimmer effect */}
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"
                style={{
                  width: `${progress}%`,
                  transition: 'width 0.3s ease-out'
                }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 font-medium">{message}</span>
              <span className="font-bold text-2xl text-blue-600 tabular-nums">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Animation Track */}
          <div className="relative h-28 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl overflow-visible border-2 border-blue-100 shadow-inner">
            {/* Track Lines */}
            <div className="absolute inset-0 flex items-center px-4">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
            </div>

            {/* Starting Line - LEFT SIDE (Cờ kẻ ô = xuất phát) */}
            <div className="absolute left-2 bottom-6 text-3xl opacity-60 select-none">
              🏁
            </div>

            {/* Running Person Animation - Moves from LEFT to RIGHT */}
            <div
              className="absolute bottom-6 transition-all duration-500 ease-out z-10"
              style={{
                left: `${Math.min(progress, 95)}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="relative">
                {/* Person emoji with bounce - FLIP to face right (towards finish) */}
                <div
                  className="text-5xl select-none"
                  style={{
                    animation: progress > 0 && progress < 100 ? 'bounce 0.6s infinite' : 'none',
                    display: 'inline-block',
                    transform: 'scaleX(-1)' // Flip horizontally to face RIGHT (→) towards 🚩
                  }}
                >
                  🏃‍♂️‍➡️
                </div>
                {/* Shadow */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-2 bg-black/20 rounded-full blur-sm" />
              </div>
            </div>

            {/* Finish Line - RIGHT SIDE (Cờ đỏ = đích đến) */}
            <div className="absolute right-2 bottom-6 text-4xl select-none">
              {progress >= 100 ? (
                <div className="animate-bounce">
                  🎉
                </div>
              ) : (
                <div className={progress >= 90 ? 'animate-pulse' : ''}>
                  🚩
                </div>
              )}
            </div>

            {/* Progress Milestones */}
            {[25, 50, 75].map((milestone) => (
              <div
                key={milestone}
                className={`absolute top-2 text-xs font-semibold transition-colors duration-300 select-none ${progress >= milestone ? 'text-green-600' : 'text-gray-400'
                  }`}
                style={{ left: `${milestone}%`, transform: 'translateX(-50%)' }}
              >
                {progress >= milestone ? '✓' : milestone + '%'}
              </div>
            ))}
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-2 text-sm">
            {isConnected ? (
              <>
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-700 font-medium">Đang xử lý trên server...</span>
              </>
            ) : (
              <>
                <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-amber-700 font-medium">Đang kết nối...</span>
              </>
            )}
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-lg p-4">
            <p className="text-sm text-amber-900">
              <span className="text-xl mr-2">💡</span>
              <strong>Lưu ý:</strong> Quá trình phân tích AI có thể mất 30-60 giây hoặc hơn, tùy thời gian bạn tập.
              Đừng đóng trang để nhận kết quả đầy đủ!
            </p>
          </div>
        </div>
      </CardContent>

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </Card>
  );
}
