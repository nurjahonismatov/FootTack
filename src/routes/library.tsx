import { createFileRoute } from "@tanstack/react-router";
import { useI18n, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/library")({
  head: () => ({ meta: [{ title: "Tactical Library — Football Tactical Studio" }, { name: "description", content: "Football player roles and playing styles explained." }, { property: "og:title", content: "Tactical Library — Football Tactical Studio" }, { property: "og:description", content: "Football player roles and playing styles explained." }] }),
  component: Library,
});

type Item = { en: string; uz: string; ru: string; d: Record<Lang, string> };
const ROLES: Item[] = [
  { en: "False Nine", uz: "Soxta to‘qqizlik", ru: "Ложная девятка", d: { en: "Striker who drops deep to create space.", uz: "Bo‘sh joy yaratish uchun orqaga tushadigan hujumchi.", ru: "Нападающий, опускающийся глубже, создавая пространство." } },
  { en: "Inverted Fullback", uz: "Teskari qanot himoyachisi", ru: "Инвертированный крайний защитник", d: { en: "Fullback who moves into midfield in possession.", uz: "To‘p bilan markazga kiradigan qanot himoyachisi.", ru: "Крайний защитник, смещающийся в центр при владении." } },
  { en: "Defensive Midfielder", uz: "Himoyaviy yarim himoyachi", ru: "Опорный полузащитник", d: { en: "Shields the back line and recycles possession.", uz: "Himoya chizig‘ini to‘sadi va to‘pni tarqatadi.", ru: "Прикрывает оборону и распределяет мяч." } },
  { en: "Attacking Midfielder", uz: "Hujumkor yarim himoyachi", ru: "Атакующий полузащитник", d: { en: "Creates chances between the lines.", uz: "Chiziqlar orasida imkoniyat yaratadi.", ru: "Создаёт моменты между линиями." } },
  { en: "Inside Forward", uz: "Ichki hujumchi", ru: "Инсайд", d: { en: "Winger cutting inside to shoot.", uz: "Zarba berish uchun ichkariga kiradigan qanot.", ru: "Вингер, смещающийся в центр для удара." } },
  { en: "Sweeper Keeper", uz: "Supurgich darvozabon", ru: "Вратарь-либеро", d: { en: "Goalkeeper who covers space behind a high line.", uz: "Baland chiziq ortidagi joyni yopadigan darvozabon.", ru: "Вратарь, страхующий пространство за высокой линией." } },
];
const STYLES: Item[] = [
  { en: "Gegenpressing", uz: "Gegenpressing", ru: "Гегенпрессинг", d: { en: "Win the ball back immediately after losing it.", uz: "To‘pni yo‘qotgach darhol qaytarib olish.", ru: "Немедленный отбор мяча после потери." } },
  { en: "Tiki-Taka", uz: "Tiki-taka", ru: "Тики-така", d: { en: "Short passing and positional rotations.", uz: "Qisqa paslar va pozitsion almashinuvlar.", ru: "Короткий пас и позиционные ротации." } },
  { en: "Low Block", uz: "Past blok", ru: "Низкий блок", d: { en: "Compact defending near your own box.", uz: "O‘z jarima maydoni yonida ixcham himoya.", ru: "Компактная оборона у своей штрафной." } },
  { en: "Counter-Attack", uz: "Qarshi hujum", ru: "Контратака", d: { en: "Fast vertical attacks after regaining the ball.", uz: "To‘pni olgach tezkor vertikal hujum.", ru: "Быстрые вертикальные атаки после отбора." } },
];

function Library() {
  const { t, lang } = useI18n();
  const block = (title: string, items: Item[]) => (
    <section><h3 className="mb-3 font-bold text-primary">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map((i) => (
        <article key={i.en} className="rounded-xl border border-border bg-card p-4 animate-rise">
          <div className="font-bold">{i[lang]}{lang !== "en" && <span className="text-muted-foreground"> ({i.en})</span>}</div>
          <p className="mt-1 text-sm text-muted-foreground">{i.d[lang]}</p>
        </article>))}</div></section>
  );
  return <div className="mx-auto flex max-w-6xl flex-col gap-8">{block(t("roles"), ROLES)}{block(t("styles"), STYLES)}</div>;
}
