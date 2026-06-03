import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GlobalAvatarProvider from "./components/GlobalAvatarProvider";
import { GlobalBackgroundMusicProvider } from "./components/GlobalBackgroundMusicProvider";
import GlobalMusicPlayer from "./components/GlobalMusicPlayer";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Training from "./pages/Training";
import NotFound from "./pages/NotFound";
import SquatAnalysis from "./pages/SquatAnalysis";
import PushupAnalysis from "./pages/PushupAnalysis";
import BarbellAnalysis from "./pages/BarbellAnalysis";
import LungeAnalysis from "./pages/LungeAnalysis";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GlobalBackgroundMusicProvider musicSrc="/background-music.mp3" initialVolume={0.25} autoPlay={false}>
        <BrowserRouter>
          <GlobalAvatarProvider>
            {/* Global Music Player - Xuất hiện ở tất cả trang */}
            <GlobalMusicPlayer />
            
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/training/:exerciseId" element={<Training />} />
              <Route path="/squat-analysis" element={<SquatAnalysis />} />
              <Route path="/pushup-analysis" element={<PushupAnalysis />} />
              <Route path="/barbell-analysis" element={<BarbellAnalysis />} />
              <Route path="/lunge-analysis" element={<LungeAnalysis />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </GlobalAvatarProvider>
        </BrowserRouter>
      </GlobalBackgroundMusicProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
