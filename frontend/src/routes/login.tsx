import React, { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading, login } = useAuth();

useEffect(() => {
  if (!isLoading && user) {
    navigate({ to: "/dashboard" });
  }
}, [user, isLoading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);
              try {
                await login(email.trim(), password);
                navigate({ to: "/dashboard" });
              } catch (err: any) {
              setError(err?.message ?? "Login failed");
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-4 bg-card p-6 rounded-md shadow"
        >
          <label className="block">
            <span className="text-sm text-muted-foreground">Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-1 w-full rounded-md border px-3 py-2" />
          </label>

          <label className="block">
            <span className="text-sm text-muted-foreground">Password</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-1 w-full rounded-md border px-3 py-2" />
          </label>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <div className="flex items-center justify-between">
            <button disabled={loading} className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
