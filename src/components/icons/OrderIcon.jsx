"use client";

import { motion, useAnimation } from "framer-motion";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

const OrderIcon = forwardRef(
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
            d="m3 16 4 4 4-4"
            animate={controls}
            variants={{
              normal: { y: 0 },
              animate: { y: [0, 2, 0], transition: { duration: 0.5, repeat: Infinity } },
            }}
          />
          <path d="M7 20V4" />
          <motion.path
            d="m21 8-4-4-4 4"
            animate={controls}
            variants={{
              normal: { y: 0 },
              animate: { y: [0, -2, 0], transition: { duration: 0.5, repeat: Infinity } },
            }}
          />
          <path d="M17 4v16" />
        </svg>
      </div>
    );
  }
);

OrderIcon.displayName = "OrderIcon";

export { OrderIcon };
