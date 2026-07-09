"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateTimezoneAction } from "@/server/actions/settings.actions";

export function TimezoneForm({ currentTimezone }: { currentTimezone: string }) {
  const [timezone, setTimezone] = useState(currentTimezone);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const timezones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return [currentTimezone];
    }
  }, [currentTimezone]);

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateTimezoneAction({ timezone });
      if (result?.error) setError(result.error);
      else setSaved(true);
    });
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs">Timezone</Label>
      <p className="text-xs text-muted-foreground">
        Used to determine "today" for streaks, quests, and workout logging.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {timezones.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)}
        >
          Use device timezone
        </Button>
        <Button type="button" size="sm" disabled={isPending || timezone === currentTimezone} onClick={handleSave}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
      {saved && <p className="text-sm text-emerald-400">Saved.</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
