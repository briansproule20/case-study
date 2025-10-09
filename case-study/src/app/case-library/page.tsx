export default function CaseLibraryPage() {
  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col p-6">
      <div className="flex h-full min-h-0 flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Case Library</h1>
          <p className="text-muted-foreground mt-2">
            Browse and study legal cases organized by topic and jurisdiction.
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Coming Soon</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              The case library feature is under development. Check back soon for an organized collection of legal cases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
