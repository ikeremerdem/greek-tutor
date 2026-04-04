import { useEffect, useState } from 'react'
import type { TutorPreferences } from '../types'
import { getPreferences, updatePreferences } from '../api/client'
import { useTutor } from '../context/TutorContext'

export default function PreferencesPage() {
  const { tutorId, targetLanguage } = useTutor()
  const [prefs, setPrefs] = useState<TutorPreferences>({ allow_small_errors: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getPreferences(tutorId)
      .then(setPrefs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tutorId])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const updated = await updatePreferences(tutorId, prefs)
      setPrefs(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch { /* ignore */ } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-gray-400 py-12 text-center">Loading…</div>

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-filos-primary font-headline mb-1">Preferences</h1>
      <p className="text-sm text-gray-400 mb-8">{targetLanguage} tutor settings</p>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Allow small errors */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-gray-800">Allow small errors</p>
            <p className="text-sm text-gray-400 mt-0.5">
              A single wrong letter is counted as correct. The correct answer is still shown so you can learn from it.
            </p>
          </div>
          <button
            onClick={() => setPrefs((p) => ({ ...p, allow_small_errors: !p.allow_small_errors }))}
            className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ${
              prefs.allow_small_errors ? 'bg-filos-primary' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                prefs.allow_small_errors ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-filos-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-filos-primary-dark transition disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
        </div>
      </div>
    </div>
  )
}
