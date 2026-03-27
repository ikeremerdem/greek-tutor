import { useState } from 'react'
import type { QuizQuestion } from '../types'

interface Props {
  question: QuizQuestion
  onAnswer: (answer: string) => void
  loading: boolean
}

export default function QuizCard({ question, onAnswer, loading }: Props) {
  const [answer, setAnswer] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim()) return
    onAnswer(answer)
    setAnswer('')
  }

  const targetLang = question.source_language === 'english' ? 'Greek' : 'English'

  return (
    <div className="bg-white rounded-lg shadow p-8 max-w-lg mx-auto">
      <div className="text-sm text-gray-500 mb-2">
        Question {question.question_number} of {question.total_questions}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${(question.question_number / question.total_questions) * 100}%` }}
        />
      </div>
      <p className="text-lg mb-2">Translate to <strong>{targetLang}</strong>:</p>
      <p className="text-3xl font-bold text-center py-6">{question.prompt}</p>
      <form onSubmit={handleSubmit}>
        <input
          autoFocus
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full border-2 rounded-lg px-4 py-3 text-lg mb-4 focus:border-blue-500 focus:outline-none"
          placeholder={`Type in ${targetLang}...`}
        />
        <button
          type="submit"
          disabled={loading || !answer.trim()}
          className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          Submit
        </button>
      </form>
    </div>
  )
}
