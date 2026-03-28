import type { QuizAnswerResult } from '../types'

interface Props {
  result: QuizAnswerResult
  question?: string
  onNext: () => void
}

export default function QuizResult({ result, question, onNext }: Props) {
  const isCorrect = result.correct

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-lg mx-auto text-center">
      <div className={`w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-4xl font-bold ${
        isCorrect ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'
      }`}>
        {isCorrect ? '✓' : '✗'}
      </div>
      <h3 className={`text-2xl font-bold mb-5 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
        {isCorrect ? 'Correct!' : 'Incorrect'}
      </h3>

      {question && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Question</p>
          <p className="text-lg font-medium text-gray-700">{question}</p>
        </div>
      )}

      <div className={`rounded-xl p-4 mb-4 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Your answer</p>
        <p className={`text-lg font-medium ${isCorrect ? 'text-green-700' : 'text-red-600 line-through decoration-red-300'}`}>
          {result.your_answer}
        </p>
      </div>

      {!isCorrect && (
        <div className="bg-green-50 rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Correct answer</p>
          <p className="text-lg font-bold text-green-700">{result.correct_answer}</p>
        </div>
      )}

      {result.notes && (
        <p className="text-gray-500 text-sm italic mb-4">{result.notes}</p>
      )}
      {result.explanation && (
        <p className="text-gray-400 text-sm mb-5">{result.explanation}</p>
      )}

      <button
        onClick={onNext}
        className="bg-greek-blue text-white px-10 py-3 rounded-xl font-semibold hover:bg-greek-blue-dark transition shadow-sm"
      >
        Next
      </button>
    </div>
  )
}
