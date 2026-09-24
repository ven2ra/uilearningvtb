// Каталог достижений. Почти за каждое первое действие — достижение, в обоих режимах.
// Награждаем за первое действие и освоение, а не за объём или частоту реальных сделок.

import type { IconName } from "../ui/Icons";

export type AchievementGroup = "Первые шаги" | "Биржа" | "Фейковые торги";

export interface AchievementDef {
  id: string;
  title: string;
  /** Что нужно сделать — служит и подсказкой для закрытого достижения */
  desc: string;
  icon: IconName;
  group: AchievementGroup;
  /** В каком режиме засчитывается действие */
  mode: "real" | "training" | "any";
  /** Событие интерфейса, открывающее достижение */
  event?: string;
  /** Или завершение этапа тренировочной программы */
  stage?: number;
  /** Крупное празднование вместо тоста */
  major?: boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "welcome", title: "Добро пожаловать", desc: "Пройдите знакомство с приложением", icon: "sparkle", group: "Первые шаги", mode: "any", event: "onb:done" },
  { id: "curious", title: "Любопытный", desc: "Откройте «Помощь»", icon: "help", group: "Первые шаги", mode: "any", event: "help:open" },
  { id: "first-topup", title: "Первое пополнение", desc: "Пополните брокерский счёт", icon: "wallet", group: "Первые шаги", mode: "real", event: "do:topup" },
  { id: "paperwork", title: "Бумажная работа", desc: "Закажите первый документ", icon: "file", group: "Первые шаги", mode: "any", event: "do:order-doc" },

  { id: "on-market", title: "На бирже", desc: "Откройте раздел биржи", icon: "market", group: "Биржа", mode: "any", event: "open:market" },
  { id: "explorer", title: "Исследователь", desc: "Откройте карточку инструмента", icon: "search", group: "Биржа", mode: "any", event: "open:instrument" },
  { id: "analyst", title: "Аналитик", desc: "Посмотрите график за год", icon: "target", group: "Биржа", mode: "any", event: "do:period-year" },
  { id: "first-buy", title: "Первая покупка", desc: "Совершите первую покупку на своём счёте", icon: "cart", group: "Биржа", mode: "real", event: "do:buy", major: true },
  { id: "liquidity", title: "Подушка ликвидности", desc: "Купите фонд денежного рынка", icon: "shield", group: "Биржа", mode: "real", event: "do:buy:LQDT", major: true },
  { id: "shareholder", title: "Совладелец", desc: "Купите первую акцию", icon: "briefcase", group: "Биржа", mode: "real", event: "do:buy:Акции", major: true },
  { id: "first-sell", title: "Первая продажа", desc: "Продайте актив на своём счёте", icon: "arrowUp", group: "Биржа", mode: "real", event: "do:sell" },

  { id: "switcher", title: "Тренировочный режим", desc: "Включите фейковые торги", icon: "cap", group: "Фейковые торги", mode: "training", event: "mode:training" },
  { id: "a1", title: "Первый шаг", desc: "Пройдите этап «Ориентируемся в приложении»", icon: "flag", group: "Фейковые торги", mode: "training", stage: 1 },
  { id: "a2", title: "Навигатор", desc: "Найдите пополнение и документы", icon: "compass", group: "Фейковые торги", mode: "training", stage: 3 },
  { id: "v-buy", title: "Первая виртуальная покупка", desc: "Купите актив на фейковых торгах", icon: "cart", group: "Фейковые торги", mode: "training", event: "do:buy", major: true },
  { id: "bold", title: "Смелый трейдер", desc: "Попробуйте фьючерс на фейковых торгах", icon: "trophy", group: "Фейковые торги", mode: "training", event: "do:buy:Фьючерсы", major: true },
  { id: "a4", title: "Первый портфель", desc: "Разберитесь в портфеле и истории", icon: "pie", group: "Фейковые торги", mode: "training", stage: 6 },
  { id: "a5", title: "Инвестор-новичок", desc: "Пройдите все 7 этапов обучения", icon: "medal", group: "Фейковые торги", mode: "training", stage: 7, major: true },
];

export const ACH_BY_ID: Record<string, AchievementDef> = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
export const ACH_GROUPS: AchievementGroup[] = ["Первые шаги", "Биржа", "Фейковые торги"];

export type LearningAchievementCondition =
  | { type: "lesson_completed" | "study_streak" | "topics_completed" | "perfect_lessons" | "portfolio_lessons" | "coins" | "tasks_completed"; minimum: number }
  | { type: "topic_completed"; topic: string }
  | { type: "quiz_score"; minimum: number }
  | { type: "all_lessons" };

export interface LearningAchievement {
  id: string;
  title: string;
  description: string;
  icon: "book" | "calendar" | "graduation" | "pie" | "target" | "chart" | "shield" | "star" | "bulb" | "coins" | "arrow" | "diamond";
  reward: number;
  condition: LearningAchievementCondition;
}

export const LEARNING_ACHIEVEMENTS: LearningAchievement[] = [
  { id: "first_step", title: "Первый шаг", description: "Пройдите первый урок обучения", icon: "book", reward: 10, condition: { type: "lesson_completed", minimum: 1 } },
  { id: "streak_3", title: "Серия 3 дня", description: "Заходите в обучение 3 дня подряд", icon: "calendar", reward: 15, condition: { type: "study_streak", minimum: 3 } },
  { id: "curious_learner", title: "Любознательный", description: "Пройдите 3 урока", icon: "graduation", reward: 20, condition: { type: "lesson_completed", minimum: 3 } },
  { id: "first_knowledge", title: "Первые знания", description: "Пройдите тему «Основные инструменты»", icon: "pie", reward: 20, condition: { type: "topic_completed", topic: "instruments" } },
  { id: "accuracy", title: "Точность", description: "Пройдите все тесты на 80% и выше", icon: "target", reward: 25, condition: { type: "quiz_score", minimum: 80 } },
  { id: "active_learner", title: "Активный ученик", description: "Пройдите 10 уроков", icon: "chart", reward: 30, condition: { type: "lesson_completed", minimum: 10 } },
  { id: "flawless", title: "Без ошибок", description: "Пройдите 5 уроков подряд без ошибок", icon: "shield", reward: 30, condition: { type: "perfect_lessons", minimum: 5 } },
  { id: "streak_7", title: "Постоянство", description: "Заходите в обучение 7 дней подряд", icon: "star", reward: 40, condition: { type: "study_streak", minimum: 7 } },
  { id: "deep_knowledge", title: "Глубокие знания", description: "Пройдите 3 темы полностью", icon: "bulb", reward: 40, condition: { type: "topics_completed", minimum: 3 } },
  { id: "investor_start", title: "Инвестор (начало)", description: "Пройдите 5 уроков о портфеле", icon: "coins", reward: 50, condition: { type: "portfolio_lessons", minimum: 5 } },
  { id: "strategist", title: "Стратег", description: "Пройдите тему «Стратегии инвестирования»", icon: "arrow", reward: 50, condition: { type: "topic_completed", topic: "strategies" } },
  { id: "expert", title: "Эксперт", description: "Пройдите все уроки обучения", icon: "diamond", reward: 100, condition: { type: "all_lessons" } },
];
