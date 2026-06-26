// The right panel on the auth page — contains the Clerk sign-in button
import { useClerk } from "@clerk/react";
import { Button } from "@heroui/react";
import { AuthCardShell } from "./AuthCardShell";

const AFTER_AUTH = "/";

export function AuthActionPanel() {
  const clerk = useClerk();

  return (
    <section className="flex flex-1 items-center justify-center px-6 py-12">
      <AuthCardShell>
        {/* Title */}
        <div className="mb-8 text-center">
          <p className="text-2xl font-bold text-white">Welcome back</p>
          <p className="mt-1 text-sm text-zinc-400">Sign in to continue to SocketSphere</p>
        </div>

        {/* Clerk sign-in button */}
        <Button
          fullWidth
          size="lg"
          className="rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-500"
          onPress={() =>
            clerk.openSignIn({
              fallbackRedirectUrl: AFTER_AUTH,
              forceRedirectUrl: AFTER_AUTH,
            })
          }
        >
          Continue →
        </Button>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Protected · TLS encrypted
        </p>
      </AuthCardShell>
    </section>
  );
}
