interface SuggestedQuestionsProps {
  questions: string[]
}

export function SuggestedQuestions({ questions }: SuggestedQuestionsProps) {
  return (
    <div className="space-y-3 max-w-md">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
        Try asking about
      </h3>
      <div className="flex flex-wrap justify-center gap-2">
        {questions.map((question, index) => (
          <span
            key={index}
            className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-sm border border-slate-200 hover:border-[#BFD7EA] hover:bg-[#E1EFF9] transition-colors"
          >
            &ldquo;{question}&rdquo;
          </span>
        ))}
      </div>
    </div>
  )
}
