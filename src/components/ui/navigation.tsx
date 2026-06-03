import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, Home, BarChart3 } from 'lucide-react';

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-card/80 backdrop-blur-md border border-border rounded-full px-6 py-3 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 mr-4">
          <Activity className="w-6 h-6 text-primary" />
          <span className="font-bold text-foreground">GymPose</span>
        </div>
        
        <Button
          variant={isActive('/') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => navigate('/')}
          className="rounded-full"
        >
          <Home className="w-4 h-4 mr-2" />
          Trang Chủ
        </Button>
        
        <Button
          variant={isActive('/dashboard') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="rounded-full"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Tập Luyện
        </Button>
      </div>
    </nav>
  );
};
