import type { ButtonHTMLAttributes, ReactNode } from "react";
import Icon, { type IconName } from "./Icons";
import { useApp } from "../state/AppState";
import { fmtMoney, fmtPct, signOf } from "../lib/format";
import { INSTRUMENT_BY_ID } from "../lib/data";
import { referenceImage } from "../components/home/referenceImages";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

// ---------- Button ----------
type BtnVariant = "primary" | "secondary" | "tertiary" | "ghost" | "destructive" | "inverse";
export function Button({
  variant = "primary",
  size = "l",
  icon,
  full,
  className,
  children,
  ...rest
}: { variant?: BtnVariant; size?: "s" | "m" | "l"; icon?: IconName; full?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const v: Record<BtnVariant, string> = {
    primary: "bg-accent text-white active:bg-accent-pressed disabled:bg-muted disabled:text-ink-4",
    secondary: "bg-accent-subtle text-accent-text active:brightness-95",
    tertiary: "bg-muted text-ink active:brightness-95",
    ghost: "bg-transparent text-accent-text border border-line",
    destructive: "bg-error-surface text-error border border-error",
    inverse: "bg-white text-tr-text active:brightness-95",
  };
  const s = { l: "h-12 px-5 text-[15px]", m: "h-10 px-4 text-[13px]", s: "h-9 px-3 text-[13px]" }[size];
  return (
    <button
      type="button"
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-m font-semibold transition-[background-color,transform] duration-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer",
        v[variant],
        s,
        full && "w-full",
        className,
      )}
      {...rest}
    >
      {icon && <Icon name={icon} size={20} />}
      {children}
    </button>
  );
}

// ---------- Кнопка «Помощь» — есть на каждом экране ----------
export function HelpButton({ light }: { light?: boolean }) {
  const { helpPulse } = useApp();
  return (
    <button
      type="button"
      data-tour="help-btn"
      data-help-trigger
      className={cx(
        "flex h-9 items-center gap-1.5 rounded-m px-2.5 text-[13px] font-semibold cursor-pointer",
        light ? "bg-white/15 text-white" : "bg-accent-subtle text-accent-text",
        helpPulse && "anim-pulse",
      )}
      aria-label="Помощь: показать подсказки для этого экрана"
    >
      <Icon name="help" size={18} />
      Помощь
    </button>
  );
}

// ---------- Верхняя панель ----------
export function TopBar({ title, back, right, subtitle }: { title?: string; back?: boolean; right?: ReactNode; subtitle?: string }) {
  const app = useApp();
  return (
    <header className="sticky top-0 z-[100] flex min-h-[56px] items-center gap-2 border-b border-line-subtle bg-surface/95 px-3 backdrop-blur">
      {back && (
        <button type="button" data-tour="back" onClick={app.back} className="flex h-10 w-10 items-center justify-center rounded-m cursor-pointer" aria-label="Назад">
          <Icon name="chevronLeft" />
        </button>
      )}
      <div className={cx("min-w-0 flex-1", !back && "pl-2")}>
        {title && <div className="truncate text-[17px] font-semibold leading-6">{title}</div>}
        {subtitle && <div className="truncate text-[12px] text-ink-2">{subtitle}</div>}
      </div>
      {right}
      <HelpButton />
    </header>
  );
}

// ---------- Карточка ----------
export function Card({ className, children, onClick, tour }: { className?: string; children: ReactNode; onClick?: () => void; tour?: string }) {
  const Cmp = onClick ? "button" : "div";
  return (
    <Cmp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      data-tour={tour}
      className={cx("block w-full rounded-l border border-line-subtle bg-surface p-4 text-left", onClick && "cursor-pointer active:bg-surface-muted", className)}
    >
      {children}
    </Cmp>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between px-1">
      <h2 className="text-[18px] font-semibold leading-6">{children}</h2>
      {action}
    </div>
  );
}

