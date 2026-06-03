/**
 * STT Comparison Utilities
 * So sánh useSTT hook với test_stt_client.html để tìm sự khác biệt
 */

export const sttComparison = {
  /**
   * Test audio conversion methods
   */
  testAudioConversion: () => {
    console.log('🧪 Testing audio conversion methods...');
    
    const testFloat32 = new Float32Array([-1, -0.5, 0, 0.5, 1]);
    
    // Method 1: Current useSTT method
    const method1 = new Int16Array(testFloat32.length);
    for (let i = 0; i < testFloat32.length; i++) {
      const s = Math.max(-1, Math.min(1, testFloat32[i]));
      method1[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    // Method 2: Test client method (exact copy)
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
    console.log('Method 1 (useSTT):', Array.from(method1));
    console.log('Method 2 (Test Client):', Array.from(method2));
    console.log('Method 3 (Alternative):', Array.from(method3));
    console.log('Method 1 vs 2 match:', method1.every((val, i) => val === method2[i]));
    console.log('Method 2 vs 3 match:', method2.every((val, i) => val === method3[i]));
    
    return {
      input: Array.from(testFloat32),
      useSTT: Array.from(method1),
      testClient: Array.from(method2),
      alternative: Array.from(method3),
      useSTTMatchesTestClient: method1.every((val, i) => val === method2[i])
    };
  },

  /**
   * Test WebSocket connection timing
   */
  testConnectionTiming: async () => {
    console.log('🔌 Testing WebSocket connection timing...');
    
    const startTime = Date.now();
    const ws = new WebSocket('ws://localhost:8000/ws/stt');
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('Connection timeout after 5 seconds'));
      }, 5000);
      
      ws.onopen = () => {
        const duration = Date.now() - startTime;
        console.log(`✅ WebSocket connected in ${duration}ms`);
        clearTimeout(timeout);
        ws.close();
        resolve({ duration, success: true });
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket connection failed:', error);
        clearTimeout(timeout);
        reject(error);
      };
    });
  },

  /**
   * Test audio constraints
   */
  testAudioConstraints: async () => {
    console.log('🎤 Testing audio constraints...');
    
    const constraints = {
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    };
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const audioTrack = stream.getAudioTracks()[0];
      const settings = audioTrack.getSettings();
      
      console.log('Audio settings:', settings);
      
      // Stop the stream
      stream.getTracks().forEach(track => track.stop());
      
      return {
        success: true,
        settings,
        constraints
      };
    } catch (error) {
      console.error('❌ Audio constraints test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Test complete STT flow
   */
  testCompleteFlow: async () => {
    console.log('🔄 Testing complete STT flow...');
    
    const results = {
      audioConversion: sttComparison.testAudioConversion(),
      connectionTiming: null,
      audioConstraints: null,
      errors: []
    };
    
    try {
      results.connectionTiming = await sttComparison.testConnectionTiming();
    } catch (error) {
      results.errors.push(`Connection timing: ${error.message}`);
    }
    
    try {
      results.audioConstraints = await sttComparison.testAudioConstraints();
    } catch (error) {
      results.errors.push(`Audio constraints: ${error.message}`);
    }
    
    console.log('📊 Complete test results:', results);
    return results;
  }
};

// Export for global access
(window as any).sttComparison = sttComparison;
