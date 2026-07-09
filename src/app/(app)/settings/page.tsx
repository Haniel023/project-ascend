import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { requireOnboardedProfile } from "@/server/auth/dal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChangePasswordForm } from "./change-password-form";
import { TimezoneForm } from "./timezone-form";
import { DeleteAccountDialog } from "./delete-account-dialog";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ passwordChanged?: string }>;
}) {
  const { session, profile } = await requireOnboardedProfile();
  const { passwordChanged } = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <Link href="/profile" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-zinc-200">
        <ArrowLeft className="size-4" /> Back to profile
      </Link>

      <h1 className="mt-3 text-2xl font-bold">Settings</h1>

      {passwordChanged && (
        <Card className="mt-4 border-emerald-400/40 bg-emerald-400/10">
          <CardContent className="py-3 text-sm text-emerald-200">
            Password changed. Other devices you're logged into will be signed out.
          </CardContent>
        </Card>
      )}

      <Card className="mt-6 border-zinc-800 bg-zinc-900">
        <CardContent className="py-4">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">Account</h2>
          <p className="mt-1 text-sm text-zinc-300">{session.user.email}</p>
          <div className="mt-4">
            <ChangePasswordForm />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 border-zinc-800 bg-zinc-900">
        <CardContent className="py-4">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">Preferences</h2>
          <div className="mt-4">
            <TimezoneForm currentTimezone={profile.timezone} />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 border-zinc-800 bg-zinc-900">
        <CardContent className="py-4">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">Your Data</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Download everything Project Ascend has stored about you as JSON.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <a href="/api/export" download>
              <Download className="size-4" /> Export my data
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-4 border-red-900/50 bg-red-950/20">
        <CardContent className="py-4">
          <h2 className="text-sm font-semibold tracking-wide text-red-400 uppercase">Danger Zone</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          <div className="mt-3">
            <DeleteAccountDialog accountEmail={session.user.email ?? ""} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
