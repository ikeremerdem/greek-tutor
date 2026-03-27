import { useState } from 'react'
import type { Word, WordUpdate } from '../types'

interface Props {
  words: Word[]
  onUpdate: (id: string, data: WordUpdate) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function WordTable({ words, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<WordUpdate>({})

  const startEdit = (word: Word) => {
    setEditingId(word.id)
    setEditData({
      word_type: word.word_type,
      english: word.english,
      greek: word.greek,
      notes: word.notes,
    })
  }

  const saveEdit = async () => {
    if (!editingId) return
    await onUpdate(editingId, editData)
    setEditingId(null)
  }

  if (words.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        No words yet. Add some words above to get started!
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
            <th className="px-4 py-3 text-left text-sm font-medium">English</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Greek</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Notes</th>
            <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {words.map((word) => (
            <tr key={word.id} className="hover:bg-gray-50">
              {editingId === word.id ? (
                <>
                  <td className="px-4 py-2">
                    <select
                      value={editData.word_type}
                      onChange={(e) => setEditData({ ...editData, word_type: e.target.value as Word['word_type'] })}
                      className="border rounded px-2 py-1 text-sm w-full"
                    >
                      {['verb', 'noun', 'adjective', 'adverb', 'preposition', 'other'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={editData.english}
                      onChange={(e) => setEditData({ ...editData, english: e.target.value })}
                      className="border rounded px-2 py-1 text-sm w-full"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={editData.greek}
                      onChange={(e) => setEditData({ ...editData, greek: e.target.value })}
                      className="border rounded px-2 py-1 text-sm w-full"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      className="border rounded px-2 py-1 text-sm w-full"
                    />
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button onClick={saveEdit} className="text-green-600 text-sm font-medium">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-gray-500 text-sm">Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                      {word.word_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{word.english}</td>
                  <td className="px-4 py-3 text-sm">{word.greek}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{word.notes}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => startEdit(word)} className="text-blue-600 text-sm font-medium">Edit</button>
                    <button onClick={() => onDelete(word.id)} className="text-red-600 text-sm font-medium">Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
