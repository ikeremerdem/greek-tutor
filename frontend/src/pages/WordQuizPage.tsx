import { useQuiz } from '../hooks/useQuiz'
import QuizSetup from '../components/QuizSetup'
import QuizCard from '../components/QuizCard'
import QuizResult from '../components/QuizResult'
import SessionSummary from '../components/SessionSummary'

export default function WordQuizPage() {
  const quiz = useQuiz('word')

  if (quiz.phase === 'setup') {
    return <QuizSetup title="Word Quiz" onStart={quiz.start} loading={quiz.loading} error={quiz.error} />
  }

  if (quiz.phase === 'question' && quiz.question) {
    return <QuizCard question={quiz.question} onAnswer={quiz.answer} loading={quiz.loading} />
  }

  if (quiz.phase === 'result' && quiz.result) {
    return <QuizResult result={quiz.result} onNext={quiz.next} />
  }

  if (quiz.phase === 'summary' && quiz.summary) {
    return <SessionSummary summary={quiz.summary} onRestart={quiz.reset} />
  }

  return null
}
