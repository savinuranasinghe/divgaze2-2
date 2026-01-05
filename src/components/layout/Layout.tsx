import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { VoiceAgentWidget } from '../shared/VoiceAgentWidget';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      
      {/* Voice Agent Widget - Floating button on all pages */}
      <VoiceAgentWidget />
    </div>
  );
};
