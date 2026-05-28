'use client';

import React, { useEffect, useRef, memo } from 'react';
import gsap from 'gsap';

interface CircularScoreProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const CircularScore = memo(({ score, size = 120, strokeWidth = 8 }: CircularScoreProps) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<SVGTextElement>(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    if (!circleRef.current || !textRef.current) return;

    const offset = circumference - (score / 100) * circumference;

    const ctx = gsap.context(() => {
      // Animate the stroke dashoffset
      gsap.fromTo(
        circleRef.current,
        { strokeDashoffset: circumference },
        { strokeDashoffset: offset, duration: 1.5, ease: 'power3.out' }
      );

      // Animate the number counting up
      gsap.to(textRef.current, {
        innerHTML: score,
        duration: 1.5,
        snap: { innerHTML: 1 },
        ease: 'power3.out',
      });
    });

    return () => ctx.revert();
  }, [score, circumference]);

  let color = 'var(--danger)';
  if (score >= 80) color = 'var(--success)';
  else if (score >= 50) color = 'var(--warning)';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="var(--bg-elevated)"
        strokeWidth={strokeWidth}
      />
      {/* Animated progress circle */}
      <circle
        ref={circleRef}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
      />
      {/* Score text */}
      <text
        ref={textRef}
        x="50%"
        y="50%"
        fill="var(--text-primary)"
        fontSize={size * 0.25}
        fontWeight="bold"
        fontFamily="var(--font-dm-sans)"
        textAnchor="middle"
        dominantBaseline="central"
        className="rotate-[90deg] origin-center"
      >
        0
      </text>
    </svg>
  );
});

CircularScore.displayName = 'CircularScore';
