import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/ui/navigation';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Brain, 
  Camera, 
  Users, 
  Zap, 
  Target, 
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const exercises = [
    { 
      name: "Squat", 
      image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      description: "Bài tập chân cơ bản"
    },
    { 
      name: "Push-up", 
      image: "https://www.fitnessjunkies.com/sites/default/files/images/push-ups.jpg",
      description: "Tập ngực và vai"
    },
    { 
      name: "Barbell Dead Row", 
      image: "https://cdn.unityfitness.vn/2024/04/barbell-row-2-1024x576.jpg",
      description: "Tập lưng với thanh tạ"
    },
    { 
      name: "Dumbbell Reverse Lunge", 
      image: "https://cdn.muscleandstrength.com/sites/default/files/dumbbell-rear-lunge.jpg",
      description: "Tập chân và mông"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Hero Section */}
      <section className="relative overflow-hidden py-32 px-4 min-h-screen flex items-center" style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative container mx-auto text-center space-y-12 w-full">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Activity className="w-16 h-16 text-primary-foreground animate-pulse-glow" />
            <h1 className="text-6xl font-bold text-primary-foreground animate-fade-in">
              GymPose
            </h1>
          </div>
          
          <div className="space-y-6 animate-slide-up">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground max-w-5xl mx-auto leading-tight">
              Hệ Thống Huấn Luyện Thể Thao Thông Minh
            </h2>
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
              Sử dụng AI để phân tích tư thế tập luyện, đưa ra phản hồi và giúp bạn tập luyện hiệu quả hơn
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-scale-in mt-8">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 px-10 py-5 text-xl font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate('/dashboard')}
            >
              <Play className="w-6 h-6 mr-3" />
              Bắt Đầu Tập Luyện
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white/10 px-10 py-5 text-xl rounded-full backdrop-blur-sm"
            >
              Xem Demo
            </Button>
          </div>
        </div>
      </section>


      {/* Exercises Preview */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-foreground">
              Các Bài Tập Được Hỗ Trợ
            </h2>
            <p className="text-xl text-muted-foreground">
              Hệ thống hỗ trợ phân tích nhiều loại bài tập khác nhau
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 max-w-7xl mx-auto">
            {exercises.map((exercise, index) => (
              <Card key={index} className="group cursor-pointer hover:shadow-glow transition-all duration-300 hover:scale-105 border-primary/20 hover:border-primary/60 overflow-hidden">
                <div className="relative h-72 overflow-hidden">
                  <img 
                    src={exercise.image} 
                    alt={exercise.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                </div>
                <CardContent className="p-6 text-center space-y-2">
                  <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {exercise.name}
                  </h3>
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                    {exercise.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 text-lg"
            >
              Khám Phá Tất Cả Bài Tập
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-foreground">
              Cách Thức Hoạt Động
            </h2>
            <p className="text-xl text-muted-foreground">
              Chỉ 3 bước đơn giản để bắt đầu tập luyện thông minh
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Chọn Bài Tập",
                description: "Lựa chọn bài tập phù hợp với mục tiêu của bạn",
                icon: <Target className="w-8 h-8 text-primary" />
              },
              {
                step: "02", 
                title: "Bắt Đầu Tập",
                description: "Camera sẽ theo dõi và phân tích tư thế của bạn",
                icon: <Camera className="w-8 h-8 text-primary" />
              },
              {
                step: "03",
                title: "Nhận Phản Hồi",
                description: "AI sẽ đưa ra lời khuyên để cải thiện tư thế",
                icon: <Brain className="w-8 h-8 text-primary" />
              }
            ].map((item, index) => (
              <Card key={index} className="relative group hover:shadow-glow transition-all duration-300 border-primary/20 hover:border-primary/60">
                <CardHeader className="text-center">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                  <div className="flex justify-center mb-4 mt-4 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center group-hover:text-foreground transition-colors">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 overflow-hidden" style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute inset-0 bg-black/80" />
        
        {/* Animated background elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse" />
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-500" />
        
        <div className="relative container mx-auto text-center space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-white/90 text-sm font-medium">
              <Zap className="w-4 h-4" />
              Công nghệ AI tiên tiến
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight drop-shadow-lg">
              Sẵn Sàng Thay Đổi
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Cách Tập Luyện?
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-white max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              AI huấn luyện viên cá nhân. Phân tích chính xác, Đưa ra phản hồi cho người dùng.
            </p>
          </div>

          {/* Key Benefits */}
          <div className="flex justify-center gap-8 md:gap-12 text-white">
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20 transition-all duration-300">
                <Target className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-sm font-medium">Độ chính xác cao</div>
            </div>
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20 transition-all duration-300">
                <Brain className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-sm font-medium">Hỗ trợ AI</div>
            </div>
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20 transition-all duration-300">
                <Zap className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-sm font-medium">Hoàn toàn miễn phí</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-100 px-12 py-6 text-xl font-bold rounded-full shadow-2xl hover:shadow-white/20 transform hover:scale-105 transition-all duration-300"
              onClick={() => navigate('/dashboard')}
            >
              <Play className="w-6 h-6 mr-3" />
              Bắt Đầu Ngay - Miễn Phí
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white/80 text-white hover:bg-white/10 px-10 py-6 text-lg rounded-full backdrop-blur-sm hover:border-white transition-all duration-300"
            >
              <Camera className="w-5 h-5 mr-2" />
              Xem Demo Live
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto pt-8">
            <div className="flex items-center justify-center gap-2 text-white text-sm">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Không cần cài đặt</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-white text-sm">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Bảo mật tuyệt đối</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-white text-sm">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Hỗ trợ mọi thiết bị</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-white text-sm">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Cập nhật liên tục</span>
            </div>
          </div>

          {/* Motivation element */}
          <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm rounded-full px-6 py-3 text-green-200 text-sm font-medium border border-green-400/30">
            <Target className="w-4 h-4" />
            Bắt đầu hành trình cải thiện tư thế tập luyện của bạn ngay hôm nay
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">GymPose</span>
              </div>
              <p className="text-muted-foreground">
                Hệ thống huấn luyện thể thao thông minh với AI, giúp bạn tập luyện hiệu quả và an toàn.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Sản Phẩm</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Phân tích tư thế</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Huấn luyện AI</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Theo dõi tiến độ</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Hỗ Trợ</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Hướng dẫn</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Liên hệ</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Về Chúng Tôi</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Đội ngũ G18</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Công nghệ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 GymPose - Powered by G18. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
