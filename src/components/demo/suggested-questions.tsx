interface SuggestedQuestionsProps {
  questions: string[]
}

export function SuggestedQuestions({ questions }: SuggestedQuestionsProps) {
  return (
    <div className="space-y-3 max-w-md">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">
        Prova att fråga om
      </h3>
      <div className="flex flex-wrap justify-center gap-2">
        {questions.map((question, index) => (
          <span
            key={index}
            className="px-4 py-2 bg-zinc-800/50 text-zinc-300 text-sm rounded-full border border-zinc-700/50 hover:border-zinc-600 transition-colors"
          >
            &ldquo;{question}&rdquo;
          </span>
        ))}
      </div>
    </div>
  )
}
