import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { cardHover } from '../../lib/animations';

export const Card = React.forwardRef(({ 
  className, 
  padding = "p-6", 
  hoverable = false, 
  children, 
  ...props 
}, ref) => {
  const Component = hoverable ? motion.div : 'div';
  
  const motionProps = hoverable ? {
    variants: cardHover,
    initial: "rest",
    whileHover: "hover",
  } : {};

  return (
    <Component
      ref={ref}
      className={cn(
        "glass-panel rounded-xl text-slate-900 relative overflow-hidden",
        padding,
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';
