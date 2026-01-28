'use client';

import { Cookie } from 'lucide-react';
import { useCookieConsent } from './CookieConsentProvider';

interface CookieSettingsButtonProps {
  className?: string;
}

export default function CookieSettingsButton({ className = '' }: CookieSettingsButtonProps) {
  const { openSettings } = useCookieConsent();

  return (
    <button
      onClick={openSettings}
      className={`inline-flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors ${className}`}
    >
      <Cookie size={16} />
      <span>Cookie Settings</span>
    </button>
  );
}
