"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useAnimationFrame,
} from "framer-motion";

interface InfiniteGridProps {
  className?: string;
  children?: React.ReactNode;
  glowColor?: string;
  speed?: number;
  gridSize?: number;
}

export function InfiniteGrid({
  className,
  children,
  glowColor = "var(--primary)",
  speed = 0.3,
  gridSize = 40,
}: InfiniteGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  useAnimationFrame(() => {
    gridOffsetX.set((gridOffsetX.get() + speed) % gridSize);
    gridOffsetY.set((gridOffsetY.get() + speed) % gridSize);
  });

  const maskImage = useMotionTemplate`radial-gradient(250px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn("relative overflow-hidden", className)}
    >
      <div className="absolute inset-0 z-0 opacity-[0.04]">
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
      </div>
      <motion.div
        className="absolute inset-0 z-0 opacity-30"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
      </motion.div>

      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className="absolute right-[-15%] top-[-15%] w-[35%] h-[35%] rounded-full blur-[100px] opacity-20"
          style={{ background: glowColor }}
        />
        <div
          className="absolute left-[-10%] bottom-[-15%] w-[30%] h-[30%] rounded-full blur-[100px] opacity-15"
          style={{ background: glowColor }}
        />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}

function GridPattern({
  offsetX,
  offsetY,
  size,
}: {
  offsetX: ReturnType<typeof useMotionValue<number>>;
  offsetY: ReturnType<typeof useMotionValue<number>>;
  size: number;
}) {
  return (
    <svg className="w-full h-full">
      <defs>
        <motion.pattern
          id="infinite-grid-pattern"
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d={`M ${size} 0 L 0 0 0 ${size}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-primary/60"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#infinite-grid-pattern)" />
    </svg>
  );
}
