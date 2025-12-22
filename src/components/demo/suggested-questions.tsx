interface SuggestedQuestionsProps {
  questions: string[]
}

export function SuggestedQuestions({ questions }: SuggestedQuestionsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <p className="text-center text-xs font-medium text-white/30 uppercase tracking-widest mb-6">
        Testa att fråga
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {questions.map((question, index) => (
          <span
            key={index}
            className="group px-5 py-2.5 bg-white/5 backdrop-blur-sm text-white/70 text-sm rounded-full border border-white/10 hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-white transition-all duration-200 cursor-default"
          >
            <span className="opacity-50 mr-1">&ldquo;</span>
            {question}
            <span className="opacity-50 ml-1">&rdquo;</span>
          </span>
        ))}
      </div>
    </div>
  )
}
