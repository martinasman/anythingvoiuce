'use client'

import { useState } from 'react'

interface PromptEditorProps {
  businessId: string
  initialPrompt: string
  onSave?: (prompt: string) => void
}

export function PromptEditor({ businessId, initialPrompt, onSave }: PromptEditorProps) {
  const [prompt, setPrompt] = useState(initialPrompt)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/business/${businessId}/prompt`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      setSuccess(true)
      onSave?.(prompt)

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prompt')
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = prompt !== initialPrompt

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Systemprompt för AI-receptionisten
        </label>
        <p className="text-sm text-zinc-500 mb-4">
          Detta är instruktionerna som styr hur din AI-receptionist beter sig och svarar på samtal.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={15}
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm resize-y"
          placeholder="Skriv instruktioner för din AI-receptionist..."
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          {success && (
            <p className="text-green-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Sparat!
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {hasChanges && (
            <button
              onClick={() => setPrompt(initialPrompt)}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
            >
              Återställ
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isSaving ? 'Sparar...' : 'Spara ändringar'}
          </button>
        </div>
      </div>
    </div>
  )
}
