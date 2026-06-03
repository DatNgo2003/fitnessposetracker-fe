import { STTDebugPanel } from '@/components/STTDebugPanel';

export const STTDebug = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">STT Debug Page</h1>
          <p className="text-muted-foreground">
            Debug Speech-to-Text integration issues
          </p>
        </div>
        
        <STTDebugPanel />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Compare with: <code>test_stt_client.html</code> in backend folder
          </p>
        </div>
      </div>
    </div>
  );
};
