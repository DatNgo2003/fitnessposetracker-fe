/**
 * Pushup Analysis Page
 * User can watch sample video, record their pushup, and get detailed feedback
 */
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { VideoRecorder, VideoProcessingResponse } from '@/services/videoService';
import VideoProcessingProgress from '@/components/VideoProcessingProgress';
import { useVoiceFeedback } from '@/hooks/useVoiceFeedback';
import {
  Video,
  VideoOff,
  Upload,
  Loader2,
  Play,
  AlertCircle,
  ChevronLeft,
  Download,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  XCircle,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type RecordingState = 'idle' | 'countdown' | 'recording' | 'stopped' | 'uploading' | 'completed';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Upload video for PUSHUP analysis (different from squat)
async function uploadVideoForPushupAnalysis(
  videoBlob: Blob,
  filename: string,
  cameraAngle: 'front_view' | 'side_view' = 'front_view',
  sessionId?: string
): Promise<VideoProcessingResponse> {
  const formData = new FormData();
  formData.append('video', videoBlob, filename);
  formData.append('draw_bbox', 'true');
  formData.append('draw_keypoints', 'true');
  formData.append('save_keypoints', 'true');
  formData.append('min_confidence', '0.3');
  formData.append('output_fps', '30');
  formData.append('analyze_squat', 'false');  // Turn OFF squat
  formData.append('analyze_pushup', 'true');  // Turn ON pushup
  formData.append('camera_angle', cameraAngle);

  // Add session_id if provided for progress tracking
  if (sessionId) {
    formData.append('session_id', sessionId);
  }

  const response = await fetch(`${API_BASE_URL}/video/process`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload failed: ${error}`);
  }

  const data = await response.json();

  // Convert relative URLs to absolute (same as squat)
  if (data.processed_video_url && !data.processed_video_url.startsWith('http')) {
    data.processed_video_url = `${API_BASE_URL}${data.processed_video_url}`;
  }
  if (data.keypoints_data_url && !data.keypoints_data_url.startsWith('http')) {
    data.keypoints_data_url = `${API_BASE_URL}${data.keypoints_data_url}`;
  }

  return data;
}

export default function PushupAnalysis() {
  const navigate = useNavigate();

  // Load state from localStorage on mount
  const loadSavedState = () => {
    const saved = localStorage.getItem('pushupAnalysisState');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  };

  const savedState = loadSavedState();

  const [recordingState, setRecordingState] = useState<RecordingState>(
    savedState?.recordingState || 'idle'
  );
  const [videoRecorder] = useState(() => new VideoRecorder());
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [processingResult, setProcessingResult] = useState<VideoProcessingResponse | null>(
    savedState?.processingResult || null
  );
  const [error, setError] = useState<string>('');

  // New states for improved UX
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [countdown, setCountdown] = useState(10);
  const [cameraAngle, setCameraAngle] = useState<'front_view' | 'side_view'>('front_view');

  // Progress tracking states
  const [sessionId, setSessionId] = useState<string>('');
  const [showProgress, setShowProgress] = useState(false);
  const [showSampleVideo, setShowSampleVideo] = useState(true);

  // Voice feedback
  const { playFeedback, stop, isPlaying } = useVoiceFeedback('pushup', cameraAngle);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const resultVideoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Save state to localStorage when result changes
  useEffect(() => {
    if (processingResult) {
      localStorage.setItem('pushupAnalysisState', JSON.stringify({
        recordingState,
        processingResult
      }));
    }
  }, [processingResult, recordingState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoPreviewRef.current?.srcObject) {
        const stream = videoPreviewRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      // Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = async () => {
    if (!videoContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await videoContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2.0));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  // Countdown and start recording
  const handleStartRecording = async () => {
    try {
      setError('');

      // Start camera stream first
      await videoRecorder.startRecording();
      const stream = videoRecorder.getStream();
      if (stream && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      // Start countdown
      setRecordingState('countdown');
      setCountdown(10);

      // Countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            // Actually start recording after countdown
            videoRecorder.actuallyStartRecording();
            setRecordingState('recording');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  };

  const handleStopRecording = async () => {
    try {
      setError('');
      const blob = await videoRecorder.stopRecording();

      // Trim last 3 seconds from blob
      const trimmedBlob = await trimLastSeconds(blob, 3);
      setRecordedBlob(trimmedBlob);

      // Stop preview stream
      if (videoPreviewRef.current?.srcObject) {
        const stream = videoPreviewRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoPreviewRef.current.srcObject = null;
      }

      // Show recorded video preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.src = URL.createObjectURL(trimmedBlob);
        videoPreviewRef.current.controls = true;
      }

      // Exit fullscreen
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }

      setRecordingState('stopped');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop recording');
    }
  };

  // Trim last N seconds from video blob
  const trimLastSeconds = async (blob: Blob, seconds: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(blob);

      video.onloadedmetadata = async () => {
        try {
          const duration = video.duration;
          const trimDuration = Math.max(0, duration - seconds);

          if (trimDuration <= 0) {
            // Video too short, return original
            resolve(blob);
            return;
          }

          // Use MediaRecorder to re-encode trimmed video
          const stream = (video as any).captureStream();
          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9',
          });

          const chunks: Blob[] = [];
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data);
            }
          };

          mediaRecorder.onstop = () => {
            const trimmedBlob = new Blob(chunks, { type: 'video/webm' });
            resolve(trimmedBlob);
          };

          mediaRecorder.start();
          video.play();

          // Stop recording after trim duration
          setTimeout(() => {
            video.pause();
            mediaRecorder.stop();
          }, trimDuration * 1000);

        } catch (err) {
          reject(err);
        }
      };

      video.onerror = () => reject(new Error('Failed to load video'));
    });
  };

  const handleUploadVideo = async () => {
    if (!recordedBlob) return;

    try {
      setError('');

      // Generate unique session ID for progress tracking
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);
      setShowProgress(true);

      setRecordingState('uploading');

      const result = await uploadVideoForPushupAnalysis(recordedBlob, 'pushup_recording.webm', cameraAngle, newSessionId);
      setProcessingResult(result);
      setRecordingState('completed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process video');
      setRecordingState('stopped');
      setShowProgress(false);
    }
  };

  const handleProgressComplete = () => {
    setShowProgress(false);
  };

  const handleReset = () => {
    setRecordingState('idle');
    setRecordedBlob(null);
    setProcessingResult(null);
    setError('');
    // Clear localStorage
    localStorage.removeItem('pushupAnalysisState');
    if (videoPreviewRef.current) {
      videoPreviewRef.current.src = '';
      videoPreviewRef.current.srcObject = null;
    }
    if (resultVideoRef.current) {
      resultVideoRef.current.src = '';
    }
  };

  // Helper function to check if feedback is positive - CHECK NEGATIVE FIRST
  const isPositiveFeedback = (feedback?: string): boolean => {
    if (!feedback) return false;
    const lowerFeedback = feedback.toLowerCase();

    // Check negative keywords FIRST
    const negativeKeywords = ['chưa hạ', 'chưa tạo thành', 'không đủ', 'chưa thẳng'];
    if (negativeKeywords.some(k => lowerFeedback.includes(k))) {
      return false;
    }

    // Then check positive keywords
    const positiveKeywords = ['tốt lắm', 'rất tốt', 'đẹp từ vai', 'đường thẳng đẹp'];
    return positiveKeywords.some(keyword => lowerFeedback.includes(keyword));
  };

  const getStatusColor = (isValid: boolean) => (isValid ? 'text-green-600' : 'text-red-600');

  const backgroundImage = 'url("https://png.pngtree.com/background/20230516/original/pngtree-large-room-full-of-equipment-in-a-gym-picture-image_2611111.jpg")';

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage }}
      />
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />
      <div className="relative max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="border-white/60 text-white hover:bg-white/20"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowSampleVideo((prev) => !prev)}
              className="bg-white/90 text-gray-900 hover:bg-white"
            >
              {showSampleVideo ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Ẩn video mẫu
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Hiện video mẫu
                </>
              )}
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Phân Tích Động Tác Pushup
          </h1>
          <p className="text-white/90">
            Xem video mẫu, quay video của bạn và nhận phản hồi chi tiết
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className={`${showSampleVideo ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''} mb-6`}>
          {/* Sample Video */}
          {showSampleVideo && (
            <Card className="transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Video Mẫu Pushup
                </CardTitle>
                <CardDescription>
                  Xem kỹ thuật thực hiện đúng cách
                </CardDescription>
              </CardHeader>
              <CardContent>
                <video
                  controls
                  className="w-full rounded-lg bg-black"
                  src={`${API_BASE_URL}/sample-videos/pushup${cameraAngle === 'side_view' ? '-side' : ''}`}
                >
                  Trình duyệt không hỗ trợ video
                </video>
                <div className="mt-4 space-y-2 text-sm text-white/80">
                  <p>✓ Lưng thẳng, cơ thể tạo đường thẳng</p>
                  <p>✓ Khuỷu tay gập góc 90°</p>
                  <p>✓ Xuống sâu, ngực gần chạm đất</p>
                  <p>✓ Đẩy lên hoàn toàn, duỗi thẳng tay</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recording & Preview */}
          <div className={`transition-all duration-300 ${showSampleVideo ? '' : 'max-w-4xl mx-auto w-full'}`}>
            <Card className={`${showSampleVideo ? '' : 'shadow-xl'}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Quay Video Của Bạn
                </CardTitle>
                <CardDescription>
                  {recordingState === 'idle' && 'Nhấn "Bắt Đầu" để quay video - Hệ thống sẽ đếm ngược 10 giây'}
                  {recordingState === 'countdown' && `⏳ Chuẩn bị... ${countdown} giây`}
                  {recordingState === 'recording' && '🔴 Đang quay... Thực hiện động tác pushup'}
                  {recordingState === 'stopped' && 'Video đã quay xong (tự động cắt 3s cuối), nhấn "Nhận Feedback"'}
                  {recordingState === 'uploading' && 'Đang xử lý video...'}
                  {recordingState === 'completed' && 'Hoàn tất! Xem kết quả bên dưới'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Video Container with Fullscreen Support */}
                <div
                  ref={videoContainerRef}
                  className="relative mb-4"
                >
                  <video
                    ref={videoPreviewRef}
                    className="w-full rounded-lg bg-black"
                    autoPlay
                    muted
                    playsInline
                    style={{
                      transform: `scale(${zoom})`,
                      transition: 'transform 0.3s ease'
                    }}
                  />

                  {/* Countdown Overlay */}
                  {recordingState === 'countdown' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-9xl font-bold text-white animate-pulse">
                          {countdown}
                        </div>
                        <p className="text-xl text-white mt-4">
                          Vào tư thế plank...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Zoom & Fullscreen Controls - Only during recording */}
                  {(recordingState === 'countdown' || recordingState === 'recording') && (
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={handleZoomIn}
                        title="Phóng to"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={handleZoomOut}
                        title="Thu nhỏ"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                      >
                        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {recordingState === 'idle' && (
                    <Button
                      onClick={handleStartRecording}
                      className="flex-1"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Bắt Đầu Quay (10s đếm ngược)
                    </Button>
                  )}

                  {(recordingState === 'countdown' || recordingState === 'recording') && (
                    <Button
                      onClick={handleStopRecording}
                      variant="destructive"
                      className="flex-1"
                    >
                      <VideoOff className="w-4 h-4 mr-2" />
                      Dừng Lại
                    </Button>
                  )}

                  {recordingState === 'stopped' && (
                    <>
                      <Button
                        onClick={handleUploadVideo}
                        className="flex-1"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Nhận Feedback
                      </Button>
                      <Button
                        onClick={handleReset}
                        variant="outline"
                      >
                        Quay Lại
                      </Button>
                    </>
                  )}

                  {recordingState === 'uploading' && (
                    <Button disabled className="flex-1">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang Xử Lý...
                    </Button>
                  )}

                  {recordingState === 'completed' && (
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="flex-1"
                    >
                      Quay Video Mới
                    </Button>
                  )}
                </div>

                {/* Camera Angle Selection - Only shown when idle */}
                {recordingState === 'idle' && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium mb-2 block">Chọn Góc Quay</Label>
                    <RadioGroup
                      value={cameraAngle}
                      onValueChange={(value) => setCameraAngle(value as 'front_view' | 'side_view')}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="front_view" id="pushup-front-view" />
                        <Label htmlFor="pushup-front-view" className="cursor-pointer">
                          Góc Chính Diện
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="side_view" id="pushup-side-view" />
                        <Label htmlFor="pushup-side-view" className="cursor-pointer">
                          Góc Ngang
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress Section - Displayed prominently during upload */}
        {recordingState === 'uploading' && showProgress && sessionId && (
          <div className="mb-6">
            <VideoProcessingProgress
              sessionId={sessionId}
              onComplete={handleProgressComplete}
            />
          </div>
        )}

        {/* Results Section */}
        {processingResult && (
          <div className="space-y-6">
            {/* Processed Video */}
            <Card>
              <CardHeader>
                <CardTitle>Video Phân Tích Với Skeleton Overlay</CardTitle>
                <CardDescription>
                  Video của bạn với feedback trực quan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <video
                  ref={resultVideoRef}
                  controls
                  className="w-full rounded-lg bg-black"
                  src={processingResult.processed_video_url}
                  onLoadedMetadata={(e) => {
                    console.log('Video loaded:', e.currentTarget.duration, 'seconds');
                  }}
                  onError={(e) => {
                    console.error('Video error:', e);
                    console.error('Video src:', processingResult.processed_video_url);
                  }}
                >
                  Trình duyệt không hỗ trợ video
                </video>
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={() => {
                      if (resultVideoRef.current) {
                        resultVideoRef.current.play();
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Phát Video
                  </Button>
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = processingResult.processed_video_url;
                      link.download = 'pushup_analysis.mp4';
                      link.click();
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Tải Xuống
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats - 3 column grid like squat */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tổng Số Rep</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-green-600">
                    {processingResult.total_pushups || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-green-600">✓</span> Rep Hợp Lệ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-green-600">
                    {processingResult.valid_pushups || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-red-600">✗</span> Rep Không Hợp Lệ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-red-600">
                    {processingResult.invalid_pushups || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Per-Rep Feedback Table */}
            {processingResult.pushup_rep_feedbacks && processingResult.pushup_rep_feedbacks.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Chi Tiết Từng Rep</CardTitle>
                      <CardDescription>
                        Xem lỗi và góc độ cụ thể của từng lần tập
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => {
                        if (isPlaying) {
                          stop();
                        } else {
                          playFeedback(processingResult.pushup_rep_feedbacks || []);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {isPlaying ? (
                        <>
                          <VolumeX className="w-4 h-4" />
                          Dừng Voice Feedback
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          Voice Feedback
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Rep #</th>
                          <th className="text-left py-2 px-4">Trạng Thái</th>
                          <th className="text-left py-2 px-4">Độ Sâu</th>
                          {cameraAngle === 'side_view' && (
                            <th className="text-left py-2 px-4">Tư Thế Thân</th>
                          )}
                          <th className="text-left py-2 px-4">Góc Khuỷu Thấp Nhất</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processingResult.pushup_rep_feedbacks.map((rep: any) => (
                          <tr key={rep.rep_id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4 font-medium">Rep {rep.rep_id}</td>
                            <td className="py-2 px-4">
                              {rep.is_valid ? (
                                <Badge className="bg-green-500 text-white">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Hợp Lệ
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Sai
                                </Badge>
                              )}
                            </td>
                            <td className={`py-2 px-4 text-sm ${getStatusColor(isPositiveFeedback(rep.depth_feedback))}`}>
                              {rep.depth_feedback || '-'}
                            </td>
                            {cameraAngle === 'side_view' && (
                              <td className={`py-2 px-4 text-sm ${getStatusColor(isPositiveFeedback(rep.back_feedback))}`}>
                                {rep.back_feedback || '-'}
                              </td>
                            )}
                            <td className="py-2 px-4">
                              {rep.lowest_elbow_angle?.toFixed(1) || '-'}°
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Processing Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông Tin Xử Lý</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-200 space-y-1">
                <p>⏱️ Thời gian xử lý: <span className="text-white">{processingResult.processing_time.toFixed(2)}s</span></p>
                <p>🎬 Tổng số frame: <span className="text-white">{processingResult.frame_count}</span></p>
                <p>⚡ Tốc độ xử lý: <span className="text-white">{processingResult.processing_fps.toFixed(2)} FPS</span></p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
