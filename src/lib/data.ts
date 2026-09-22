// Тестовые данные прототипа. Не являются рыночными котировками и не являются рекомендацией.

export type InstrumentType = "Акции" | "Облигации" | "Фонды";

export interface Instrument {
  id: string;
  ticker: string;
  name: string;
  type: InstrumentType;
  open: number; // цена открытия дня
  color: string; // цвет «монограммы» вместо логотипа эмитента
  sector: string;
  about: string;
}

export const INSTRUMENTS: Instrument[] = [
  { id: "SBER", ticker: "SBER", name: "Сбербанк", type: "Акции", open: 305.8, color: "#16A34A", sector: "Финансы", about: "Крупнейший банк страны. Акции входят в индекс Мосбиржи." },
  { id: "GAZP", ticker: "GAZP", name: "Газпром", type: "Акции", open: 131.2, color: "#0284C7", sector: "Энергетика", about: "Добыча и транспортировка природного газа." },
  { id: "LKOH", ticker: "LKOH", name: "Лукойл", type: "Акции", open: 7088, color: "#DC2626", sector: "Энергетика", about: "Нефтяная компания полного цикла." },
  { id: "YDEX", ticker: "YDEX", name: "Яндекс", type: "Акции", open: 4175, color: "#EAB308", sector: "Технологии", about: "Технологическая компания: поиск, сервисы, облака." },
  { id: "MOEX", ticker: "MOEX", name: "Московская биржа", type: "Акции", open: 221.4, color: "#334155", sector: "Финансы", about: "Оператор крупнейшей биржевой площадки страны." },
  { id: "MGNT", ticker: "MGNT", name: "Магнит", type: "Акции", open: 5410, color: "#E11D48", sector: "Ритейл", about: "Сеть продуктовых магазинов." },
  { id: "OFZ26238", ticker: "SU26238", name: "ОФЗ 26238", type: "Облигации", open: 61.42, color: "#475569", sector: "Госдолг", about: "Облигация федерального займа. Цена указана в % от номинала × 10 для наглядности." },
  { id: "RU000A", ticker: "RU000A10", name: "Облигация ВДО-1", type: "Облигации", open: 998.5, color: "#7C3AED", sector: "Корпоративные", about: "Корпоративная облигация с фиксированным купоном." },
  { id: "LQDT", ticker: "LQDT", name: "Фонд денежного рынка", type: "Фонды", open: 1.782, color: "#0EA5E9", sector: "Денежный рынок", about: "Биржевой фонд, вкладывающий в инструменты денежного рынка." },
  { id: "EQMX", ticker: "EQMX", name: "Фонд на индекс Мосбиржи", type: "Фонды", open: 132.6, color: "#6366F1", sector: "Индекс", about: "Биржевой фонд, повторяющий индекс Мосбиржи." },
];

export const INSTRUMENT_BY_ID: Record<string, Instrument> = Object.fromEntries(INSTRUMENTS.map((i) => [i.id, i]));

export const INITIAL_PRICES: Record<string, number> = {
  SBER: 312.45,
  GAZP: 128.9,
  LKOH: 7145,
  YDEX: 4210.5,
  MOEX: 218.7,
  MGNT: 5462,
  OFZ26238: 61.35,
  RU000A: 999.1,
  LQDT: 1.7834,
  EQMX: 133.9,
};

export interface Position {
  id: string;
  qty: number;
  avg: number;
}

export interface Operation {
  id: string;
  ts: number;
  kind: "buy" | "sell" | "topup" | "withdraw" | "coupon" | "dividend";
  title: string;
  amount: number; // + зачисление, − списание
  detail?: string;
}

export interface Doc {
  id: string;
  title: string;
  period: string;
  status: "ready" | "pending";
  ts: number;
}

const DAY = 86400000;
const now = Date.now();

// Реальный (демонстрационный) брокерский счёт
export const REAL_ACCOUNT = {
  number: "···4821",
  cash: 48320.5,
  positions: [
    { id: "SBER", qty: 120, avg: 268.4 },
    { id: "LQDT", qty: 40000, avg: 1.71 },
    { id: "OFZ26238", qty: 300, avg: 63.1 },
    { id: "YDEX", qty: 8, avg: 3890 },
  ] as Position[],
  history: [
    { id: "r1", ts: now - 2 * 3600000, kind: "buy", title: "Покупка SBER", amount: -3124.5, detail: "10 шт. по 312,45 ₽" },
    { id: "r2", ts: now - DAY, kind: "topup", title: "Пополнение с карты", amount: 25000, detail: "Карта ВТБ ··1234" },
    { id: "r3", ts: now - 3 * DAY, kind: "coupon", title: "Купон ОФЗ 26238", amount: 1063.5 },
    { id: "r4", ts: now - 6 * DAY, kind: "sell", title: "Продажа GAZP", amount: 12890, detail: "100 шт. по 128,90 ₽" },
    { id: "r5", ts: now - 9 * DAY, kind: "withdraw", title: "Вывод на карту", amount: -10000, detail: "Карта ВТБ ··1234" },
  ] as Operation[],
  docs: [
    { id: "d1", title: "Брокерский отчёт", period: "Август 2026", status: "ready", ts: now - 20 * DAY },
    { id: "d2", title: "Справка о доходах (2-НДФЛ)", period: "2025 год", status: "ready", ts: now - 120 * DAY },
    { id: "d3", title: "Выписка по счёту", period: "II квартал 2026", status: "ready", ts: now - 60 * DAY },
  ] as Doc[],
};

export const DOC_TYPES = [
  { id: "report", title: "Брокерский отчёт", hint: "Все сделки и движения за период" },
  { id: "ndfl", title: "Справка о доходах (2-НДФЛ)", hint: "Для налоговой и банка" },
  { id: "account", title: "Справка о наличии счёта", hint: "Реквизиты и дата открытия" },
  { id: "statement", title: "Выписка по счёту", hint: "Остатки ценных бумаг и денег" },
];

export const DOC_PERIODS = ["Месяц", "Квартал", "Год"];

export const VIRTUAL_START_CASH = 1_000_000;
