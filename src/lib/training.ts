// Программа тренировочного режима: этапы → задания → достижения.
// Принцип: показал → попросил сделать → дал обратную связь → открыл следующий уровень.

import { ACHIEVEMENTS } from "./achievements";

export interface TaskDef {
  id: string;
  stage: number;
  instruction: string;
  success: string;
  /** Событие интерфейса, которое засчитывает задание */
  event: string;
  /** Путь подсказки: цели spotlight от общего к конкретному */
  hint: { target: string; title: string; text: string }[];
  /** Неверные действия и объяснение ошибки */
  wrong?: Record<string, string>;
}

export interface StageDef {
  n: number;
  title: string;
  short: string;
}

export const STAGES: StageDef[] = [
  { n: 1, title: "Ориентируемся в приложении", short: "Навигация" },
  { n: 2, title: "Пополняем счёт", short: "Пополнение" },
  { n: 3, title: "Находим документы", short: "Документы" },
  { n: 4, title: "Изучаем инструмент", short: "Инструмент" },
  { n: 5, title: "Совершаем первую виртуальную покупку", short: "Покупка" },
  { n: 6, title: "Управляем портфелем", short: "Портфель" },
  { n: 7, title: "Первая виртуальная продажа", short: "Продажа" },
];

const toHome = { target: "nav-home", title: "Главная", text: "Начните с главного экрана" };
const toActions = { target: "actions", title: "Действия", text: "Операции со счётом — здесь" };
const toMarket = { target: "nav-market", title: "Рынок", text: "Все инструменты — в разделе «Рынок»" };
const toInstrument = { target: "market-first", title: "Инструмент", text: "Нажмите на любую строку" };

export const TASKS: TaskDef[] = [
  {
    id: "t1",
    stage: 1,
    instruction: "Откройте меню «Действия» на главном экране",
    success: "Отлично! Здесь собраны все операции со счётом.",
    event: "open:actions",
    hint: [toHome, toActions],
  },
  {
    id: "t2",
    stage: 2,
    instruction: "Найдите, где пополняется инвестиционный счёт",
    success: "Отлично! Вы нашли раздел пополнения.",
    event: "open:topup",
    hint: [toHome, toActions, { target: "action-topup", title: "Пополнить", text: "Нажмите сюда" }],
    wrong: { "open:withdraw": "Это вывод денег. Пополнение — строчкой выше." },
  },
  {
    id: "t3",
    stage: 2,
    instruction: "Пополните виртуальный счёт на любую сумму",
    success: "Готово! Виртуальные деньги зачислены на счёт.",
    event: "do:topup",
    hint: [
      toHome,
      toActions,
      { target: "action-topup", title: "Пополнить", text: "Откройте пополнение" },
      { target: "topup-submit", title: "Пополнить", text: "Выберите сумму и подтвердите" },
    ],
    wrong: { "do:withdraw": "Это вывод. Нужно пополнение — оно в том же меню." },
  },
  {
    id: "t4",
    stage: 3,
    instruction: "Теперь найдите документы",
    success: "Верно! Здесь отчёты и справки по счёту.",
    event: "open:documents",
    hint: [toHome, toActions, { target: "action-docs", title: "Отчёты и справки", text: "Документы — здесь" }],
    wrong: {
      "open:topup": "Это пополнение. Документы — в том же меню, ниже.",
      "open:withdraw": "Это вывод. Документы — в том же меню, ниже.",
    },
  },
  {
    id: "t5",
    stage: 3,
    instruction: "Закажите любой документ",
    success: "Документ заказан. Он появится в «Готовых».",
    event: "do:order-doc",
    hint: [
      toHome,
      toActions,
      { target: "action-docs", title: "Отчёты и справки", text: "Откройте документы" },
      { target: "docs-order", title: "Заказать документ", text: "Выберите заказ" },
      { target: "doc-submit", title: "Заказать", text: "Подтвердите заказ" },
    ],
    wrong: { "open:doc-ready": "Здесь готовые документы. Нужен заказ нового." },
  },
  {
    id: "t6",
    stage: 4,
    instruction: "Откройте карточку любого инструмента",
    success: "Отлично! Это карточка инструмента.",
    event: "open:instrument",
    hint: [toMarket, toInstrument],
  },
  {
    id: "t7",
    stage: 4,
    instruction: "Посмотрите котировки за год — переключите период графика",
    success: "Теперь видно, как менялась цена за год.",
    event: "do:period-year",
    hint: [toMarket, toInstrument, { target: "chart-periods", title: "Период", text: "Выберите «1Г»" }],
  },
  {
    id: "t8",
    stage: 5,
    instruction: "Купите пай фонда ликвидности — или любой другой актив на выбор",
    success: "Первая покупка! Деньги виртуальные — никакого риска.",
    event: "do:buy",
    hint: [
      toMarket,
      { target: "seg-Фонды", title: "Начните с минимума", text: "Пай фонда ликвидности стоит около 2 ₽. Можно выбрать и любую акцию" },
      { target: "instr-LQDT", title: "Фонд ликвидности", text: "Самый простой старт: продать можно в любой момент" },
      { target: "btn-buy", title: "Купить", text: "Нажмите «Купить»" },
      { target: "trade-submit", title: "Подтверждение", text: "Проверьте сумму и подтвердите" },
    ],
    wrong: { "err:insufficient": "Не хватает виртуальных средств. Уменьшите количество." },
  },
  {
    id: "t9",
    stage: 6,
    instruction: "Проверьте, как покупка изменила ваш виртуальный портфель",
    success: "Вот ваша позиция и её доходность.",
    event: "open:portfolio",
    hint: [{ target: "nav-portfolio", title: "Портфель", text: "Откройте портфель" }],
  },
  {
    id: "t10",
    stage: 6,
    instruction: "Найдите историю операций",
    success: "Здесь видны все сделки и движения денег.",
    event: "open:history",
    hint: [{ target: "nav-history", title: "История", text: "Операции — здесь" }],
  },
  {
    id: "t11",
    stage: 7,
    instruction: "Продайте часть актива из портфеля",
    success: "Первая продажа совершена!",
    event: "do:sell",
    hint: [
      { target: "nav-portfolio", title: "Портфель", text: "Откройте портфель" },
      { target: "portfolio-pos-0", title: "Позиция", text: "Выберите актив" },
      { target: "btn-sell", title: "Продать", text: "Нажмите «Продать»" },
      { target: "trade-submit", title: "Подтверждение", text: "Подтвердите продажу" },
    ],
    wrong: { "err:oversell": "Нельзя продать больше, чем есть в портфеле." },
  },
];

export const STATUSES = [
  { min: 0, title: "Гость" },
  { min: 1, title: "Исследователь" },
  { min: 3, title: "Практик" },
  { min: 5, title: "Трейдер-стажёр" },
  { min: 7, title: "Инвестор-новичок" },
];

export function statusFor(stagesDone: number) {
  return [...STATUSES].reverse().find((s) => stagesDone >= s.min)!.title;
}

export function stagesDone(doneTasks: number) {
  let n = 0;
  for (const s of STAGES) {
    const last = TASKS.filter((t) => t.stage === s.n).at(-1)!;
    if (TASKS.indexOf(last) < doneTasks) n = s.n;
  }
  return n;
}

export function tasksUntilNextAchievement(doneTasks: number) {
  const next = ACHIEVEMENTS.find((a) => a.stage && stagesDone(doneTasks) < a.stage);
  if (!next) return null;
  const lastTaskIdx = TASKS.map((t) => t.stage).lastIndexOf(next.stage!);
  return { achievement: next, left: lastTaskIdx + 1 - doneTasks };
}
