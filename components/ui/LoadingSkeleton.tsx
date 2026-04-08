import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'text' | 'circle' | 'line' | 'avatar';
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

export function LoadingSkeleton({
  type = 'card',
  width = 'w-full',
  height = 'h-10',
  count = 1,
  className = '',
}: LoadingSkeletonProps) {
  const baseClasses = 'animate-shimmer bg-gradient-to-r from-dark-800 via-dark-700 to-dark-800 rounded';

  const typeClasses = {
    card: 'aspect-square rounded-xl',
    text: 'h-4 rounded-md',
    circle: 'rounded-full',
    line: 'h-2 rounded-full',
    avatar: 'w-10 h-10 rounded-full',
  };

  const defaultHeight = {
    card: 'h-64',
    text: 'h-4',
    circle: type === 'circle' ? width : 'h-10',
    line: 'h-2',
    avatar: 'h-10',
  };

  const defaultWidth = {
    card: 'w-full',
    text: 'w-3/4',
    circle: type === 'circle' ? width : 'w-10',
    line: 'w-full',
    avatar: 'w-10',
  };

  const h = height !== 'h-10' ? height : defaultHeight[type];
  const w = width !== 'w-full' ? width : defaultWidth[type];

  return (
    <div className={className}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`
            ${baseClasses}
            ${typeClasses[type]}
            ${w}
            ${h}
            ${i > 0 ? 'mt-4' : ''}
          `}
          style={{
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
    </div>
  );
}

interface LoadingCardProps {
  count?: number;
}

export function LoadingCard({ count = 3 }: LoadingCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="glass-card rounded-xl p-4 space-y-4">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="text" width="w-4/5" />
          <LoadingSkeleton type="line" width="w-full" />
          <LoadingSkeleton type="line" width="w-2/3" />
        </div>
      ))}
    </div>
  );
}

export default LoadingSkeleton;
