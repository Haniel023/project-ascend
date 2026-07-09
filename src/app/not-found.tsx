import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <Compass className="size-8 text-amber-400" />
      <h1 className="text-xl font-bold">Uncharted territory</h1>
      <p className="text-sm text-muted-foreground">This page doesn&apos;t exist, or you don&apos;t have access to it.</p>
      <Button asChild>
        <Link href="/dashboard">Back to safety</Link>
      </Button>
    </div>
  );
}
