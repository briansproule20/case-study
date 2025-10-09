export default function QuizzesPage() {
  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col p-6">
      <div className="flex h-full min-h-0 flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
          <p className="text-muted-foreground mt-2">
            Test your legal knowledge with interactive quizzes and practice exams.
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Coming Soon</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              Interactive quizzes and practice exams are coming soon. Perfect for bar exam prep and legal knowledge testing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
