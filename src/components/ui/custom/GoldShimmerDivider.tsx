"use client";
export function GoldShimmerDivider({ className }: { className?: string }) {
  return (
    <div
      className={`h-[1px] w-full ${className || ''}`}
      style={{
        background: 'linear-gradient(90deg, transparent, #c5a059, transparent)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 3s linear infinite',
      }}
    />
  );
}

