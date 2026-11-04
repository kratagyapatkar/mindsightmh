import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Compass, Home, LineChart, Menu, User, X } from "lucide-react";
import { CalmingReminderNotice } from "@/components/CalmingReminderNotice";

const links = [
  { to: "/", label: "Home" },
  { to: "/breathe", label: "Breathe" },
  { to: "/reflect", label: "Reflect" },
  { to: "/relax", label: "Relax" },
  { to: "/insights", label: "Insights" },
  { to: "/settings", label: "Settings" },
] as const;

const tabs = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/explore", label: "Explore", Icon: Compass },
  { to: "/insights", label: "Insights", Icon: LineChart },
  { to: "/settings", label: "Profile", Icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background shadow-xl md:max-w-2xl lg:grid lg:max-w-none lg:grid-cols-[16rem_minmax(0,1fr)] lg:shadow-none">
      {/* Sidebar — tablet landscape and desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:border-r lg:bg-card lg:px-6 lg:py-10">
        <Link to="/" className="font-display text-xl font-semibold tracking-widest text-primary">MINDSIGHT</Link>
        <nav aria-label="Main" className="mt-10 flex flex-col gap-1">
          {tabs.map(({ to, label, Icon }) => {
            const active = path === to;
            return (
              <Link key={to} to={to} aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-primary text-primary-foreground" : "text-primary hover:bg-surface"}`}>
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </Link>
            );
          })}
        </nav>
        <p className="mt-auto text-sm text-muted-foreground">Your data stays on your device</p>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col">
        {/* Header with hamburger — phones and small tablets only */}
        <header className="flex items-center justify-between px-6 pt-8 pb-2 md:px-10 lg:hidden">
          <button onClick={() => setOpen((o) => !o)} aria-label={open ? "Close menu" : "Open menu"} className="p-1 text-primary">
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
          <Link to="/" className="font-display text-lg font-semibold tracking-widest text-primary">MINDSIGHT</Link>
          <span className="w-8" />
        </header>
        {open && (
          <nav className="mx-6 mb-2 grid grid-cols-2 gap-2 rounded-2xl bg-card p-3 md:mx-10 md:grid-cols-3 lg:hidden">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${path === l.to ? "bg-primary text-primary-foreground" : "text-primary hover:bg-surface"}`}>
                {l.label}
              </Link>
            ))}
          </nav>
        )}
        <main className="mx-auto w-full max-w-3xl flex-1 pb-24 lg:pb-10">
          <CalmingReminderNotice />{children}
        </main>
        <footer className="pb-6 pt-4 text-center text-sm text-muted-foreground lg:hidden">Your data stays on your device</footer>
      </div>

      {/* Bottom tab bar — phones and small tablets only */}
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-md border-t bg-card/95 backdrop-blur md:max-w-2xl lg:hidden">
        <div className="grid grid-cols-4">
          {tabs.map(({ to, label, Icon }) => {
            const active = path === to;
            return (
              <Link key={to} to={to} aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-3 text-xs font-semibold transition ${active ? "text-accent" : "text-muted-foreground hover:text-primary"}`}>
                <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="px-6 pt-4 pb-6 lg:pt-10">
      <h1 className="text-3xl font-bold text-primary lg:text-4xl">{title}</h1>
      {sub && <p className="mt-2 text-muted-foreground">{sub}</p>}
    </div>
  );
}
