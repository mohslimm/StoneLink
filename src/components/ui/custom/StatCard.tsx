"use client";
import { GlassPanel } from './GlassPanel';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string;
  sparklineData?: number[];
  index?: number;
  hasIndicator?: boolean;
}

export function StatCard({ label, value, sparklineData, index = 0, hasIndicator }: StatCardProps) {
  const data = sparklineData?.map((v, i) => ({ value: v, idx: i })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.1 + index * 0.05 }}
    >
      <GlassPanel className="p-5 min-w-[160px]">
        <p className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)]">
          {label}
        </p>
        <p className="text-[36px] font-body font-normal tracking-[-0.02em] text-[#e8e4dc] mt-1">
          {value}
          {hasIndicator && (
            <span className="inline-block w-2 h-2 rounded-full bg-[#c5a059] ml-2 align-middle" />
          )}
        </p>
        {sparklineData && (
          <div className="w-full h-8 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={`spark-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c5a059" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c5a059" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#c5a059"
                  strokeWidth={1.5}
                  fill={`url(#spark-${index})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassPanel>
    </motion.div>
  );
}

