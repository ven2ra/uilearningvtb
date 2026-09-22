const money = new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const whole = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

export function fmtMoney(value: number, opts: { sign?: boolean; whole?: boolean } = {}) {
  const f = opts.whole ? whole : money;
  const abs = f.format(Math.abs(value));
  const sign = value < 0 ? "−" : opts.sign && value > 0 ? "+" : "";
  return `${sign}${abs} ₽`;
}

export function fmtPct(value: number, sign = true) {
  const abs = money.format(Math.abs(value));
  const s = value < 0 ? "−" : sign && value > 0 ? "+" : "";
  return `${s}${abs}%`;
}

export function fmtQty(n: number) {
  return `${whole.format(n)} шт.`;
}

export function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

export function signOf(n: number): "pos" | "neg" | "zero" {
  return n > 0.00001 ? "pos" : n < -0.00001 ? "neg" : "zero";
}
