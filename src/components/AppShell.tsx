import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

const links = [
  { to: "/", label: "Home" },
  { to: "/breathe", label: "Breathe" },
  { to: "/reflect", label: "Reflect" },
  { to: "/relax", label: "Relax" },
  { to: "/insights", label: "Insights" },
  { to: "/settings", label: "Settings" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background shadow-xl">
      <header className="flex items-center justify-between px-6 pt-8 pb-2">
        <button onClick={() => setOpen((o) => !o)} className="font-display text-lg font-semibold text-primary">
          {open ? "Close" : "Menu"}
        </button>
        <Link to="/" className="font-display text-lg font-semibold tracking-widest text-primary">MINDSIGHT</Link>
        <span className="w-12" />
      </header>
      {open && (
        <nav className="mx-6 mb-2 grid grid-cols-2 gap-2 rounded-2xl bg-card p-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${path === l.to ? "bg-primary text-primary-foreground" : "text-primary hover:bg-surface"}`}>
              {l.label}
            </Link>
          ))}
        </nav>
      )}
      <main className="flex-1">{children}</main>
      <footer className="pb-6 pt-4 text-center text-sm text-muted-foreground">Your data stays on your device</footer>
    </div>
  );
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="px-6 pt-4 pb-6">
      <h1 className="text-3xl font-bold text-primary">{title}</h1>
      {sub && <p className="mt-2 text-muted-foreground">{sub}</p>}
    </div>
  );
}
