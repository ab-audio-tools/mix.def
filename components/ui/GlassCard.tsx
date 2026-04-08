import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
  interactive?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className = '',
  intensity = 'medium',
  interactive = true,
  onClick,
}: GlassCardProps) {
  const intensityClass = {
    light: 'glass-light',
    medium: 'glass-medium',
    heavy: 'glass-heavy',
  }[intensity];

  return (
    <div
      onClick={onClick}
      className={`
        ${intensityClass}
        rounded-xl
        transition-all duration-300
        ${interactive ? 'hover:backdrop-blur-lg cursor-pointer transform hover:scale-105' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default GlassCard;
