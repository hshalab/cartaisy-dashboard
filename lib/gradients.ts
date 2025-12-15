export const gradients = {
  // Primary gradients
  primary: 'bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600',
  primaryHover: 'bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500',

  // Hero & backgrounds
  hero: 'bg-gradient-to-br from-black via-slate-900 to-black',
  heroAccent: 'bg-gradient-to-br from-purple-950/50 via-transparent to-violet-950/50',

  // Cards & containers
  card: 'bg-gradient-to-br from-white/5 to-white/[0.02]',
  cardHover: 'bg-gradient-to-br from-white/10 to-white/5',

  // Text gradients
  text: 'bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent',
  textWhite: 'bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent',
  textShimmer: 'bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400 bg-[length:200%_auto] animate-text-shimmer bg-clip-text text-transparent',

  // Borders
  border: 'bg-gradient-to-r from-purple-500/50 via-violet-500/50 to-fuchsia-500/50',
  borderGlow: 'bg-gradient-to-r from-purple-500/30 via-violet-500/30 to-fuchsia-500/30',

  // Feature card gradients
  feature1: 'from-purple-500 to-violet-600',
  feature2: 'from-violet-500 to-fuchsia-600',
  feature3: 'from-fuchsia-500 to-pink-600',
  feature4: 'from-pink-500 to-rose-600',
  feature5: 'from-blue-500 to-cyan-600',
  feature6: 'from-emerald-500 to-teal-600',

  // Glow effects
  glowPurple: 'shadow-[0_0_60px_rgba(168,85,247,0.3)]',
  glowViolet: 'shadow-[0_0_60px_rgba(139,92,246,0.3)]',
  glowFuchsia: 'shadow-[0_0_60px_rgba(217,70,239,0.3)]',
};

export const glassStyles = {
  card: 'backdrop-blur-xl bg-white/[0.03] border border-white/[0.05]',
  cardHover: 'hover:bg-white/[0.06] hover:border-white/[0.1]',
  button: 'backdrop-blur-xl bg-white/10 border border-white/20',
  nav: 'backdrop-blur-2xl bg-black/60 border-b border-white/5',
};
