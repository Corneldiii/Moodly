'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function MoodGraph({ sessions }: { sessions: any[] }) {
  const data = [...sessions].reverse().map(s => ({
    day: new Date(s.created_at).toLocaleDateString('id-ID', { weekday: 'short' }),
    valence: parseFloat(s.valence?.toFixed(2)),
  }))

  return (
    <ResponsiveContainer width="100%" height={100}>
      <LineChart data={data}>
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <YAxis domain={[-1, 1]} hide />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
          formatter={(v: any) => [v > 0 ? `+${v}` : v, 'Valence']}
        />
        <ReferenceLine y={0} stroke="#E5E7EB" strokeDasharray="3 3" />
        <Line
          type="monotone" dataKey="valence"
          stroke="#7C3AED" strokeWidth={2}
          dot={{ fill: '#7C3AED', r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}