import { useEffect, useState, useMemo } from 'react'
import type { Word, WordCreate, WordUpdate, WordType } from '../types'
import { getWords, addWord, updateWord, deleteWord } from '../api/client'
import WordForm from '../components/WordForm'
import WordTable from '../components/WordTable'

const PAGE_SIZE = 20

export default function VocabularyPage() {
  const [words, setWords] = useState<Word[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<WordType | ''>('')
  const [page, setPage] = useState(1)

  const load = async () => {
    setWords(await getWords())
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    let result = words
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (w) => w.english.toLowerCase().includes(q) || w.greek.toLowerCase().includes(q)
      )
    }
    if (typeFilter) {
      result = result.filter((w) => w.word_type === typeFilter)
    }
    return result
  }, [words, search, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [search, typeFilter])

  const handleAdd = async (data: WordCreate) => {
    await addWord(data)
    await load()
  }

  const handleUpdate = async (id: string, data: WordUpdate) => {
    await updateWord(id, data)
    await load()
  }

  const handleDelete = async (id: string) => {
    await deleteWord(id)
    await load()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Vocabulary</h2>
      <WordForm words={words} onSubmit={handleAdd} />

      <div className="flex flex-wrap items-center gap-4 mb-3">
        <div className="text-sm text-gray-500">
          {filtered.length} word{filtered.length !== 1 ? 's' : ''}
          {filtered.length !== words.length && ` (of ${words.length} total)`}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm flex-1 min-w-[200px]"
          placeholder="Search English or Greek..."
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as WordType | '')}
          className="border rounded px-3 py-1.5 text-sm"
        >
          <option value="">All types</option>
          {['verb', 'noun', 'adjective', 'adverb', 'preposition', 'other'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <WordTable words={paged} onUpdate={handleUpdate} onDelete={handleDelete} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
