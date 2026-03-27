import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { WeeklyActivity } from '../types'

interface Props {
  data: WeeklyActivity[]
}

export default function StatsChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
  }))

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
      {data.every((d) => d.sessions === 0) ? (
        <p className="text-gray-500 text-center py-8">No activity this week yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" allowDecimals={false} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
            <Tooltip />
            <Bar yAxisId="left" dataKey="sessions" fill="#3b82f6" name="Sessions" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="avg_score" fill="#10b981" name="Avg Score %" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
