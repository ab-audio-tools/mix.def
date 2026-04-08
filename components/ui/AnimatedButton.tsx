import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'glass' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function AnimatedButton({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  ...props
}: AnimatedButtonProps) {
  const baseClasses =
    'font-semibold transition-all duration-300 flex items-center justify-center gap-2 rounded-lg';

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-dark-950 shadow-lg hover:shadow-primary-500/50 hover:scale-105 active:scale-95',
    secondary: 'bg-dark-800 hover:bg-dark-700 text-dark-50 hover:text-primary-400',
    glass: 'glass-button hover:glass-heavy text-dark-50',
    outline:
      'border-2 border-rose-500 text-rose-500 hover:bg-rose-500/10 hover:border-rose-400',
    danger:
      'bg-red-500/80 hover:bg-red-600 text-dark-50 hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-500/30',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}

export default AnimatedButton;
