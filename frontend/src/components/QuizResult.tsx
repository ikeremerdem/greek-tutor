import type { QuizAnswerResult } from '../types'

interface Props {
  result: QuizAnswerResult
  onNext: () => void
}

export default function QuizResult({ result, onNext }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-8 max-w-lg mx-auto text-center">
      <div
        className={`text-6xl mb-4 ${result.correct ? 'text-green-500' : 'text-red-500'}`}
      >
        {result.correct ? '✓' : '✗'}
      </div>
      <h3 className={`text-2xl font-bold mb-4 ${result.correct ? 'text-green-700' : 'text-red-700'}`}>
        {result.correct ? 'Correct!' : 'Incorrect'}
      </h3>
      <div className="mb-4 space-y-1">
        {!result.correct && (
          <p className="text-gray-600">Your answer: <span className="font-medium">{result.your_answer}</span></p>
        )}
        <p className="text-gray-600">
          {result.correct ? 'Answer' : 'Correct answer'}: <span className="font-bold text-green-700">{result.correct_answer}</span>
        </p>
        {result.notes && (
          <p className="text-gray-500 text-sm italic mt-1">{result.notes}</p>
        )}
      </div>
      {result.explanation && (
        <p className="text-gray-500 text-sm mb-4">{result.explanation}</p>
      )}
      <button
        onClick={onNext}
        className="bg-blue-600 text-white px-8 py-3 rounded font-medium hover:bg-blue-700"
      >
        Next
      </button>
    </div>
  )
}
