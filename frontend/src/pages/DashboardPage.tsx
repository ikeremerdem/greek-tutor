import { useEffect, useState } from 'react'
import type { DashboardStats } from '../types'
import { getDashboard } from '../api/client'
import StatsChart from '../components/StatsChart'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    getDashboard().then(setStats)
  }, [])

  if (!stats) {
    return <p className="text-center text-gray-500 py-8">Loading...</p>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Words" value={stats.total_words} />
        <StatCard label="Quiz Sessions" value={stats.total_sessions} />
        <StatCard label="Average Score" value={`${stats.average_score}%`} />
        <StatCard label="Best Score" value={`${stats.best_score}%`} />
      </div>
      <StatsChart data={stats.weekly_activity} />
      {stats.recent_sessions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
          <div className="space-y-2">
            {stats.recent_sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded mr-2">
                    {s.quiz_type}
                  </span>
                  <span className="text-sm text-gray-600">
                    {s.correct_answers}/{s.total_questions} correct
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${s.score_percent >= 80 ? 'text-green-600' : s.score_percent >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {s.score_percent}%
                  </span>
                  <span className="text-xs text-gray-400">
                    {s.ended_at ? new Date(s.ended_at).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
