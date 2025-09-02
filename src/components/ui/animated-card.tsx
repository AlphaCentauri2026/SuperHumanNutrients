'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeInUp, scaleIn } from '@/lib/animations';

interface AnimatedCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  animation?: 'fadeIn' | 'scaleIn' | 'slideUp' | 'none';
  hover?: boolean;
  interactive?: boolean;
  delay?: number;
  duration?: number;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  image?: {
    src: string;
    alt: string;
    height?: number;
  };
  gradient?: {
    from: string;
    to: string;
    direction?:
      | 'to-r'
      | 'to-l'
      | 'to-t'
      | 'to-b'
      | 'to-tr'
      | 'to-tl'
      | 'to-br'
      | 'to-bl';
  };
}

const cardVariants = {
  fadeIn: fadeInUp,
  scaleIn,
  slideUp: fadeInUp,
  none: {},
};

const baseStyles = {
  default: 'bg-card text-card-foreground border border-border',
  elevated: 'bg-card text-card-foreground shadow-lg border-0',
  outlined: 'bg-transparent border-2 border-border',
  gradient:
    'bg-gradient-to-r from-primary/10 to-secondary/10 border border-border/50',
};

export function AnimatedCard({
  children,
  variant = 'default',
  animation = 'fadeIn',
  hover = true,
  interactive = false,
  delay = 0,
  duration = 0.6,
  className,
  header,
  footer,
  image,
  gradient,
}: AnimatedCardProps) {
  const cardClass = cn(
    'rounded-lg overflow-hidden transition-all duration-300',
    baseStyles[variant],
    interactive && 'cursor-pointer',
    hover && 'hover:shadow-xl',
    className
  );

  const animationVariant = cardVariants[animation];

  const gradientStyle = gradient
    ? {
        background: `linear-gradient(${gradient.direction || 'to-r'}, ${gradient.from}, ${gradient.to})`,
      }
    : {};

  return (
    <motion.div
      className={cardClass}
      variants={animationVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={hover ? 'hover' : undefined}
      transition={{
        duration,
        delay,
        ease: [0.6, -0.05, 0.01, 0.99],
      }}
      style={gradientStyle}
    >
      {image && (
        <div className="relative overflow-hidden">
          <motion.img
            src={image.src}
            alt={image.alt}
            className="w-full object-cover"
            style={{ height: image.height || 200 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {header && <div className="p-6 pb-0">{header}</div>}

      <div className="p-6">{children}</div>

      {footer && <div className="p-6 pt-0">{footer}</div>}
    </motion.div>
  );
}

// Specialized card components
export function ElevatedCard(props: Omit<AnimatedCardProps, 'variant'>) {
  return <AnimatedCard variant="elevated" {...props} />;
}

export function OutlinedCard(props: Omit<AnimatedCardProps, 'variant'>) {
  return <AnimatedCard variant="outlined" {...props} />;
}

export function GradientCard(props: Omit<AnimatedCardProps, 'variant'>) {
  return <AnimatedCard variant="gradient" {...props} />;
}

export function InteractiveCard(props: Omit<AnimatedCardProps, 'interactive'>) {
  return <AnimatedCard interactive {...props} />;
}

// Card with staggered children
export function StaggeredCard({
  children,
  staggerDelay = 0.1,
  ...props
}: AnimatedCardProps & { staggerDelay?: number }) {
  return (
    <AnimatedCard {...props}>
      <motion.div
        variants={{
          animate: {
            transition: {
              staggerChildren: staggerDelay,
            },
          },
        }}
        initial="initial"
        animate="animate"
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5, delay: index * staggerDelay }}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    </AnimatedCard>
  );
}
