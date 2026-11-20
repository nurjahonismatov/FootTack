import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { loadAll, saveAll, uid, type Tactic } from "@/lib/tactics";

export const Route = createFileRoute("/tactics")({
  head: () => ({ meta: [{ title: "Saved Tactics — Football Tactical Studio" }, { name: "description", content: "Open, duplicate and manage your saved football tactics." }, { property: "og:title", content: "Saved Tactics — Football Tactical Studio" }, { property: "og:description", content: "Open, duplicate and manage your saved football tactics." }] }),
  component: Saved,
});

function Saved() {
  const { t } = useI18n();
  const [list, setList] = useState<Tactic[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => setList(loadAll()), []);
  const update = (l: Tactic[]) => { saveAll(l); setList(l); };
  const shown = list.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 animate-rise">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} className="h-10 rounded-md border border-input bg-card px-3 text-sm" />
      {shown.length === 0 && <p className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">{t("none")}</p>}
      {shown.map((x) => (
        <div key={x.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex-1"><div className="font-bold">{x.name}</div><div className="text-xs text-muted-foreground">{x.formation} · {t("updated")} {new Date(x.updatedAt).toLocaleString()}</div></div>
          <Link to="/editor" search={{ id: x.id }} className="rounded-md bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground">{t("open")}</Link>
          <button onClick={() => update([{ ...structuredClone(x), id: uid(), name: x.name + " (2)", updatedAt: Date.now() }, ...list])} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-secondary">{t("duplicate")}</button>
          <button onClick={() => update(list.filter((y) => y.id !== x.id))} className="rounded-md border border-destructive/50 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10">{t("del")}</button>
        </div>
      ))}
    </div>
  );
}
