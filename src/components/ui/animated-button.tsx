'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    | 'onDrag'
    | 'onDragStart'
    | 'onDragEnd'
    | 'onDragEnter'
    | 'onDragLeave'
    | 'onDragOver'
    | 'onDrop'
    | 'onAnimationStart'
    | 'onAnimationEnd'
    | 'onAnimationIteration'
  > {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  animation?: 'hover' | 'pulse' | 'none';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  gradient?: boolean;
  floating?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Refined button animations with better timing
const buttonVariants: Record<string, Variants> = {
  hover: {
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.15,
        ease: 'easeOut',
      },
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1,
        ease: 'easeIn',
      },
    },
  },
  pulse: {
    animate: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  none: {},
};

// Improved base styles with better dark mode support
const baseStyles = {
  default:
    'bg-background text-foreground border border-border transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
  primary:
    'bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80',
  secondary:
    'bg-secondary text-secondary-foreground transition-all duration-200 hover:bg-secondary/80 focus:bg-secondary/80 active:bg-secondary/70',
  outline:
    'border border-input bg-background transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground active:bg-accent/80',
  ghost:
    'transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground active:bg-accent/80',
  destructive:
    'bg-destructive text-destructive-foreground transition-all duration-200 hover:bg-destructive/90 focus:bg-destructive/90 active:bg-destructive/80',
};

const sizeStyles = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 py-2',
  lg: 'h-12 px-6 text-lg',
};

// Improved gradient styles with better dark mode support
const gradientStyles = {
  default:
    'bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-200 hover:from-blue-600 hover:to-purple-700 focus:from-blue-600 focus:to-purple-700 active:from-blue-700 active:to-purple-800',
  primary:
    'bg-gradient-to-r from-primary to-primary/80 transition-all duration-200 hover:from-primary/90 hover:to-primary focus:from-primary/90 focus:to-primary active:from-primary/80 active:to-primary/90',
  secondary:
    'bg-gradient-to-r from-secondary to-secondary/80 transition-all duration-200 hover:from-secondary/90 hover:to-secondary focus:from-secondary/90 focus:to-secondary active:from-secondary/80 active:to-secondary/90',
};

export function AnimatedButton({
  children,
  variant = 'default',
  size = 'md',
  animation = 'hover',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  gradient = false,
  floating = false,
  className,
  disabled,
  onClick,
  type = 'button',
  ...props
}: AnimatedButtonProps) {
  const isDisabled = disabled || loading;

  const buttonClass = cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
    sizeStyles[size],
    gradient
      ? gradientStyles[variant as keyof typeof gradientStyles] ||
          gradientStyles.default
      : baseStyles[variant],
    fullWidth && 'w-full',
    floating && 'shadow-lg hover:shadow-xl',
    // Ensure proper text color for gradients
    gradient && 'text-white',
    className
  );

  const animationVariant = buttonVariants[animation];

  return (
    <motion.button
      className={buttonClass}
      variants={animationVariant}
      whileHover={isDisabled ? undefined : 'hover'}
      whileTap={isDisabled ? undefined : 'tap'}
      animate={animation === 'pulse' ? 'pulse' : undefined}
      disabled={isDisabled}
      onClick={onClick}
      type={type}
      {...props}
    >
      {loading && (
        <motion.div
          className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2 flex-shrink-0">{icon}</span>
      )}

      <span className={cn(loading && 'opacity-0', 'flex-shrink-0')}>
        {children}
      </span>

      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2 flex-shrink-0">{icon}</span>
      )}
    </motion.button>
  );
}

// Specialized button components
export function PrimaryButton(props: Omit<AnimatedButtonProps, 'variant'>) {
  return <AnimatedButton variant="primary" {...props} />;
}

export function SecondaryButton(props: Omit<AnimatedButtonProps, 'variant'>) {
  return <AnimatedButton variant="secondary" {...props} />;
}

export function OutlineButton(props: Omit<AnimatedButtonProps, 'variant'>) {
  return <AnimatedButton variant="outline" {...props} />;
}

export function GhostButton(props: Omit<AnimatedButtonProps, 'variant'>) {
  return <AnimatedButton variant="ghost" {...props} />;
}

export function DestructiveButton(props: Omit<AnimatedButtonProps, 'variant'>) {
  return <AnimatedButton variant="destructive" {...props} />;
}

export function GradientButton(
  props: Omit<AnimatedButtonProps, 'variant' | 'gradient'>
) {
  return <AnimatedButton variant="primary" gradient {...props} />;
}

export function FloatingButton(props: Omit<AnimatedButtonProps, 'floating'>) {
  return <AnimatedButton floating {...props} />;
}
