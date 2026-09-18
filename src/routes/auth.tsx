import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { store } from "@/lib/store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Staff login · VOLTA" },
      { name: "description", content: "Store team login for the VOLTA admin dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Account created");
          navigate({ to: "/admin" });
        } else {
          toast.success("Account created. Check your email to confirm, then sign in.");
          setMode("signin");
        }

      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glow-field flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm rounded-[22px] border border-line bg-surface p-6">
        <Link to="/" className="font-display text-xl tracking-wide">
          {store.name}
          <span className="text-primary">.</span>
        </Link>
        <h1 className="display-title mt-4 text-2xl">
          {mode === "signin" ? "Staff sign in" : "Create staff account"}
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          The first account created becomes the store admin.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-line bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary/60"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-line bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary/60"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-deep disabled:bg-muted disabled:text-muted-foreground"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
          className="mt-4 w-full text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
        </button>
        <Link
          to="/"
          className="mt-3 block text-center text-xs text-muted-foreground hover:text-foreground"
        >
          Back to store
        </Link>
      </div>
    </div>
  );
}
