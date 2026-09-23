// Тестовые данные прототипа. Не являются рыночными котировками и не являются рекомендацией.

export type InstrumentType = "Акции" | "Облигации" | "Фонды" | "Фьючерсы";

export interface Instrument {
  id: string;
  ticker: string;
  name: string;
  type: InstrumentType;
  open: number; // цена открытия дня
  color: string; // цвет «монограммы» вместо логотипа эмитента
  sector: string;
  about: string;
  /** Для реальной торговли нужно тестирование неквалифицированного инвестора */
  needsTest?: boolean;
}

export const INSTRUMENTS: Instrument[] = [
  { id: "VTBR", ticker: "VTBR", name: "ВТБ", type: "Акции", open: 92.3, color: "#1D4ED8", sector: "Финансы", about: "Один из крупнейших банков страны. Розничный и корпоративный бизнес, финансовые услуги." },
  { id: "SBER", ticker: "SBER", name: "Сбербанк", type: "Акции", open: 305.8, color: "#16A34A", sector: "Финансы", about: "Крупнейший банк страны. Акции входят в индекс Мосбиржи." },
  { id: "GAZP", ticker: "GAZP", name: "Газпром", type: "Акции", open: 131.2, color: "#0284C7", sector: "Энергетика", about: "Добыча и транспортировка природного газа." },
  { id: "LKOH", ticker: "LKOH", name: "Лукойл", type: "Акции", open: 7088, color: "#DC2626", sector: "Энергетика", about: "Нефтяная компания полного цикла." },
  { id: "YDEX", ticker: "YDEX", name: "Яндекс", type: "Акции", open: 4175, color: "#EAB308", sector: "Технологии", about: "Технологическая компания: поиск, сервисы, облака." },
  { id: "MOEX", ticker: "MOEX", name: "Московская биржа", type: "Акции", open: 221.4, color: "#334155", sector: "Финансы", about: "Оператор крупнейшей биржевой площадки страны." },
  { id: "MGNT", ticker: "MGNT", name: "Магнит", type: "Акции", open: 5410, color: "#E11D48", sector: "Ритейл", about: "Сеть продуктовых магазинов." },
  { id: "OFZ26238", ticker: "SU26238", name: "ОФЗ 26238", type: "Облигации", open: 61.42, color: "#475569", sector: "Госдолг", about: "Облигация федерального займа. Цена указана в % от номинала × 10 для наглядности." },
  { id: "RU000A", ticker: "RU000A10", name: "Облигация ВДО-1", type: "Облигации", open: 998.5, color: "#7C3AED", sector: "Корпоративные", about: "Корпоративная облигация с фиксированным купоном." },
  { id: "LQDT", ticker: "LQDT", name: "Фонд денежного рынка", type: "Фонды", open: 1.782, color: "#0EA5E9", sector: "Денежный рынок", about: "Биржевой фонд, вкладывающий в инструменты денежного рынка." },
  { id: "SiZ6", ticker: "Si-12.26", name: "Доллар — рубль, фьючерс", type: "Фьючерсы", open: 9412, color: "#0F766E", sector: "Срочный рынок", about: "Фьючерс на курс доллара. Цена — за один контракт, торговля с плечом.", needsTest: true },
  { id: "BRZ6", ticker: "BR-12.26", name: "Нефть Brent, фьючерс", type: "Фьючерсы", open: 6284, color: "#1E293B", sector: "Срочный рынок", about: "Фьючерс на нефть марки Brent. Высокая волатильность, торговля с плечом.", needsTest: true },
  { id: "EQMX", ticker: "EQMX", name: "Фонд на индекс Мосбиржи", type: "Фонды", open: 132.6, color: "#6366F1", sector: "Индекс", about: "Биржевой фонд, повторяющий индекс Мосбиржи." },
];

export const INSTRUMENT_BY_ID: Record<string, Instrument> = Object.fromEntries(INSTRUMENTS.map((i) => [i.id, i]));

export const INITIAL_PRICES: Record<string, number> = {
  VTBR: 95.1,
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
  SiZ6: 9458,
  BRZ6: 6241,
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

// Реальный брокерский счёт нового клиента: пустой — сначала пополнение, потом первая покупка
export const REAL_ACCOUNT = {
  number: "···4821",
  cash: 0,
  positions: [] as Position[],
  history: [] as Operation[],
  docs: [{ id: "d0", title: "Уведомление об открытии счёта", period: "Сентябрь 2026", status: "ready", ts: now - 2 * DAY }] as Doc[],
};

export const DOC_TYPES = [
  { id: "report", title: "Брокерский отчёт", hint: "Все сделки и движения за период" },
  { id: "ndfl", title: "Справка о доходах (2-НДФЛ)", hint: "Для налоговой и банка" },
  { id: "account", title: "Справка о наличии счёта", hint: "Реквизиты и дата открытия" },
  { id: "statement", title: "Выписка по счёту", hint: "Остатки ценных бумаг и денег" },
];

export const DOC_PERIODS = ["Месяц", "Квартал", "Год"];

export const VIRTUAL_START_CASH = 1_000_000;
