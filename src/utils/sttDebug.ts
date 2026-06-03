/**
 * STT Debug utilities to help troubleshoot issues
 */

export const sttDebug = {
  /**
   * Log audio context info
   */
  logAudioContext: (audioContext: AudioContext | null) => {
    if (!audioContext) {
      console.log('🔍 AudioContext: null');
      return;
    }
    
    console.log('🔍 AudioContext Info:', {
      state: audioContext.state,
      sampleRate: audioContext.sampleRate,
      currentTime: audioContext.currentTime,
      baseLatency: audioContext.baseLatency,
      outputLatency: audioContext.outputLatency,
    });
  },

  /**
   * Log WebSocket info
   */
  logWebSocket: (ws: WebSocket | null) => {
    if (!ws) {
      console.log('🔍 WebSocket: null');
      return;
    }

    const states = {
      0: 'CONNECTING',
      1: 'OPEN', 
      2: 'CLOSING',
      3: 'CLOSED'
    };

    console.log('🔍 WebSocket Info:', {
      readyState: states[ws.readyState as keyof typeof states],
      url: ws.url,
      protocol: ws.protocol,
      extensions: ws.extensions,
    });
  },

  /**
   * Log media stream info
   */
  logMediaStream: (stream: MediaStream | null) => {
    if (!stream) {
      console.log('🔍 MediaStream: null');
      return;
    }

    const audioTracks = stream.getAudioTracks();
    console.log('🔍 MediaStream Info:', {
      id: stream.id,
      active: stream.active,
      audioTracks: audioTracks.length,
      trackInfo: audioTracks.map(track => ({
        id: track.id,
        kind: track.kind,
        label: track.label,
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState,
        settings: track.getSettings(),
        constraints: track.getConstraints(),
      }))
    });
  },

  /**
   * Test audio data conversion
   */
  testAudioConversion: () => {
    console.log('🧪 Testing audio conversion...');
    
    // Test data
    const testFloat32 = new Float32Array([-1, -0.5, 0, 0.5, 1]);
    
    // Method 1: Current hook method
    const method1 = new Int16Array(testFloat32.length);
    for (let i = 0; i < testFloat32.length; i++) {
      method1[i] = Math.max(-32768, Math.min(32767, testFloat32[i] * 32768));
    }
    
    // Method 2: Test client method
    const method2 = new Int16Array(testFloat32.length);
    for (let i = 0; i < testFloat32.length; i++) {
      const s = Math.max(-1, Math.min(1, testFloat32[i]));
      method2[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    // Method 3: Alternative method
    const method3 = new Int16Array(testFloat32.length);
    for (let i = 0; i < testFloat32.length; i++) {
      const sample = Math.max(-1, Math.min(1, testFloat32[i]));
      method3[i] = Math.round(sample * 32767);
    }
    
    console.log('Input Float32:', Array.from(testFloat32));
    console.log('Method 1 (Current Hook):', Array.from(method1));
    console.log('Method 2 (Test Client):', Array.from(method2));
    console.log('Method 3 (Alternative):', Array.from(method3));
    console.log('Method 1 vs 2 match:', method1.every((val, i) => val === method2[i]));
    console.log('Method 2 vs 3 match:', method2.every((val, i) => val === method3[i]));
    
    // Test buffer creation
    console.log('Buffer sizes:');
    console.log('Method 1 buffer size:', method1.buffer.byteLength);
    console.log('Method 2 buffer size:', method2.buffer.byteLength);
    console.log('Method 3 buffer size:', method3.buffer.byteLength);
  },

  /**
   * Check browser compatibility
   */
  checkBrowserSupport: () => {
    const support = {
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      WebSocket: typeof WebSocket !== 'undefined',
      AudioContext: typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined',
      ScriptProcessorNode: typeof AudioContext !== 'undefined' && 'createScriptProcessor' in AudioContext.prototype,
    };

    console.log('🌐 Browser Support:', support);
    
    const allSupported = Object.values(support).every(Boolean);
    console.log(allSupported ? '✅ All features supported' : '❌ Some features not supported');
    
    return support;
  },

  /**
   * Monitor audio levels
   */
  monitorAudioLevels: (audioData: Float32Array) => {
    // Calculate RMS
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    const rms = Math.sqrt(sum / audioData.length);
    
    // Calculate peak
    const peak = Math.max(...Array.from(audioData).map(Math.abs));
    
    // Simple volume indicator
    const volumeBars = Math.floor(rms * 20);
    const volumeIndicator = '█'.repeat(volumeBars) + '░'.repeat(20 - volumeBars);
    
    return {
      rms: rms.toFixed(4),
      peak: peak.toFixed(4),
      volumeIndicator,
      isSilent: rms < 0.01
    };
  },

  /**
   * Test WebSocket connection directly
   */
  testWebSocketConnection: async () => {
    console.log('🧪 Testing WebSocket connection...');
    
    const wsUrl = 'ws://localhost:8000/ws/stt';
    const ws = new WebSocket(wsUrl);
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket connection timeout'));
      }, 5000);
      
      ws.onopen = () => {
        console.log('✅ WebSocket test connection successful');
        clearTimeout(timeout);
        
        // Send a test close message
        ws.send(JSON.stringify({ type: 'close' }));
        
        setTimeout(() => {
          ws.close();
          resolve(true);
        }, 100);
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket test connection failed:', error);
        clearTimeout(timeout);
        reject(error);
      };
      
      ws.onmessage = (event) => {
        console.log('📨 WebSocket test message:', event.data);
      };
    });
  },

  /**
   * Test microphone access and audio levels
   */
  testMicrophone: async () => {
    console.log('🧪 Testing microphone access...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('✅ Microphone access granted');
      sttDebug.logMediaStream(stream);
      
      // Test audio levels for 3 seconds
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(1024, 1, 1);
      
      let sampleCount = 0;
      const maxSamples = 3 * 16000 / 1024; // 3 seconds
      
      processor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        const levels = sttDebug.monitorAudioLevels(inputData);
        
        sampleCount++;
        if (sampleCount % 10 === 0) {
          console.log(`🎤 Audio Level: RMS=${levels.rms}, Peak=${levels.peak}, ${levels.volumeIndicator}`);
        }
        
        if (sampleCount >= maxSamples) {
          processor.disconnect();
          source.disconnect();
          audioContext.close();
          stream.getTracks().forEach(track => track.stop());
          console.log('✅ Microphone test completed');
        }
      };
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      return true;
    } catch (error) {
      console.error('❌ Microphone test failed:', error);
      throw error;
    }
  },

  /**
   * Generate test audio data and send via WebSocket
   */
  testAudioSend: async () => {
    console.log('🧪 Testing audio data send...');
    
    const wsUrl = 'ws://localhost:8000/ws/stt';
    const ws = new WebSocket(wsUrl);
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('Audio send test timeout'));
      }, 10000);
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected for audio test');
        
        // Generate test audio data (sine wave)
        const sampleRate = 16000;
        const duration = 1; // 1 second
        const frequency = 440; // A4 note
        const samples = sampleRate * duration;
        
        const audioData = new Float32Array(samples);
        for (let i = 0; i < samples; i++) {
          audioData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.1;
        }
        
        // Convert to int16
        const int16Data = new Int16Array(samples);
        for (let i = 0; i < samples; i++) {
          const s = Math.max(-1, Math.min(1, audioData[i]));
          int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        console.log(`📤 Sending test audio: ${int16Data.length} samples, ${int16Data.buffer.byteLength} bytes`);
        
        // Send audio data
        ws.send(int16Data.buffer);
        
        // Wait a bit then close
        setTimeout(() => {
          ws.send(JSON.stringify({ type: 'close' }));
          clearTimeout(timeout);
          resolve(true);
        }, 2000);
      };
      
      ws.onerror = (error) => {
        console.error('❌ Audio send test failed:', error);
        clearTimeout(timeout);
        reject(error);
      };
      
      ws.onmessage = (event) => {
        console.log('📨 Audio test response:', event.data);
      };
    });
  }
};

// Export for global access in dev mode
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).sttDebug = sttDebug;
}
