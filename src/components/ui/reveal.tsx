"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ComponentProps } from "react";
import { ease, inView, reveal, stagger } from "@/lib/motion";

type RevealProps = ComponentProps<typeof motion.div> & {
  /** Stagger direct `RevealItem` children instead of revealing as one block. */
  group?: boolean;
  gap?: number;
  delay?: number;
};

/** Rises and fades its content in once it scrolls into view. Static under reduced motion. */
export function Reveal({ group, gap, delay = 0, children, ...rest }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <motion.div {...rest}>{children}</motion.div>;

  const variants: Variants = group
    ? stagger(gap, delay)
    : {
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.enter, delay } },
      };

  return (
    <motion.div initial="hidden" whileInView="show" viewport={inView} variants={variants} {...rest}>
      {children}
    </motion.div>
  );
}

/** A child of `<Reveal group>`. */
export function RevealItem(props: ComponentProps<typeof motion.div>) {
  return <motion.div variants={reveal} {...props} />;
}
