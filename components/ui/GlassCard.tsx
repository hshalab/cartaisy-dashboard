'use client';

import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cardHover } from '@/lib/animations';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function GlassCard({
  children,
  className = '',
  hover = true,
  glow = false,
  padding = 'md',
  ...motionProps
}: GlassCardProps) {
  return (
    <motion.div
      className={`
        backdrop-blur-xl bg-white/[0.03]
        border border-white/[0.05]
        rounded-2xl
        ${hover ? 'transition-all duration-300' : ''}
        ${glow ? 'shadow-[0_0_60px_rgba(168,85,247,0.15)]' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
      variants={hover ? cardHover : undefined}
      initial={hover ? 'rest' : undefined}
      whileHover={hover ? 'hover' : undefined}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

interface GlassCardStaticProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

// Simpler glass card without motion for server components
export function GlassCardStatic({
  children,
  className = '',
  hover = true,
  glow = false,
  padding = 'md',
}: GlassCardStaticProps) {
  return (
    <div
      className={`
        backdrop-blur-xl bg-white/[0.03]
        border border-white/[0.05]
        rounded-2xl
        ${hover ? 'hover:bg-white/[0.06] hover:border-white/[0.1] hover:-translate-y-1 transition-all duration-300' : ''}
        ${glow ? 'shadow-[0_0_60px_rgba(168,85,247,0.15)]' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
