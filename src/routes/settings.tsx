import { createFileRoute } from "@tanstack/react-router";
import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Football Tactical Studio" }, { name: "description", content: "Choose your language and preferences." }, { property: "og:title", content: "Settings — Football Tactical Studio" }, { property: "og:description", content: "Choose your language and preferences." }] }),
  component: Settings,
});
function Settings() {
  const { t, lang, setLang } = useI18n();
  const opts: [Lang, string][] = [["uz", "O‘zbekcha"], ["ru", "Русский"], ["en", "English"]];
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-6 animate-rise">
      <h3 className="mb-3 font-bold">{t("language")}</h3>
      <div className="grid grid-cols-3 gap-2">{opts.map(([k, l]) => <button key={k} onClick={() => setLang(k)} className={cn("rounded-md border px-3 py-3 font-semibold", lang === k ? "border-primary bg-primary/15 text-primary" : "border-border hover:bg-secondary")}>{l}</button>)}</div>
    </div>
  );
}
