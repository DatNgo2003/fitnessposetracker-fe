import { exercises } from '@/data/mockData';
import { ExerciseCard } from '@/components/ExerciseCard';
import { Navigation } from '@/components/ui/navigation';
import { useNavigate } from 'react-router-dom';
import { Activity, Brain, Camera, Zap } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleExerciseClick = (exerciseId: string) => {
    // Squat, Pushup, Barbell, and Lunge now use dedicated analysis pages
    if (exerciseId === 'squat') {
      navigate('/squat-analysis');
    } else if (exerciseId === 'pushup') {
      navigate('/pushup-analysis');
    } else if (exerciseId === 'barbell_dead_row') {
      navigate('/barbell-analysis');
    } else if (exerciseId === 'dumbbell_reverse_lunge') {
      navigate('/lunge-analysis');
    } else {
      navigate(`/training/${exerciseId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Hero Section */}
      <header className="relative py-24 px-4 overflow-hidden" style={{
        backgroundImage: 'url("https://png.pngtree.com/background/20230516/original/pngtree-large-room-full-of-equipment-in-a-gym-picture-image_2611111.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Animated background elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full animate-pulse" />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full animate-pulse delay-1000" />
        
        <div className="relative container mx-auto text-center space-y-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
              <Activity className="w-12 h-12 text-primary-foreground animate-pulse-glow" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground animate-fade-in drop-shadow-lg">
              Tập Luyện Miễn Phí Cùng Gympose
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-primary-foreground/95 max-w-3xl mx-auto animate-slide-up font-medium drop-shadow-md">
            Hệ thống huấn luyện thể thao thông minh với AI - Phân tích tư thế chính xác, đưa ra phản hồi cho người dùng
          </p>
          
          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 pt-6 animate-slide-up">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-3 rounded-full text-white">
              <Camera className="w-5 h-5" />
              <span className="font-medium">Phân tích tư thế</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-3 rounded-full text-white">
              <Zap className="w-5 h-5" />
              <span className="font-medium">Đưa ra feedback </span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-3 rounded-full text-white">
              <Brain className="w-5 h-5" />
              <span className="font-medium">Hỗ trợ AI thông minh</span>
            </div>
          </div>
        </div>
      </header>

      {/* Exercises Grid */}
      <main className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Chọn động tác tập luyện
          </h2>
          <p className="text-muted-foreground">
            Click vào động tác để bắt đầu huấn luyện với AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onClick={() => handleExerciseClick(exercise.id)}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4 mt-16">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p> GymPose - Powered by G18</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
