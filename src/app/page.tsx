import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Anything Voice</h1>
          <Link
            href="/admin/pipeline"
            className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Admin Dashboard
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <h2 className="text-5xl font-bold text-white">
            AI Voice Receptionist
          </h2>
          <p className="text-xl text-zinc-400 mt-6 leading-relaxed">
            Automatiserad cold outreach-pipeline for att salja AI-rostreceptionister till svenska SMB:s.
          </p>
          <div className="flex items-center justify-center gap-4 mt-10">
            <Link
              href="/admin/pipeline"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all"
            >
              Kor Pipeline
            </Link>
            <Link
              href="/admin/leads"
              className="px-8 py-4 bg-zinc-800 text-white font-semibold rounded-full hover:bg-zinc-700 transition-all"
            >
              Visa Leads
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-6">
        <div className="max-w-6xl mx-auto text-center text-zinc-500 text-sm">
          Anything Labs
        </div>
      </footer>
    </div>
  )
}
