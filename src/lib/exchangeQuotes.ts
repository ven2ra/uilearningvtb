import { useSyncExternalStore } from "react";
import reference from "./exchangeReference.json";
import stocks from "./exchangeStocks.json";

const number = (value: string) => Number(value.replace(/\s/g, "").replace(",", ".").replace(/[^\d.+-]/g, ""));
export const exchangeInstruments = [...new Map([...reference.favorites, ...stocks].map(item => [item.subtitle, item])).values()].map(item => {
  const initial = number(item.value);
  const change = number(item.change.split("•")[0]);
  return { ...item, id: item.subtitle, initial, open: initial - change, decimals: item.value.split(",")[1]?.replace(/\D/g, "").length ?? 2, currency: ["USD000UTSTOM", "EUR_RUB__TOM"].includes(item.subtitle) };
});
export type ExchangeInstrument = typeof exchangeInstruments[number];
export function money(value: number, decimals = 2) { return `${value.toLocaleString("ru-RU", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} ₽`; }
export function quoteChange(item: ExchangeInstrument, price: number) {
  const change = price - item.open;
  return `${change >= 0 ? "+" : "−"}${money(Math.abs(change), item.decimals)} • ${Math.abs(change / item.open * 100).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}
function history(item: ExchangeInstrument) {
  return Array.from({ length: 96 }, (_, index) => {
    const t = index / 95;
    return item.open + (item.initial - item.open) * t + Math.sin(index * 1.7 + item.initial) * item.initial * .0018 * Math.sin(Math.PI * t);
  });
}
let snapshot = Object.fromEntries(exchangeInstruments.map(item => [item.id, { price: item.initial, points: history(item), updated: Date.now(), demand: 34 }]));
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) timer = setInterval(() => {
    if (document.hidden) return;
    snapshot = Object.fromEntries(exchangeInstruments.map(item => {
      const previous = snapshot[item.id];
      const step = Math.max(10 ** -item.decimals, item.initial * .0006);
      const price = Number(Math.max(item.initial * .94, Math.min(item.initial * 1.06, previous.price + (Math.random() - .5) * step * 2)).toFixed(item.decimals));
      return [item.id, { price, points: [...previous.points.slice(-95), price], updated: Date.now(), demand: Math.max(20, Math.min(80, previous.demand + (Math.random() - .5) * 6)) }];
    }));
    listeners.forEach(notify => notify());
  }, 2500);
  return () => { listeners.delete(listener); if (!listeners.size) { clearInterval(timer); timer = undefined; } };
}
export function useExchangeQuotes() { return useSyncExternalStore(subscribe, () => snapshot); }
