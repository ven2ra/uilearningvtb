export type Period = "1Д" | "1Н" | "1М" | "1Г";
export const PERIODS: Period[] = ["1Д", "1Н", "1М", "1Г"];

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

const VOL: Record<Period, number> = { "1Д": 0.004, "1Н": 0.009, "1М": 0.016, "1Г": 0.035 };

/** Детерминированный «ряд котировок», заканчивающийся текущей ценой. */
export function series(id: string, period: Period, last: number, points = 48): number[] {
  const rnd = seeded(hash(id + period));
  const vol = VOL[period];
  const drift = (rnd() - 0.45) * vol * 0.6;
  const vals = [1];
  for (let i = 1; i < points; i++) vals.push(vals[i - 1] * (1 + drift + (rnd() - 0.5) * vol * 2));
  const k = last / vals[vals.length - 1];
  return vals.map((v) => v * k);
}
