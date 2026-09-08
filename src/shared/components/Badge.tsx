import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 
    | 'default' 
    | 'amber' 
    | 'emerald' 
    | 'rose' 
    | 'blue' 
    | 'purple' 
    | 'slate'
    // Additive non-breaking semantic variants
    | 'terracotta'
    | 'ochre'
    | 'verdigris'
    | 'ash'
    | 'sandstone';
  className?: string;
  showIndicator?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  className = '',
  showIndicator = false,
}) => {
  // Institutional, restrained archival badge styles
  const variantStyles: Record<string, string> = {
    // Default archival
    default: 'bg-ink-900/90 text-ink-300 border-ink-700/80',
    
    // Mineral Ochre (Spatial: Location Uncertain / Buffer Overlap)
    amber: 'bg-ochre-950/80 text-ochre-300 border-ochre-700/80 shadow-inner-bevel',
    ochre: 'bg-ochre-950/80 text-ochre-300 border-ochre-700/80 shadow-inner-bevel',
    
    // Mineral Verdigris (Spatial: No Concern Indicated / Cleared)
    emerald: 'bg-verdigris-950/80 text-verdigris-300 border-verdigris-700/80 shadow-inner-bevel',
    verdigris: 'bg-verdigris-950/80 text-verdigris-300 border-verdigris-700/80 shadow-inner-bevel',
    
    // Earthen Terracotta (Spatial: Potential Zone Concern / Monument Overlap)
    rose: 'bg-terracotta-950/80 text-terracotta-300 border-terracotta-700/80 shadow-inner-bevel',
    terracotta: 'bg-terracotta-950/80 text-terracotta-300 border-terracotta-700/80 shadow-inner-bevel',
    
    // Archival Ash (Spatial: Evidence Insufficient / Poor GPS / Source Unavailable)
    slate: 'bg-ash-900/80 text-ash-300 border-ash-700/80',
    ash: 'bg-ash-900/80 text-ash-300 border-ash-700/80',
    
    // Restrained Ingest / Reviewer Statuses (No neon SaaS blues or purples)
    blue: 'bg-ink-800/90 text-sandstone-200 border-ink-600/80',
    purple: 'bg-sandstone-950/80 text-sandstone-300 border-sandstone-700/80',
    sandstone: 'bg-sandstone-950/80 text-sandstone-300 border-sandstone-700/80',
  };

  const indicatorColors: Record<string, string> = {
    amber: 'bg-ochre-400',
    ochre: 'bg-ochre-400',
    emerald: 'bg-verdigris-400',
    verdigris: 'bg-verdigris-400',
    rose: 'bg-terracotta-400',
    terracotta: 'bg-terracotta-400',
    slate: 'bg-ash-400',
    ash: 'bg-ash-400',
    default: 'bg-ink-400',
    blue: 'bg-sandstone-400',
    purple: 'bg-sandstone-400',
    sandstone: 'bg-sandstone-400',
  };

  const selectedStyle = variantStyles[variant] || variantStyles.default;
  const indicatorColor = indicatorColors[variant] || indicatorColors.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-badge-label font-mono uppercase tracking-wider border transition-colors ${selectedStyle} ${className}`}
    >
      {showIndicator && (
        <span className={`w-1.5 h-1.5 rounded-[1px] shrink-0 ${indicatorColor}`} aria-hidden="true" />
      )}
      {children}
    </span>
  );
};

export default Badge;
