'use client';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { type ReactNode } from 'react';

export function FadeIn({ children, delay = 0, ...props }: { children: ReactNode; delay?: number } & HTMLMotionProps<'div'>) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }} {...props}>
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, ...props }: { children: ReactNode } & HTMLMotionProps<'div'>) {
  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} {...props}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: { children: ReactNode } & HTMLMotionProps<'div'>) {
  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} 
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ScaleOnHover({ children, ...props }: { children: ReactNode } & HTMLMotionProps<'div'>) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} {...props}>
      {children}
    </motion.div>
  );
}
