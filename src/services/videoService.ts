/**
 * Video Service
 * Handles video recording, upload, and processing
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface RepFeedback {
  rep_id: number;
  depth_feedback: string;
  back_feedback: string;
  lowest_knee_angle: number;
  is_valid: boolean;
}

export interface VideoProcessingResponse {
  processed_video_url: string;
  keypoints_data_url?: string;
  frame_count: number;
  processing_fps: number;
  processing_time: number;
  detected_persons_count: number;
  total_squats?: number;
  valid_squats?: number;
  invalid_squats?: number;
  rep_feedbacks?: RepFeedback[];
  total_pushups?: number;
  valid_pushups?: number;
  invalid_pushups?: number;
  pushup_rep_feedbacks?: RepFeedback[];
  total_barbells?: number;
  valid_barbells?: number;
  invalid_barbells?: number;
  barbell_rep_feedbacks?: RepFeedback[];
  total_lunges?: number;
  valid_lunges?: number;
  invalid_lunges?: number;
  lunge_rep_feedbacks?: RepFeedback[];
}

/**
 * Upload video for squat analysis
 */
export const uploadVideoForAnalysis = async (
  videoBlob: Blob,
  filename: string = 'squat_video.mp4',
  cameraAngle: 'front_view' | 'side_view' = 'front_view',
  sessionId?: string
): Promise<VideoProcessingResponse> => {
  const formData = new FormData();
  formData.append('video', videoBlob, filename);
  formData.append('draw_bbox', 'true');
  formData.append('draw_keypoints', 'true');
  formData.append('save_keypoints', 'true');
  formData.append('min_confidence', '0.3');
  formData.append('output_fps', '30');
  formData.append('analyze_squat', 'true');
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
  
  // Convert relative URLs to absolute
  if (data.processed_video_url && !data.processed_video_url.startsWith('http')) {
    data.processed_video_url = `${API_BASE_URL}${data.processed_video_url}`;
  }
  if (data.keypoints_data_url && !data.keypoints_data_url.startsWith('http')) {
    data.keypoints_data_url = `${API_BASE_URL}${data.keypoints_data_url}`;
  }

  return data;
};

/**
 * Video Recorder class
 * Enhanced with countdown support
 */
export class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private isCountingDown: boolean = false;

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'video/webm;codecs=vp8',
        videoBitsPerSecond: 2500000
      });

      this.chunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      // Don't start recording yet during countdown
      this.isCountingDown = true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error('Camera access denied or not available');
    }
  }

  // Actually start recording after countdown
  actuallyStartRecording(): void {
    if (this.mediaRecorder && this.isCountingDown) {
      this.mediaRecorder.start();
      this.isCountingDown = false;
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        this.cleanup();
        resolve(blob);
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.cleanup();
        reject(new Error('Recording failed'));
      };

      this.mediaRecorder.stop();
    });
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.isCountingDown = false;
  }
}
