import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "uz" | "ru" | "en";
const dict = {
  en: {
    teams: "My Teams", simulator: "Match Simulator", setPieces: "Set-Piece Studio", training: "Training Ground", plans: "Match Plans",
    home: "Home", newTactic: "New Tactic", saved: "Saved Tactics", library: "Tactical Library", settings: "Settings",
    welcome: "Welcome back, Coach", welcomeSub: "Build, analyse and animate your tactics.",
    quickNew: "Create new tactic", quickNewSub: "Open the tactical board", tactics: "Tactics", players: "Players", phases: "Phases",
    recent: "Recent tactics", none: "No tactics yet. Create your first one.", open: "Open", duplicate: "Duplicate", del: "Delete",
    name: "Tactic name", format: "Format", formation: "Formation", save: "Save", savedOk: "Tactic saved", undo: "Undo", redo: "Redo",
    move: "Move", paint: "Paint zone", erase: "Erase", brush: "Brush size", intensity: "Intensity", grid: "Grid", snap: "Snap",
    clearZones: "Clear player zones", copyZone: "Copy zones from", play: "Play phases", stop: "Stop", inspector: "Player inspector",
    selectPlayer: "Select a player on the pitch.", number: "Number", playerName: "Name", position: "Position", captain: "Captain",
    legend: "Zone priority", primary: "Primary", secondary: "Secondary", occasional: "Occasional", rare: "Rare",
    language: "Language", search: "Search tactics…", updated: "Updated", allPhases: "Phase", coords: "Position",
    zoneNote: "Percentages are tactical priorities, not guaranteed match time.", roles: "Player roles", styles: "Playing styles",
    showAllZones: "Show all zones", reset: "Reset positions",
  },
  uz: {
    teams: "Jamoalarim", simulator: "O‘yin simulyatori", setPieces: "Standart vaziyatlar", training: "Mashg‘ulotlar", plans: "O‘yin rejalari",
    home: "Bosh sahifa", newTactic: "Yangi taktika", saved: "Saqlangan taktikalar", library: "Taktik kutubxona", settings: "Sozlamalar",
    welcome: "Xush kelibsiz, murabbiy", welcomeSub: "Taktikalaringizni yarating, tahlil qiling va jonlantiring.",
    quickNew: "Yangi taktika yaratish", quickNewSub: "Taktik taxtani ochish", tactics: "Taktikalar", players: "O‘yinchilar", phases: "Fazalar",
    recent: "So‘nggi taktikalar", none: "Hali taktika yo‘q. Birinchisini yarating.", open: "Ochish", duplicate: "Nusxalash", del: "O‘chirish",
    name: "Taktika nomi", format: "Format", formation: "Sxema", save: "Saqlash", savedOk: "Taktika saqlandi", undo: "Bekor qilish", redo: "Qaytarish",
    move: "Siljitish", paint: "Zona chizish", erase: "O‘chirg‘ich", brush: "Mo‘yqalam o‘lchami", intensity: "Intensivlik", grid: "To‘r", snap: "Yopishish",
    clearZones: "O‘yinchi zonalarini tozalash", copyZone: "Zonani nusxalash:", play: "Fazalarni ijro etish", stop: "To‘xtatish", inspector: "O‘yinchi sozlamalari",
    selectPlayer: "Maydondan o‘yinchini tanlang.", number: "Raqam", playerName: "Ism", position: "Pozitsiya", captain: "Sardor",
    legend: "Zona ustuvorligi", primary: "Asosiy", secondary: "Ikkilamchi", occasional: "Ba’zan", rare: "Kamdan-kam",
    language: "Til", search: "Taktikalarni qidirish…", updated: "Yangilangan", allPhases: "Faza", coords: "Joylashuv",
    zoneNote: "Foizlar taktik ustuvorlikdir, kafolatlangan o‘yin vaqti emas.", roles: "O‘yinchi rollari", styles: "O‘yin uslublari",
    showAllZones: "Barcha zonalar", reset: "Joylashuvni tiklash",
  },
  ru: {
    teams: "Мои команды", simulator: "Симулятор матча", setPieces: "Стандарты", training: "Тренировки", plans: "Планы на матч",
    home: "Главная", newTactic: "Новая тактика", saved: "Сохранённые", library: "Тактическая библиотека", settings: "Настройки",
    welcome: "С возвращением, тренер", welcomeSub: "Создавайте, анализируйте и анимируйте тактики.",
    quickNew: "Создать тактику", quickNewSub: "Открыть тактическую доску", tactics: "Тактики", players: "Игроки", phases: "Фазы",
    recent: "Недавние тактики", none: "Тактик пока нет. Создайте первую.", open: "Открыть", duplicate: "Дублировать", del: "Удалить",
    name: "Название тактики", format: "Формат", formation: "Схема", save: "Сохранить", savedOk: "Тактика сохранена", undo: "Отменить", redo: "Повторить",
    move: "Перемещение", paint: "Рисовать зону", erase: "Ластик", brush: "Размер кисти", intensity: "Интенсивность", grid: "Сетка", snap: "Привязка",
    clearZones: "Очистить зоны игрока", copyZone: "Копировать зоны от", play: "Проиграть фазы", stop: "Стоп", inspector: "Настройки игрока",
    selectPlayer: "Выберите игрока на поле.", number: "Номер", playerName: "Имя", position: "Позиция", captain: "Капитан",
    legend: "Приоритет зоны", primary: "Основная", secondary: "Вторичная", occasional: "Иногда", rare: "Редко",
    language: "Язык", search: "Поиск тактик…", updated: "Обновлено", allPhases: "Фаза", coords: "Позиция",
    zoneNote: "Проценты — тактический приоритет, а не гарантированное время.", roles: "Роли игроков", styles: "Стили игры",
    showAllZones: "Все зоны", reset: "Сбросить позиции",
  },
};
export type Key = keyof typeof dict.en;

