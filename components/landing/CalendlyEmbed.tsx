'use client';

import { useEffect } from 'react';

interface CalendlyEmbedProps {
  // TODO: Replace with actual Calendly URL (e.g., 'https://calendly.com/cartaisy/demo')
  url?: string;
}

export default function CalendlyEmbed({
  url = 'https://calendly.com/cartaisy/demo'
}: CalendlyEmbedProps) {

  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div
      className="calendly-inline-widget rounded-xl overflow-hidden"
      data-url={`${url}?hide_gdpr_banner=1&background_color=1e1b4b&text_color=ffffff&primary_color=9333ea`}
      style={{ minWidth: '320px', height: '700px' }}
    />
  );
}