// ---------- Сегменты ----------
export function Segmented<T extends string>({ options, value, onChange, tour, itemTour }: { options: readonly T[]; value: T; onChange: (v: T) => void; tour?: string; itemTour?: (o: T) => string }) {
  return (
    <div data-tour={tour} className="flex rounded-m bg-muted p-0.5" role="tablist">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="tab"
          data-tour={itemTour?.(o)}
          aria-selected={o === value}
          onClick={() => onChange(o)}
          className={cx(
            "h-8 flex-1 rounded-[6px] px-2 text-[13px] font-semibold transition-colors cursor-pointer",
            o === value ? "bg-surface text-ink shadow-e1" : "text-ink-2",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

// ---------- Прогресс ----------
export function ProgressBar({ value, max, className, tone = "accent" }: { value: number; max: number; className?: string; tone?: "accent" | "training" | "white" }) {
  const fill = { accent: "bg-accent", training: "training-stripe", white: "bg-white" }[tone];
  const track = tone === "white" ? "bg-white/25" : "bg-muted";
  return (
    <div className={cx("h-2 overflow-hidden rounded-full", track, className)} role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div className={cx("h-full rounded-full transition-[width] duration-300", fill)} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  );
}

export function ProgressRing({ value, max, size = 72, children }: { value: number; max: number; size?: number; children?: ReactNode }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-muted)" strokeWidth={6} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / max)}
          style={{ transition: "stroke-dashoffset 280ms var(--ease)" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

// ---------- Финансовые значения ----------
// Капсула вместо голого цветного текста — заметный акцент, как в референсе
export function Change({ value, pct, className }: { value?: number; pct?: number; className?: string }) {
  const s = signOf(pct ?? value ?? 0);
  const tone = s === "pos" ? "bg-success-surface text-success" : s === "neg" ? "bg-error-surface text-error" : "bg-muted text-ink-2";
  const rotate = s === "neg" ? 90 : 0;
  return (
    <span className={cx("num inline-flex items-center gap-1 whitespace-nowrap rounded-full py-0.5 pl-1.5 pr-2 font-semibold", tone, className)}>
      {s !== "zero" && <Icon name="trend" size={12} style={{ transform: `rotate(${rotate}deg)` }} />}
      {value !== undefined && fmtMoney(value, { sign: true })}
      {value !== undefined && pct !== undefined && " · "}
      {pct !== undefined && fmtPct(pct)}
    </span>
  );
}

function monogram(name: string) {
  const rest = name.replace(/^(Облигация|Фонд( на)?)\s*/, "");
  return /^\d/.test(rest) ? name[0] : rest[0].toUpperCase();
}

export function Monogram({ id, size = 40 }: { id: string; size?: number }) {
  const i = INSTRUMENT_BY_ID[id];
  const logos: Record<string, string> = { SBER: "asset-018.png", GAZP: "asset-026.png", LKOH: "asset-164.png", YDEX: "asset-028.png", LQDT: "asset-201.png", EQMX: "asset-201.png" };
  if (logos[id]) return <img src={referenceImage(logos[id])} alt="" width={size} height={size} className="shrink-0 rounded-full" />;
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, background: i.color, fontSize: size * 0.34 }}
      aria-hidden="true"
    >
      {monogram(i.name)}
    </div>
  );
}

export function Sparkline({ data, width = 64, height = 28 }: { data: number[]; width?: number; height?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - 2 - ((v - min) / (max - min || 1)) * (height - 4)}`).join(" ");
  const up = data[data.length - 1] >= data[0];
  return (
    <svg width={width} height={height} aria-hidden="true">
      <polyline points={pts} fill="none" stroke={up ? "var(--success)" : "var(--error)"} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

export function LineChart({ data, height = 180 }: { data: number[]; height?: number }) {
  const w = 340;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const y = (v: number) => height - 12 - ((v - min) / (max - min || 1)) * (height - 24);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, y(v)] as const);
  const line = pts.map(([x, yy], i) => `${i ? "L" : "M"}${x.toFixed(1)},${yy.toFixed(1)}`).join(" ");
  const up = data[data.length - 1] >= data[0];
  const color = up ? "var(--success)" : "var(--error)";
  const gid = `g${up ? "u" : "d"}`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="h-auto w-full" preserveAspectRatio="none" role="img" aria-label="График цены">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={w} y1={height * f} y2={height * f} stroke="var(--border-subtle)" strokeDasharray="3 4" />
      ))}
      <path d={`${line} L${w},${height} L0,${height} Z`} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0] - 3} cy={pts[pts.length - 1][1]} r={4} fill={color} stroke="white" strokeWidth={2} />
    </svg>
  );
}

// ---------- Строка списка ----------
export function ListRow({
  icon,
  title,
  subtitle,
  right,
  onClick,
  tour,
  tone = "accent",
}: {
  icon?: IconName;
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  onClick?: () => void;
  tour?: string;
  tone?: "accent" | "neutral" | "training";
}) {
  const iconCls = { accent: "bg-accent-subtle text-accent-text", neutral: "bg-muted text-ink-2", training: "bg-tr-surface text-tr border border-tr-border" }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      data-tour={tour}
      className="flex w-full items-center gap-3 px-4 py-3 text-left cursor-pointer active:bg-surface-muted"
    >
      {icon && (
        <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-m", iconCls)}>
          <Icon name={icon} size={22} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium leading-[22px]">{title}</span>
        {subtitle && <span className="block truncate text-[13px] leading-5 text-ink-2">{subtitle}</span>}
      </span>
      {right ?? <Icon name="chevronRight" size={20} className="text-ink-3" />}
    </button>
  );
}

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("px-4 pb-6", className)}>{children}</div>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "training" | "accent" }) {
  const t = {
    neutral: "bg-muted text-ink-2",
    success: "bg-success-surface text-success",
    warning: "bg-warning-surface text-[#B45309]",
    training: "bg-tr-surface text-tr-text border border-tr-border",
    accent: "bg-accent-subtle text-accent-text",
  }[tone];
  return <span className={cx("inline-flex items-center gap-1 rounded-s px-2 py-0.5 text-[11px] font-semibold leading-4", t)}>{children}</span>;
}

export function VirtualTag() {
  return <Badge tone="training">Виртуальные</Badge>;
}
