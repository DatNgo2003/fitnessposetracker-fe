/**
 * Audio Service for handling microphone input and audio processing
 * Optimized for STT integration with 16kHz, mono, 16-bit PCM format
 */

export interface AudioConfig {
  sampleRate: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  sampleRate: 16000,
  channelCount: 1,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

export class AudioService {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private isRecording = false;
  private onAudioData?: (audioBuffer: ArrayBuffer) => void;

  constructor(private config: AudioConfig = DEFAULT_AUDIO_CONFIG) {}

  /**
   * Kiểm tra xem trình duyệt có hỗ trợ getUserMedia không
   */
  static isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Yêu cầu quyền truy cập microphone
   */
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Đóng stream ngay sau khi test permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  /**
   * Bắt đầu ghi âm với callback để nhận audio data
   */
  async startRecording(onAudioData: (audioBuffer: ArrayBuffer) => void): Promise<void> {
    if (this.isRecording) {
      throw new Error('Already recording');
    }

    if (!AudioService.isSupported()) {
      throw new Error('getUserMedia is not supported in this browser');
    }

    try {
      // Yêu cầu truy cập microphone
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channelCount,
          echoCancellation: this.config.echoCancellation,
          noiseSuppression: this.config.noiseSuppression,
          autoGainControl: this.config.autoGainControl,
        }
      });

      // Tạo AudioContext
      this.audioContext = new AudioContext({ 
        sampleRate: this.config.sampleRate 
      });

      // Tạo source node từ media stream
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Tạo processor node để xử lý audio chunks
      // Buffer size 4096 samples = ~256ms at 16kHz
      this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.onAudioData = onAudioData;

      // Xử lý audio data
      this.processorNode.onaudioprocess = (event) => {
        if (!this.isRecording) return;

        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Convert float32 to int16 PCM
        const pcmData = this.convertFloat32ToInt16(inputData);
        
        // Gửi audio data qua callback
        this.onAudioData?.(pcmData.buffer as ArrayBuffer);
      };

      // Kết nối audio nodes
      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);

      this.isRecording = true;
      console.log('Audio recording started');

    } catch (error) {
      this.cleanup();
      throw new Error(`Failed to start recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Dừng ghi âm
   */
  stopRecording(): void {
    if (!this.isRecording) return;

    this.isRecording = false;
    this.cleanup();
    console.log('Audio recording stopped');
  }

  /**
   * Kiểm tra trạng thái ghi âm
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Lấy thông tin audio context
   */
  getAudioInfo(): { sampleRate: number; state: string } | null {
    if (!this.audioContext) return null;
    
    return {
      sampleRate: this.audioContext.sampleRate,
      state: this.audioContext.state,
    };
  }

  /**
   * Convert Float32Array to Int16Array (PCM format)
   */
  private convertFloat32ToInt16(float32Array: Float32Array): Int16Array {
    const int16Array = new Int16Array(float32Array.length);
    
    for (let i = 0; i < float32Array.length; i++) {
      // Clamp values to [-1, 1] and convert to 16-bit signed integer
      const clampedValue = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = Math.round(clampedValue * 32767);
    }
    
    return int16Array;
  }

  /**
   * Tính toán RMS (Root Mean Square) để đo độ lớn âm thanh
   */
  static calculateRMS(audioData: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    return Math.sqrt(sum / audioData.length);
  }

  /**
   * Kiểm tra xem có âm thanh hay không (dựa trên threshold)
   */
  static isSilent(audioData: Float32Array, threshold = 0.01): boolean {
    const rms = AudioService.calculateRMS(audioData);
    return rms < threshold;
  }

  /**
   * Dọn dẹp resources
   */
  private cleanup(): void {
    // Ngắt kết nối audio nodes
    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode.onaudioprocess = null;
      this.processorNode = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    // Đóng AudioContext
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Dừng media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.onAudioData = undefined;
  }

  /**
   * Cleanup khi destroy service
   */
  destroy(): void {
    this.stopRecording();
  }
}

// Export singleton instance
export const audioService = new AudioService();