export const PHASES = ["balanced","attacking","defensive","attTrans","defTrans","leftCorner","rightCorner","defLeftCorner","defRightCorner","attFK","defFK","penalty","throwIn"] as const;
export type Phase = (typeof PHASES)[number];
export const phaseNames: Record<Lang, Record<Phase, string>> = {
  en: { balanced:"Balanced", attacking:"Attacking", defensive:"Defensive", attTrans:"Attacking Transition", defTrans:"Defensive Transition", leftCorner:"Left Corner", rightCorner:"Right Corner", defLeftCorner:"Def. Left Corner", defRightCorner:"Def. Right Corner", attFK:"Attacking Free Kick", defFK:"Defensive Free Kick", penalty:"Penalty", throwIn:"Throw-in" },
  uz: { balanced:"Muvozanat", attacking:"Hujum", defensive:"Himoya", attTrans:"Hujumga o‘tish", defTrans:"Himoyaga o‘tish", leftCorner:"Chap burchak", rightCorner:"O‘ng burchak", defLeftCorner:"Himoya: chap burchak", defRightCorner:"Himoya: o‘ng burchak", attFK:"Hujum jarima zarbasi", defFK:"Himoya jarima zarbasi", penalty:"Penalti", throwIn:"Autdan tashlash" },
  ru: { balanced:"Баланс", attacking:"Атака", defensive:"Оборона", attTrans:"Переход в атаку", defTrans:"Переход в оборону", leftCorner:"Левый угловой", rightCorner:"Правый угловой", defLeftCorner:"Защ. левый угловой", defRightCorner:"Защ. правый угловой", attFK:"Атакующий штрафной", defFK:"Защитный штрафной", penalty:"Пенальти", throwIn:"Аут" },
};

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({ lang: "uz", setLang: () => {}, t: (k) => dict.uz[k] });
export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setL] = useState<Lang>("uz");
  useEffect(() => { const s = localStorage.getItem("fts-lang") as Lang | null; if (s && dict[s]) setL(s); }, []);
  const setLang = (l: Lang) => { setL(l); localStorage.setItem("fts-lang", l); };
  return <Ctx.Provider value={{ lang, setLang, t: (k) => dict[lang][k] }}>{children}</Ctx.Provider>;
}
export const useI18n = () => useContext(Ctx);

export type Tr = Record<Lang, string>;
export function useTr() { const { lang } = useI18n(); return (x: Tr) => x[lang]; }
