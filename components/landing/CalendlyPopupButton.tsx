'use client';

import { useEffect } from 'react';
import { Calendar } from 'lucide-react';

// Declare Calendly on window for TypeScript
declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
    };
  }
}

interface CalendlyPopupButtonProps {
  // TODO: Replace with actual Calendly URL (e.g., 'https://calendly.com/cartaisy/demo')
  url?: string;
  text?: string;
  className?: string;
  showIcon?: boolean;
}

export default function CalendlyPopupButton({
  url = 'https://calendly.com/cartaisy/demo',
  text = 'Schedule a Demo',
  className = '',
  showIcon = true
}: CalendlyPopupButtonProps) {

  useEffect(() => {
    // Load Calendly CSS
    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Load Calendly script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      const existingLink = document.querySelector('link[href="https://assets.calendly.com/assets/external/widget.css"]');
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (existingLink) document.head.removeChild(existingLink);
      if (existingScript) document.body.removeChild(existingScript);
    };
  }, []);

  const openCalendly = () => {
    if (window.Calendly) {
      window.Calendly.initPopupWidget({
        url: `${url}?hide_gdpr_banner=1&background_color=1e1b4b&text_color=ffffff&primary_color=9333ea`
      });
    }
  };

  return (
    <button
      onClick={openCalendly}
      className={className || 'inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors'}
    >
      {showIcon && <Calendar size={16} />}
      {text}
    </button>
  );
}
