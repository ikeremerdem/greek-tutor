import type { QuizSummary } from '../types'

interface Props {
  summary: QuizSummary
  onRestart: () => void
}

export default function SessionSummary({ summary, onRestart }: Props) {
  const scoreColor = summary.score_percent >= 80 ? 'text-green-600' : summary.score_percent >= 50 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="bg-white rounded-lg shadow p-8 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center mb-2">Quiz Complete!</h2>
      <p className={`text-5xl font-bold text-center mb-2 ${scoreColor}`}>
        {summary.score_percent}%
      </p>
      <p className="text-center text-gray-500 mb-6">
        {summary.correct_answers} / {summary.total_questions} correct
      </p>
      <div className="space-y-2 mb-6">
        {summary.details.map((d, i) => (
          <div key={i} className={`flex items-center gap-3 p-2 rounded ${d.correct ? 'bg-green-50' : 'bg-red-50'}`}>
            <span className={d.correct ? 'text-green-600' : 'text-red-600'}>
              {d.correct ? '✓' : '✗'}
            </span>
            <span className="flex-1 text-sm">
              {d.prompt} → <span className="font-medium">{d.correct_answer}</span>
            </span>
            {!d.correct && (
              <span className="text-sm text-red-500">({d.your_answer})</span>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={onRestart}
        className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700"
      >
        Play Again
      </button>
    </div>
  )
}
