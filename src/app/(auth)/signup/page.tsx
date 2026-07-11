import Link from "next/link";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Create your hero</h1>
        <p className="mt-1 text-sm text-zinc-400">Begin your fitness journey and start earning XP.</p>
      </div>
      <SignupForm />
      <p className="text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-amber-400 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
