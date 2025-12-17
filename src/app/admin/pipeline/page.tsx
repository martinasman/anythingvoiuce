'use client'

import { useState } from 'react'

function normalizeUrl(url: string): string {
  url = url.trim()
  if (!url) return url
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}

interface PipelineResult {
  url: string
  success: boolean
  businessId?: string
  slug?: string
  previewUrl?: string
  error?: string
  processingTimeMs?: number
}

interface PipelineResponse {
  success: boolean
  totalProcessed?: number
  successCount?: number
  failureCount?: number
  processingTimeMs?: number
  results?: PipelineResult[]
  businessId?: string
  previewUrl?: string
  error?: string
}

export default function PipelinePage() {
  const [mode, setMode] = useState<'single' | 'batch'>('single')
  const [singleUrl, setSingleUrl] = useState('')
  const [batchUrls, setBatchUrls] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<PipelineResult[]>([])
  const [stats, setStats] = useState<{ total: number; success: number; failed: number; time: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSingleSubmit = async () => {
    if (!singleUrl.trim()) return

    setIsProcessing(true)
    setError(null)
    setResults([])
    setStats(null)

    const normalizedUrl = normalizeUrl(singleUrl)

    try {
      const response = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl }),
      })

      const data: PipelineResponse = await response.json()

      if (data.success && data.previewUrl) {
        setResults([{
          url: normalizedUrl,
          success: true,
          businessId: data.businessId,
          previewUrl: data.previewUrl,
          processingTimeMs: data.processingTimeMs,
        }])
        setSingleUrl('')
      } else {
        setError(data.error || 'Pipeline failed')
      }
    } catch (err) {
      console.error('Pipeline error:', err)
      setError('Failed to process URL')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBatchSubmit = async () => {
    const urlList = batchUrls
      .split('\n')
      .map((url) => normalizeUrl(url))
      .filter((url) => url.length > 0)

    if (urlList.length === 0) return

    setIsProcessing(true)
    setError(null)
    setResults([])
    setStats(null)

    try {
      const response = await fetch('/api/pipeline/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlList }),
      })

      const data: PipelineResponse = await response.json()

      if (data.results) {
        setResults(data.results)
        setStats({
          total: data.totalProcessed || 0,
          success: data.successCount || 0,
          failed: data.failureCount || 0,
          time: data.processingTimeMs || 0,
        })
        setBatchUrls('')
      } else {
        setError(data.error || 'Batch processing failed')
      }
    } catch (err) {
      console.error('Pipeline error:', err)
      setError('Failed to process URLs')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Pipeline</h1>
        <p className="text-zinc-400 mt-1">
          Processa företag från URL:er
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('single')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'single'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          Enkel URL
        </button>
        <button
          onClick={() => setMode('batch')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'batch'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          Batch
        </button>
      </div>

      {/* Input Section */}
      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        {mode === 'single' ? (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-zinc-400">Företagets URL</span>
              <input
                type="url"
                value={singleUrl}
                onChange={(e) => setSingleUrl(e.target.value)}
                placeholder="example.se"
                className="mt-1 w-full px-4 py-3 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:border-blue-500 focus:outline-none"
              />
            </label>
            <button
              onClick={handleSingleSubmit}
              disabled={isProcessing || !singleUrl.trim()}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processar...' : 'Kör Pipeline'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-zinc-400">URL:er (en per rad)</span>
              <textarea
                value={batchUrls}
                onChange={(e) => setBatchUrls(e.target.value)}
                placeholder="example1.se&#10;example2.se&#10;example3.se"
                rows={8}
                className="mt-1 w-full px-4 py-3 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
              />
            </label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">
                {batchUrls.split('\n').filter((u) => u.trim()).length} URL:er
              </span>
              <button
                onClick={handleBatchSubmit}
                disabled={isProcessing || !batchUrls.trim()}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Processar...' : 'Starta Batch Pipeline'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <p className="text-zinc-500 text-sm">Totalt</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <p className="text-zinc-500 text-sm">Lyckades</p>
            <p className="text-2xl font-bold text-green-400">{stats.success}</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <p className="text-zinc-500 text-sm">Misslyckades</p>
            <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <p className="text-zinc-500 text-sm">Tid</p>
            <p className="text-2xl font-bold text-white">{(stats.time / 1000).toFixed(1)}s</p>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <h2 className="text-lg font-semibold text-white mb-4">Resultat</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-900/20 border-green-500/30'
                    : 'bg-red-900/20 border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 truncate">{result.url}</p>
                    {result.error && (
                      <p className="text-xs text-red-400 mt-1">{result.error}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {result.processingTimeMs && (
                      <span className="text-xs text-zinc-500">
                        {(result.processingTimeMs / 1000).toFixed(1)}s
                      </span>
                    )}
                    {result.success ? (
                      <span className="text-xs font-medium text-green-400">OK</span>
                    ) : (
                      <span className="text-xs font-medium text-red-400">FEL</span>
                    )}
                  </div>
                </div>
                {result.previewUrl && (
                  <a
                    href={result.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    {result.previewUrl}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
