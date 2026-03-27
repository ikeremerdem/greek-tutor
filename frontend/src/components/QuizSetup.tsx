import { useState } from 'react'
import type { SourceLanguage } from '../types'

interface Props {
  title: string
  onStart: (sourceLang: SourceLanguage, numQuestions: number) => void
  loading: boolean
  error: string | null
}

export default function QuizSetup({ title, onStart, loading, error }: Props) {
  const [sourceLang, setSourceLang] = useState<SourceLanguage>('english')
  const [numQuestions, setNumQuestions] = useState(10)

  return (
    <div className="bg-white rounded-lg shadow p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Show me the word in</label>
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value as SourceLanguage)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="english">English (translate to Greek)</option>
            <option value="greek">Greek (translate to English)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Number of questions</label>
          <input
            type="number"
            min={1}
            max={50}
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          onClick={() => onStart(sourceLang, numQuestions)}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Starting...' : 'Start Quiz'}
        </button>
      </div>
    </div>
  )
}
