'use client';
import { useId } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface Props {
  data: { timestamp: string; cpuPercent: number; memoryPercent: number; runningVms: number }[];
  hours?: number;
}

function fmt(ts: string, hours: number) {
  const d = new Date(ts);
  return hours > 24
    ? d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function UtilizationChart({ data, hours = 24 }: Props) {
  const uid = useId();
  const cpuId = `cpu-${uid}`;
  const memId = `mem-${uid}`;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={cpuId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={memId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="timestamp"
          tickFormatter={(ts) => fmt(ts, hours)}
          tick={{ fontSize: 10, fill: '#64748b' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: '#64748b' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{ background: '#1e2433', border: '1px solid #2d3a55', borderRadius: 6, fontSize: 11 }}
          labelFormatter={(ts) => fmt(String(ts), hours)}
          formatter={(v: unknown) => [`${Number(v).toFixed(1)}%`]}
        />
        <Legend iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Area type="monotone" dataKey="cpuPercent" name="Avg CPU" stroke="#6366f1" fill={`url(#${cpuId})`} strokeWidth={1.5} dot={false} />
        <Area type="monotone" dataKey="memoryPercent" name="Avg Memory" stroke="#22d3ee" fill={`url(#${memId})`} strokeWidth={1.5} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
