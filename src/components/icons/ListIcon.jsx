"use client";

import { motion, useAnimation } from "framer-motion";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

const ListIcon = forwardRef(
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

    const variants = {
      normal: { scaleX: 1, originX: 0 },
      animate: (custom) => ({
        scaleX: [1, 0, 1],
        transition: {
          duration: 0.5,
          delay: custom * 0.1,
        },
      }),
    };

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
          <motion.line
            x1="8"
            y1="6"
            x2="21"
            y2="6"
            variants={variants}
            animate={controls}
            custom={0}
          />
          <motion.line
            x1="8"
            y1="12"
            x2="21"
            y2="12"
            variants={variants}
            animate={controls}
            custom={1}
          />
          <motion.line
            x1="8"
            y1="18"
            x2="21"
            y2="18"
            variants={variants}
            animate={controls}
            custom={2}
          />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </div>
    );
  }
);

ListIcon.displayName = "ListIcon";

export { ListIcon };
