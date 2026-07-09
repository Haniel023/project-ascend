import Link from "next/link";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <p className="text-sm font-medium tracking-[0.2em] text-amber-400 uppercase">
            Project Ascend
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-zinc-400">Continue your ascent.</p>
        </div>
        <LoginForm callbackUrl={callbackUrl} />
        <p className="text-center text-sm text-zinc-400">
          Need an account?{" "}
          <Link href="/signup" className="font-medium text-amber-400 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
