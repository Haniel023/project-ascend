"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <AlertTriangle className="size-8 text-amber-400" />
      <h1 className="text-xl font-bold">Something went sideways</h1>
      <p className="text-sm text-muted-foreground">
        A wild error appeared. Your progress up to your last save is safe -- try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
