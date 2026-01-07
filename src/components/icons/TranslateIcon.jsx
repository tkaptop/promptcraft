"use client";

import { motion, useAnimation } from "framer-motion";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

const TranslateIcon = forwardRef(
  ({ onMouseEnter, onMouseLeave, className, size = 24, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleMouseEnter = useCallback(
      (e) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          controls.start("animate");
        }
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          controls.start("normal");
        }
      },
      [controls, onMouseLeave]
    );

    return (
      <div
        className={cn(
          "cursor-pointer select-none transition-colors duration-200 flex items-center justify-center",
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="m5 8 6 6"
            animate={controls}
            variants={{
              normal: { pathLength: 1, opacity: 1 },
              animate: { pathLength: [0, 1], opacity: [0, 1], transition: { duration: 0.5 } },
            }}
          />
          <motion.path
            d="m4 14 6-6 2-3"
            animate={controls}
            variants={{
              normal: { pathLength: 1, opacity: 1 },
              animate: { pathLength: [0, 1], opacity: [0, 1], transition: { duration: 0.5, delay: 0.1 } },
            }}
          />
          <motion.path
            d="M2 5h12"
            animate={controls}
            variants={{
              normal: { scaleX: 1 },
              animate: { scaleX: [0, 1], transition: { duration: 0.3 } },
            }}
          />
          <motion.path
            d="M7 2h1"
            animate={controls}
            variants={{
              normal: { opacity: 1 },
              animate: { opacity: [0, 1], transition: { duration: 0.2 } },
            }}
          />
          <motion.path
            d="m22 22-5-10-5 10"
            animate={controls}
            variants={{
              normal: { pathLength: 1 },
              animate: { pathLength: [0, 1], transition: { duration: 0.5, delay: 0.2 } },
            }}
          />
          <motion.path
            d="M14 18h6"
            animate={controls}
            variants={{
              normal: { scaleX: 1 },
              animate: { scaleX: [0, 1], transition: { duration: 0.3, delay: 0.4 } },
            }}
          />
        </svg>
      </div>
    );
  }
);

TranslateIcon.displayName = "TranslateIcon";

export { TranslateIcon };
