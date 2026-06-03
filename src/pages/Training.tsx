import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SkeletonCanvas } from '@/components/SkeletonCanvas';
import { FeedbackPanel } from '@/components/FeedbackPanel';
import { QAPanel } from '@/components/QAPanel';
import { exercises, mockPoseData, mockTrainingSessions } from '@/data/mockData';
import { ArrowLeft, MessageSquare, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

const Training = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  
  const [isQAPanelOpen, setIsQAPanelOpen] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  
  const exercise = exercises.find(e => e.id === exerciseId);
  const session = exerciseId ? mockTrainingSessions[exerciseId] : null;

  useEffect(() => {
    if (!exercise) {
      toast.error('Động tác không tồn tại');
      navigate('/');
    }
  }, [exercise, navigate]);

  if (!exercise || !session) {
    return null;
  }

  const progress = (session.currentRep / session.targetReps) * 100;

  const handleToggleTraining = () => {
    setIsTraining(!isTraining);
    toast.success(isTraining ? 'Đã tạm dừng' : 'Bắt đầu tập luyện!');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="sm"
              className="hover:bg-primary/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {exercise.nameVi}
              </h1>
              <p className="text-sm text-muted-foreground">{exercise.name}</p>
            </div>
          </div>
          <Button
            onClick={() => setIsQAPanelOpen(!isQAPanelOpen)}
            className="bg-gradient-primary hover:shadow-glow transition-all"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Hỏi AI
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* Left: Video + Skeleton */}
        <div className="flex-1 space-y-6">
          <Card className="relative bg-black overflow-hidden aspect-video border-primary/20">
            {/* Mock Video */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl animate-pulse-glow">{exercise.icon}</div>
                <p className="text-muted-foreground">Camera Simulation</p>
              </div>
            </div>

            {/* Skeleton Overlay */}
            {isTraining && (
              <SkeletonCanvas
                poses={mockPoseData}
                errors={session.errors}
                width={800}
                height={600}
              />
            )}

            {/* Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <Button
                onClick={handleToggleTraining}
                size="lg"
                className="bg-gradient-primary hover:shadow-glow transition-all"
              >
                {isTraining ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Tạm dừng
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Bắt đầu
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Progress */}
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Tiến độ</h3>
              <span className="text-2xl font-bold text-primary">
                {session.currentRep}/{session.targetReps}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Hoàn thành {Math.round(progress)}% mục tiêu
            </p>
          </Card>
        </div>

        {/* Right: Feedback */}
        <div className="w-96 space-y-6">
          <FeedbackPanel
            feedback={session.feedback}
            audioUrl={session.feedbackAudioUrl}
            errors={session.errors}
          />
        </div>
      </main>

      {/* Q&A Panel */}
      <QAPanel isOpen={isQAPanelOpen} onClose={() => setIsQAPanelOpen(false)} />
    </div>
  );
};

export default Training;
