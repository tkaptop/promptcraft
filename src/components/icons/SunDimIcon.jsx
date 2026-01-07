"use client";

import { motion, useAnimation } from "framer-motion";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

const PATH_VARIANTS = {
  normal: { opacity: 1 },
  animate: (i) => ({
    opacity: [0, 1],
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
};

const SunDimIcon = forwardRef(
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
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="4" />
          {[
            "M12 4h.01",
            "M20 12h.01",
            "M12 20h.01",
            "M4 12h.01",
            "M17.657 6.343h.01",
            "M17.657 17.657h.01",
            "M6.343 17.657h.01",
            "M6.343 6.343h.01",
          ].map((d, index) => (
            <motion.path
              animate={controls}
              custom={index + 1}
              d={d}
              key={d}
              variants={PATH_VARIANTS}
            />
          ))}
        </svg>
      </div>
    );
  }
);

SunDimIcon.displayName = "SunDimIcon";

export { SunDimIcon };
