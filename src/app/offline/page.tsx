export default function OfflinePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-sm font-medium tracking-wide text-amber-500 uppercase">
        Connection lost
      </p>
      <h1 className="text-2xl font-bold">You&apos;ve wandered out of signal range</h1>
      <p className="max-w-sm text-muted-foreground">
        Project Ascend needs a connection to sync your quests and XP. Reconnect and
        try again — your progress so far is safe.
      </p>
    </main>
  );
}
