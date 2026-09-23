// Каталог достижений. Почти за каждое первое действие — достижение, в обоих режимах.
// Награждаем за первое действие и освоение, а не за объём или частоту реальных сделок.

import type { IconName } from "../ui/Icons";

export type AchievementGroup = "Первые шаги" | "Биржа" | "Фейковые торги" | "Финкод" | "Особые";
export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";

export const TIER_LABEL: Record<AchievementTier, string> = { bronze: "Бронза", silver: "Серебро", gold: "Золото", platinum: "Платина" };
export const TIER_ORDER: AchievementTier[] = ["bronze", "silver", "gold", "platinum"];

export interface AchievementDef {
  id: string;
  title: string;
  /** Что нужно сделать — служит и подсказкой для закрытого достижения */
  desc: string;
  icon: IconName;
  group: AchievementGroup;
  /** Уровень сложности — как трофеи PlayStation: от бронзы до платины */
  tier: AchievementTier;
  /** В каком режиме засчитывается действие */
  mode: "real" | "training" | "any";
  /** Событие интерфейса, открывающее достижение */
  event?: string;
  /** Или завершение этапа тренировочной программы */
  stage?: number;
  /** Крупное празднование вместо тоста */
  major?: boolean;
  /** Платина: выдаётся автоматически за все остальные достижения, у нее нет своего события */
  auto?: boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "welcome", title: "Добро пожаловать", desc: "Пройдите знакомство с приложением", icon: "sparkle", group: "Первые шаги", tier: "bronze", mode: "any", event: "onb:done" },
  { id: "curious", title: "Любопытный", desc: "Откройте «Помощь»", icon: "help", group: "Первые шаги", tier: "bronze", mode: "any", event: "help:open" },
  { id: "first-topup", title: "Первое пополнение", desc: "Пополните брокерский счёт", icon: "wallet", group: "Первые шаги", tier: "bronze", mode: "real", event: "do:topup" },
  { id: "paperwork", title: "Бумажная работа", desc: "Закажите первый документ", icon: "file", group: "Первые шаги", tier: "bronze", mode: "any", event: "do:order-doc" },

  { id: "on-market", title: "На бирже", desc: "Откройте раздел биржи", icon: "market", group: "Биржа", tier: "bronze", mode: "any", event: "open:market" },
  { id: "explorer", title: "Исследователь", desc: "Откройте карточку инструмента", icon: "search", group: "Биржа", tier: "bronze", mode: "any", event: "open:instrument" },
  { id: "analyst", title: "Аналитик", desc: "Посмотрите график за год", icon: "target", group: "Биржа", tier: "silver", mode: "any", event: "do:period-year" },
  { id: "first-buy", title: "Первая покупка", desc: "Совершите первую покупку на своём счёте", icon: "cart", group: "Биржа", tier: "gold", mode: "real", event: "do:buy", major: true },
  { id: "liquidity", title: "Подушка ликвидности", desc: "Купите фонд денежного рынка", icon: "shield", group: "Биржа", tier: "silver", mode: "real", event: "do:buy:LQDT", major: true },
  { id: "shareholder", title: "Совладелец", desc: "Купите первую акцию", icon: "briefcase", group: "Биржа", tier: "gold", mode: "real", event: "do:buy:Акции", major: true },
  { id: "first-sell", title: "Первая продажа", desc: "Продайте актив на своём счёте", icon: "arrowUp", group: "Биржа", tier: "silver", mode: "real", event: "do:sell" },

  { id: "switcher", title: "Тренировочный режим", desc: "Включите фейковые торги", icon: "cap", group: "Фейковые торги", tier: "bronze", mode: "training", event: "mode:training" },
  { id: "a1", title: "Первый шаг", desc: "Пройдите этап «Ориентируемся в приложении»", icon: "flag", group: "Фейковые торги", tier: "bronze", mode: "training", stage: 1 },
  { id: "a2", title: "Навигатор", desc: "Найдите пополнение и документы", icon: "compass", group: "Фейковые торги", tier: "silver", mode: "training", stage: 3 },
  { id: "v-buy", title: "Первая виртуальная покупка", desc: "Купите актив на фейковых торгах", icon: "cart", group: "Фейковые торги", tier: "gold", mode: "training", event: "do:buy", major: true },
  { id: "bold", title: "Смелый трейдер", desc: "Попробуйте фьючерс на фейковых торгах", icon: "trophy", group: "Фейковые торги", tier: "gold", mode: "training", event: "do:buy:Фьючерсы", major: true },
  { id: "a4", title: "Первый портфель", desc: "Разберитесь в портфеле и истории", icon: "pie", group: "Фейковые торги", tier: "silver", mode: "training", stage: 6 },
  { id: "a5", title: "Инвестор-новичок", desc: "Пройдите все 7 этапов обучения", icon: "medal", group: "Фейковые торги", tier: "gold", mode: "training", stage: 7, major: true },

  { id: "fincode-margin", title: "Знаток срочного рынка", desc: "Пройдите тему «Срочный рынок и маржа» в Финкоде", icon: "trophy", group: "Финкод", tier: "gold", mode: "any", event: "fincode:topic:margin:passed" },
  { id: "fincode-graduate", title: "Выпускник Финкода", desc: "Пройдите итоговый тест Финкода", icon: "medal", group: "Финкод", tier: "gold", mode: "any", event: "fincode:topic:final:passed", major: true },
  { id: "streak-7", title: "Неделя подряд", desc: "Держите стрик в Финкоде 7 дней подряд", icon: "flame", group: "Финкод", tier: "silver", mode: "any", event: "fincode:streak:7" },
  { id: "streak-30", title: "Месяц без пропусков", desc: "Держите стрик в Финкоде 30 дней подряд", icon: "flame", group: "Финкод", tier: "gold", mode: "any", event: "fincode:streak:30", major: true },

  { id: "platinum", title: "Платина", desc: "Получите все остальные достижения", icon: "medal", group: "Особые", tier: "platinum", mode: "any", major: true, auto: true },
];

export const ACH_BY_ID: Record<string, AchievementDef> = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
export const ACH_GROUPS: AchievementGroup[] = ["Первые шаги", "Биржа", "Фейковые торги", "Финкод", "Особые"];
