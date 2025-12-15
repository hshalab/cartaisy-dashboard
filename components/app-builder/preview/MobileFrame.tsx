'use client';

import { ReactNode } from 'react';

interface MobileFrameProps {
  children: ReactNode;
}

export function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="relative">
      {/* iPhone-style frame */}
      <div className="relative mx-auto w-[375px] h-[812px] bg-slate-900 rounded-[50px] shadow-2xl border-4 border-slate-800 overflow-hidden">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-slate-900 z-20">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-full" />
        </div>

        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-12 z-10 flex items-center justify-between px-8 pt-1">
          <span className="text-white text-xs font-medium">9:41</span>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/>
            </svg>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 22h20V2z"/>
            </svg>
            <div className="w-6 h-3 bg-white rounded-sm relative">
              <div className="absolute right-[-2px] top-1/2 -translate-y-1/2 w-[2px] h-[6px] bg-white rounded-r" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="absolute top-12 left-0 right-0 bottom-8 bg-slate-50 overflow-y-auto scrollbar-hide">
          {children}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-600 rounded-full" />
      </div>
    </div>
  );
}
