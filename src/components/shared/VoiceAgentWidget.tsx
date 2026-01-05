// VoiceAgentWidget.tsx - Floating Voice Agent for DivGaze
import { useState } from 'react';
import { Mic, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceAgentWidgetProps {
  agentUrl?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const VoiceAgentWidget = ({ 
  agentUrl = 'https://divgaze-agent.vercel.app',
  position = 'bottom-right'
}: VoiceAgentWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getPositionClasses = () => {
    const positions = {
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4'
    };
    return positions[position];
  };

  // Security: Validate agent URL
  const isValidUrl = (url: string): boolean => {
    const allowedDomains = [
      'divgaze-agent.vercel.app',
      'divgaze.com',
      'www.divgaze.com',
      'localhost:3000',
      'localhost:5173'
    ];
    
    try {
      const urlObj = new URL(url);
      return allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
      );
    } catch {
      return false;
    }
  };

  const safeAgentUrl = isValidUrl(agentUrl) ? agentUrl : 'https://divgaze-agent.vercel.app';

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className={`fixed ${getPositionClasses()} z-50 h-14 w-14 rounded-full bg-black hover:bg-gray-900 p-0 shadow-lg transition-all hover:scale-110 hover:shadow-xl md:h-16 md:w-16`}
          aria-label="Open Voice Agent"
        >
          <Mic className="h-6 w-6 text-white md:h-7 md:w-7" />
        </Button>
      )}

      {/* Voice Agent Container */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          <div 
            className="fixed z-50 flex flex-col overflow-hidden bg-white shadow-2xl
              inset-0 rounded-none
              md:inset-auto md:top-20 md:bottom-4 md:right-4 md:left-auto
              md:w-[420px] md:rounded-2xl
              md:max-h-[calc(100vh-6rem)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-black px-4 py-2.5 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-white" />
                <h3 className="font-semibold text-white text-xs">DivGaze Voice Agent</h3>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                aria-label="Close Voice Agent"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* iFrame */}
            <div className="flex-1 overflow-hidden bg-black min-h-0">
              <iframe
                src={safeAgentUrl}
                className="w-full h-full border-0 block"
                title="DivGaze Voice Agent"
                allow="microphone"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};
