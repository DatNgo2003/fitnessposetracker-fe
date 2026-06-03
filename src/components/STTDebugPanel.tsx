import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSTT } from '@/hooks/useSTT';
import { sttDebug } from '@/utils/sttDebug';
import { Mic, MicOff, Bug, Wifi, WifiOff } from 'lucide-react';

export const STTDebugPanel = () => {
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev.slice(-20), `[${timestamp}] ${message}`]);
  };

  const {
    isConnected,
    isRecording,
    currentTranscript,
    partialText,
    error,
    toggleRecording,
    connect,
    disconnect,
  } = useSTT({
    onTranscript: (transcript) => {
      addLog(`📌 Final: ${transcript}`);
    },
    onPartial: (tokens) => {
      const partial = tokens.filter(t => !t.is_final).map(t => t.text).join('');
      if (partial) addLog(`💬 Partial: ${partial}`);
    },
    onError: (error) => {
      addLog(`❌ Error: ${error}`);
    },
    onFinished: (finalTranscript) => {
      addLog(`✅ Finished: ${finalTranscript}`);
    },
  });

  const runBrowserCheck = () => {
    addLog('🌐 Running browser compatibility check...');
    const support = sttDebug.checkBrowserSupport();
    Object.entries(support).forEach(([feature, supported]) => {
      addLog(`${supported ? '✅' : '❌'} ${feature}: ${supported}`);
    });
  };

  const testAudioConversion = () => {
    addLog('🧪 Testing audio conversion methods...');
    sttDebug.testAudioConversion();
    addLog('Check console for detailed comparison');
  };

  const testWebSocketConnection = async () => {
    addLog('🧪 Testing WebSocket connection...');
    try {
      await sttDebug.testWebSocketConnection();
      addLog('✅ WebSocket connection test passed');
    } catch (error) {
      addLog(`❌ WebSocket connection test failed: ${error}`);
    }
  };

  const testAudioSend = async () => {
    addLog('🧪 Testing audio data send...');
    try {
      await sttDebug.testAudioSend();
      addLog('✅ Audio send test completed');
    } catch (error) {
      addLog(`❌ Audio send test failed: ${error}`);
    }
  };

  const testMicrophone = async () => {
    addLog('🧪 Testing microphone access and levels...');
    try {
      await sttDebug.testMicrophone();
      addLog('✅ Microphone test completed - check console for audio levels');
    } catch (error) {
      addLog(`❌ Microphone test failed: ${error}`);
    }
  };

  const clearLogs = () => {
    setDebugLogs([]);
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">STT Debug Panel</h2>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Connection Controls */}
        <div className="flex gap-2">
          <Button
            onClick={connect}
            disabled={isConnected}
            variant="outline"
            size="sm"
          >
            <Wifi className="w-4 h-4 mr-2" />
            Connect
          </Button>
          <Button
            onClick={disconnect}
            disabled={!isConnected}
            variant="outline"
            size="sm"
          >
            <WifiOff className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        </div>

        {/* Recording Controls */}
        <div className="flex gap-2">
          <Button
            onClick={toggleRecording}
            disabled={!isConnected}
            variant={isRecording ? "destructive" : "default"}
            size="sm"
          >
            {isRecording ? (
              <><MicOff className="w-4 h-4 mr-2" />Stop Recording</>
            ) : (
              <><Mic className="w-4 h-4 mr-2" />Start Recording</>
            )}
          </Button>
        </div>

        {/* Debug Tools */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={runBrowserCheck} variant="outline" size="sm">
            <Bug className="w-4 h-4 mr-2" />
            Browser Check
          </Button>
          <Button onClick={testMicrophone} variant="outline" size="sm">
            🎤 Test Microphone
          </Button>
          <Button onClick={testAudioConversion} variant="outline" size="sm">
            🧪 Test Audio
          </Button>
          <Button onClick={testWebSocketConnection} variant="outline" size="sm">
            🔌 Test WebSocket
          </Button>
          <Button onClick={testAudioSend} variant="outline" size="sm">
            📤 Test Audio Send
          </Button>
          <Button onClick={clearLogs} variant="outline" size="sm">
            🗑️ Clear Logs
          </Button>
        </div>

        {/* Status Display */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Current Transcript</h3>
            <div className="p-3 bg-muted rounded min-h-[60px]">
              {currentTranscript || 'No transcript yet...'}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Partial Text</h3>
            <div className="p-3 bg-muted rounded min-h-[60px] italic text-muted-foreground">
              {partialText || 'No partial text...'}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Debug Logs */}
        <div>
          <h3 className="font-semibold mb-2">Debug Logs</h3>
          <div className="bg-black text-green-400 p-3 rounded font-mono text-sm h-48 overflow-y-auto">
            {debugLogs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              debugLogs.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
          <strong>Instructions:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Click "Browser Check" to verify compatibility</li>
            <li>Click "Connect" to establish WebSocket connection</li>
            <li>Click "Start Recording" and speak into microphone</li>
            <li>Watch logs for debugging information</li>
            <li>Compare behavior with test_stt_client.html</li>
          </ol>
        </div>
      </div>
    </Card>
  );
};
