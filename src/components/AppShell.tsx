import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, ClipboardList, Dumbbell, FolderOpen, Home, Menu, PlusCircle, Settings, Swords, Target, Users } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useI18n, type Lang, type Key } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const NAV: { to: string; key: Key; icon: typeof Home }[] = [
  { to: "/", key: "home", icon: Home },
  { to: "/editor", key: "newTactic", icon: PlusCircle },
  { to: "/tactics", key: "saved", icon: FolderOpen },
  { to: "/teams", key: "teams", icon: Users },
  { to: "/simulator", key: "simulator", icon: Swords },
  { to: "/set-pieces", key: "setPieces", icon: Target },
  { to: "/training", key: "training", icon: Dumbbell },
  { to: "/plans", key: "plans", icon: ClipboardList },
  { to: "/library", key: "library", icon: BookOpen },
  { to: "/settings", key: "settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(true);
  const current = NAV.find((n) => n.to === path) ?? NAV[0]!;
  return (
    <div className="flex min-h-screen bg-background bg-stadium font-sans text-foreground">
      <aside className={cn("sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar/90 transition-all md:flex", open ? "w-60" : "w-16")}>
        <div className="flex h-16 items-center gap-2 px-4">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground">⚽</div>
          {open && <span className="text-sm font-extrabold leading-tight tracking-wide">FOOTBALL<br /><span className="text-primary">TACTICAL STUDIO</span></span>}
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground", path === n.to && "bg-sidebar-accent text-primary")}>
              <n.icon className="h-4 w-4 shrink-0" />{open && t(n.key)}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
          <button aria-label="Menu" onClick={() => setOpen(!open)} className="hidden rounded-md p-2 hover:bg-secondary md:block"><Menu className="h-5 w-5" /></button>
          <h1 className="text-lg font-bold">{t(current.key)}</h1>
          <div className="ml-auto flex items-center gap-1 rounded-md border border-border p-1">
            {(["uz", "ru", "en"] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={cn("rounded px-2 py-1 text-xs font-bold uppercase", lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{l}</button>
            ))}
          </div>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-border p-2 md:hidden">
          {NAV.map((n) => <Link key={n.to} to={n.to} className={cn("flex items-center gap-1 whitespace-nowrap rounded px-2 py-1 text-xs", path === n.to ? "bg-secondary text-primary" : "text-muted-foreground")}><n.icon className="h-3 w-3" />{t(n.key)}</Link>)}
        </nav>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
