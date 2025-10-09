export default function IssueSpottingPage() {
  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col p-6">
      <div className="flex h-full min-h-0 flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Issue Spotting</h1>
          <p className="text-muted-foreground mt-2">
            Practice identifying legal issues in hypothetical scenarios and case studies.
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Coming Soon</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              Issue spotting exercises and scenario-based legal analysis tools are in development. Train your legal reasoning skills.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
