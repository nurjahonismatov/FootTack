import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FolderOpen, Layers, PlusCircle, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { loadAll, type Tactic } from "@/lib/tactics";
import hero from "@/assets/stadium-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Football Tactical Studio — Coaching Dashboard" }, { name: "description", content: "Build football tactics with player zones, phases and animations." }, { property: "og:title", content: "Football Tactical Studio" }, { property: "og:description", content: "Build football tactics with player zones, phases and animations." }] }),
  component: Home,
});

function Home() {
  const { t } = useI18n();
  const [list, setList] = useState<Tactic[]>([]);
  useEffect(() => setList(loadAll()), []);
  const stats = [
    { k: "tactics" as const, v: list.length, I: FolderOpen },
    { k: "players" as const, v: list.reduce((a, b) => a + b.players.length, 0), I: Users },
    { k: "phases" as const, v: list.reduce((a, b) => a + Object.keys(b.phases).length, 0), I: Layers },
  ];
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <section className="relative overflow-hidden rounded-2xl border border-border animate-rise">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="relative flex flex-col gap-4 p-8 md:p-12">
          <h2 className="max-w-lg text-3xl font-extrabold md:text-4xl">{t("welcome")}</h2>
          <p className="max-w-md text-muted-foreground">{t("welcomeSub")}</p>
          <Link to="/editor" search={{ id: undefined }} className="flex w-fit items-center gap-2 rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground shadow-glow hover:opacity-90"><PlusCircle className="h-5 w-5" />{t("quickNew")}</Link>
        </div>
      </section>
      <section className="grid gap-3 sm:grid-cols-3">
        {stats.map((s, i) => (
          <div key={s.k} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 animate-rise" style={{ animationDelay: `${i * 80}ms` }}>
            <s.I className="h-8 w-8 text-primary" /><div><div className="text-2xl font-extrabold">{s.v}</div><div className="text-sm text-muted-foreground">{t(s.k)}</div></div>
          </div>
        ))}
      </section>
      <section>
        <h3 className="mb-3 font-bold">{t("recent")}</h3>
        {list.length === 0 ? <p className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">{t("none")}</p> :
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{list.slice(0, 6).map((x) => (
            <Link key={x.id} to="/editor" search={{ id: x.id }} className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary">
              <div className="font-bold">{x.name}</div><div className="text-sm text-muted-foreground">{x.formation} · {new Date(x.updatedAt).toLocaleDateString()}</div>
            </Link>))}</div>}
      </section>
    </div>
  );
}
