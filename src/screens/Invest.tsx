import { useMemo, useState } from "react";
import { useApp } from "../state/AppState";
import { INSTRUMENTS, INSTRUMENT_BY_ID, type InstrumentType, type Operation } from "../lib/data";
import { PERIODS, series, type Period } from "../lib/chart";
import { fmtDate, fmtMoney, fmtQty, fmtTime } from "../lib/format";
import Icon, { type IconName } from "../ui/Icons";
import { Badge, Button, Change, LineChart, Monogram, Page, Segmented, SectionTitle, Sparkline, TopBar, VirtualTag, cx } from "../ui/kit";

// ================= Портфель =================
export function Portfolio() {
  const app = useApp();
  const training = app.mode === "training";
  const { positions, cash } = app.account;
  const profit = app.positionsValue - app.investedCost;
  const profitPct = app.investedCost ? (profit / app.investedCost) * 100 : 0;

  const byType = useMemo(() => {
    const m: Record<string, number> = { Акции: 0, Облигации: 0, Фонды: 0 };
    positions.forEach((p) => (m[INSTRUMENT_BY_ID[p.id].type] += p.qty * app.prices[p.id]));
    return [
      { label: "Акции", value: m["Акции"], color: "var(--accent)" },
      { label: "Облигации", value: m["Облигации"], color: "#0EA5E9" },
      { label: "Фонды", value: m["Фонды"], color: "#F59E0B" },
      { label: "Рубли", value: cash, color: "var(--border-strong)" },
    ];
  }, [positions, cash, app.prices]);
  const total = app.portfolioValue || 1;

  return (
    <>
      <TopBar title={training ? "Виртуальный портфель" : "Портфель"} subtitle={training ? "Учебный счёт" : "Брокерский счёт ···4821"} />
      <Page>
        <section data-tour="portfolio-total" className={cx("mt-4 rounded-l border p-5", training ? "border-tr-border bg-tr-surface" : "border-line-subtle bg-surface")}>
          <div className="flex items-center justify-between text-[13px] text-ink-2">
            <span>Стоимость</span>
            {training && <VirtualTag />}
          </div>
          <div className="num text-[32px] font-bold leading-10 tracking-tight">{fmtMoney(app.portfolioValue)}</div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
            <span>
              <span className="text-ink-3">Доход </span>
              <Change value={profit} pct={profitPct} />
            </span>
            <span>
              <span className="text-ink-3">Свободно </span>
              <span className="num font-semibold">{fmtMoney(cash)}</span>
            </span>
          </div>
        </section>

        <section data-tour="portfolio-alloc" className="mt-3 rounded-l border border-line-subtle bg-surface p-4">
          <div className="mb-3 text-[13px] font-semibold text-ink-2">Структура</div>
          <div className="flex h-3 overflow-hidden rounded-full bg-muted">
            {byType.map((b) => (
              <div key={b.label} style={{ width: `${(b.value / total) * 100}%`, background: b.color }} className="h-full transition-[width] duration-300" />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-[13px]">
            {byType.map((b) => (
              <div key={b.label} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: b.color }} />
                <span className="text-ink-2">{b.label}</span>
                <span className="num ml-auto pr-3 font-semibold">{((b.value / total) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </section>

        <SectionTitle>Активы</SectionTitle>
        <div data-tour="portfolio-list" className="overflow-hidden rounded-l border border-line-subtle bg-surface">
          {positions.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-l bg-muted text-ink-3">
                <Icon name="briefcase" size={26} />
              </span>
              <div className="mt-3 text-[16px] font-semibold">Портфель пока пуст</div>
              <div className="mt-1 text-[13px] text-ink-2">Активы появятся после первой покупки</div>
              <Button className="mt-4" size="m" variant="secondary" onClick={() => app.tab("market")}>
                Открыть рынок
              </Button>
            </div>
          ) : (
            positions.map((p, idx) => {
              const i = INSTRUMENT_BY_ID[p.id];
              const price = app.prices[p.id];
              const pl = (price - p.avg) * p.qty;
              return (
                <button
                  key={p.id}
                  type="button"
                  data-tour={`portfolio-pos-${idx}`}
                  onClick={() => app.go("instrument", { id: p.id })}
                  className="flex w-full items-center gap-3 border-b border-line-subtle px-4 py-3 text-left last:border-0 cursor-pointer active:bg-surface-muted"
                >
                  <Monogram id={p.id} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-medium">{i.name}</div>
                    <div className="num text-[13px] text-ink-2">
                      {fmtQty(p.qty)} · ср. {fmtMoney(p.avg)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="num text-[15px] font-semibold">{fmtMoney(price * p.qty)}</div>
                    <Change value={pl} className="text-[13px]" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </Page>
    </>
  );
}

// ================= Рынок =================
const TYPES: InstrumentType[] = ["Акции", "Облигации", "Фонды"];
export function Market() {
  const app = useApp();
  const [type, setType] = useState<InstrumentType>("Акции");
  const [q, setQ] = useState("");
  const list = INSTRUMENTS.filter((i) => (q ? (i.name + i.ticker).toLowerCase().includes(q.toLowerCase()) : i.type === type));

  return (
    <>
      <TopBar title="Рынок" subtitle="Мосбиржа · тестовые котировки" />
      <Page>
        <label data-tour="market-search" className="mt-4 flex h-11 items-center gap-2 rounded-m border border-line bg-surface px-3 focus-within:border-accent">
          <Icon name="search" size={20} className="text-ink-3" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Название или тикер" className="h-full flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-3" />
          {q && (
            <button type="button" onClick={() => setQ("")} className="text-ink-3 cursor-pointer" aria-label="Очистить">
              <Icon name="x" size={18} />
            </button>
          )}
        </label>
        {!q && (
          <div className="mt-3">
            <Segmented tour="market-segments" options={TYPES} value={type} onChange={setType} />
          </div>
        )}
        <div className="mt-3 overflow-hidden rounded-l border border-line-subtle bg-surface">
          {list.length === 0 && <div className="p-6 text-center text-[14px] text-ink-2">Ничего не нашлось</div>}
          {list.map((i, idx) => {
            const price = app.prices[i.id];
            const mv = app.moves[i.id];
            return (
              <button
                key={i.id}
                type="button"
                data-tour={idx === 0 ? "market-first" : undefined}
                onClick={() => app.go("instrument", { id: i.id })}
                className="flex w-full items-center gap-3 border-b border-line-subtle px-4 py-3 text-left last:border-0 cursor-pointer active:bg-surface-muted"
              >
                <Monogram id={i.id} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-medium">{i.name}</div>
                  <div className="text-[13px] text-ink-2">{i.ticker}</div>
                </div>
                <Sparkline data={series(i.id, "1Д", price, 24)} />
                <div className="w-[92px] text-right">
                  <div key={price} className="num rounded-[4px] text-[15px] font-semibold" style={{ animation: mv ? `flash-${mv} 900ms var(--ease)` : undefined }}>
                    {fmtMoney(price)}
                  </div>
                  <Change pct={((price - i.open) / i.open) * 100} className="text-[13px]" />
                </div>
              </button>
            );
          })}
        </div>
      </Page>
    </>
  );
}

// ================= Карточка инструмента =================
export function Instrument({ id }: { id: string }) {
  const app = useApp();
  const i = INSTRUMENT_BY_ID[id];
  const [period, setPeriod] = useState<Period>("1Д");
  const price = app.prices[id];
  const data = useMemo(() => series(id, period, price, 60), [id, period, price]);
  const periodChange = ((data[data.length - 1] - data[0]) / data[0]) * 100;
  const pos = app.account.positions.find((p) => p.id === id);
  const training = app.mode === "training";

  const openTrade = (side: "buy" | "sell") => {
    if (!training) {
      app.setDealInfoOpen(true);
      return;
    }
    app.go("trade", { id, side });
  };

  return (
    <>
      <TopBar back title={i.name} subtitle={`${i.ticker} · ${i.type}`} />
      <Page className="pb-28">
        <section data-tour="instr-price" className="mt-4 flex items-center gap-3">
          <Monogram id={id} size={48} />
          <div>
            <div className="num text-[24px] font-bold leading-8 tracking-tight">{fmtMoney(price)}</div>
            <div className="text-[13px]">
              <Change value={price - i.open} pct={((price - i.open) / i.open) * 100} /> <span className="text-ink-3">сегодня</span>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-l border border-line-subtle bg-surface p-3">
          <div className="mb-1 flex items-center justify-between px-1 text-[12px] text-ink-2">
            <span>За период</span>
            <Change pct={periodChange} />
          </div>
          <LineChart data={data} />
          <div className="mt-2">
            <Segmented
              tour="chart-periods"
              options={PERIODS}
              value={period}
              onChange={(p) => {
                setPeriod(p);
                if (p === "1Г") app.emit("do:period-year");
              }}
            />
          </div>
        </section>

        {pos && (
          <section className={cx("mt-3 rounded-l border p-4", training ? "border-tr-border bg-tr-surface" : "border-line-subtle bg-surface")}>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink-2">В портфеле</span>
              {training && <VirtualTag />}
            </div>
            <div className="mt-1 flex items-end justify-between">
              <div>
                <div className="num text-[20px] font-semibold">{fmtMoney(price * pos.qty)}</div>
                <div className="num text-[13px] text-ink-2">
                  {fmtQty(pos.qty)} · средняя {fmtMoney(pos.avg)}
                </div>
              </div>
              <Change value={(price - pos.avg) * pos.qty} pct={((price - pos.avg) / pos.avg) * 100} className="text-[13px]" />
            </div>
          </section>
        )}

        <section className="mt-3 grid grid-cols-2 gap-2">
          {[
            ["Открытие", fmtMoney(i.open)],
            ["Макс. за день", fmtMoney(Math.max(...series(id, "1Д", price, 60)))],
            ["Мин. за день", fmtMoney(Math.min(...series(id, "1Д", price, 60)))],
            ["Лот", "1 шт."],
          ].map(([k, v]) => (
            <div key={k} className="rounded-l border border-line-subtle bg-surface p-3">
              <div className="text-[12px] text-ink-3">{k}</div>
              <div className="num text-[15px] font-semibold">{v}</div>
            </div>
          ))}
        </section>

        <section className="mt-3 rounded-l border border-line-subtle bg-surface p-4">
          <div className="text-[15px] font-semibold">О компании</div>
          <p className="mt-1 text-[13px] leading-5 text-ink-2">{i.about}</p>
          <div className="mt-2">
            <Badge>{i.sector}</Badge>
          </div>
        </section>
      </Page>

      <div data-tour="trade-buttons" className="sticky bottom-0 z-[120] flex gap-2 border-t border-line-subtle bg-surface/95 p-3 backdrop-blur">
        <button
          type="button"
          data-tour="btn-sell"
          onClick={() => openTrade("sell")}
          disabled={training && !pos}
          className="h-12 flex-1 rounded-m bg-muted text-[15px] font-semibold text-ink disabled:text-ink-4 cursor-pointer disabled:cursor-not-allowed"
        >
          Продать
        </button>
        <button type="button" data-tour="btn-buy" onClick={() => openTrade("buy")} className="h-12 flex-1 rounded-m bg-accent text-[15px] font-semibold text-white active:bg-accent-pressed cursor-pointer">
          {training ? "Купить виртуально" : "Купить"}
        </button>
      </div>
    </>
  );
}

// ================= Заявка (только тренировка) =================
const SIDES = ["Купить", "Продать"] as const;
export function Trade({ id, side: initialSide }: { id: string; side: "buy" | "sell" }) {
  const app = useApp();
  const i = INSTRUMENT_BY_ID[id];
  const [side, setSide] = useState(initialSide);
  const [qty, setQty] = useState(side === "buy" ? 10 : 1);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ side: "buy" | "sell"; qty: number; sum: number } | null>(null);
  const price = app.prices[id];
  const sum = price * qty;
  const fee = sum * 0.0005;
  const pos = app.account.positions.find((p) => p.id === id);
  const available = side === "buy" ? Math.floor(app.account.cash / (price * 1.0005)) : pos?.qty ?? 0;

  if (done) {
    return (
      <>
        <TopBar title="Заявка исполнена" />
        <Page className="flex flex-col items-center pt-10 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-surface text-success anim-pop">
            <Icon name="check" size={34} />
          </span>
          <h2 className="mt-4 text-[24px] font-bold leading-8">{done.side === "buy" ? "Покупка" : "Продажа"} выполнена</h2>
          <p className="mt-1 text-[15px] text-ink-2">
            {i.name} · {fmtQty(done.qty)} на {fmtMoney(done.sum)}
          </p>
          <div className="mt-3">
            <Badge tone="training">Виртуальная сделка · реальные деньги не использовались</Badge>
          </div>
          <div className="mt-8 flex w-full flex-col gap-2">
            <Button full onClick={() => app.tab("portfolio")}>
              Открыть портфель
            </Button>
            <Button full variant="tertiary" onClick={app.back}>
              К инструменту
            </Button>
          </div>
        </Page>
      </>
    );
  }

  const submit = () => {
    const err = app.trade(id, side, qty);
    setError(err);
    if (!err) setDone({ side, qty, sum });
  };

  return (
    <>
      <TopBar back title={side === "buy" ? "Покупка" : "Продажа"} subtitle={`${i.name} · виртуальная заявка`} />
      <Page>
        <div className="mt-4">
          <Segmented
            options={SIDES}
            value={side === "buy" ? "Купить" : "Продать"}
            onChange={(v) => {
              setSide(v === "Купить" ? "buy" : "sell");
              setError(null);
            }}
          />
        </div>

        <section className="mt-3 flex items-center gap-3 rounded-l border border-line-subtle bg-surface p-4">
          <Monogram id={id} />
          <div className="flex-1">
            <div className="text-[15px] font-semibold">{i.name}</div>
            <div className="text-[13px] text-ink-2">Рыночная цена</div>
          </div>
          <div className="num text-[17px] font-semibold">{fmtMoney(price)}</div>
        </section>

        <section data-tour="trade-qty" className={cx("mt-3 rounded-l border bg-surface p-4", error ? "border-error anim-shake" : "border-line-subtle")}>
          <div className="text-[13px] text-ink-2">Количество, шт.</div>
          <div className="mt-2 flex items-center gap-3">
            <button type="button" onClick={() => setQty((q) => Math.max(0, q - 1))} className="flex h-11 w-11 items-center justify-center rounded-m bg-muted cursor-pointer" aria-label="Меньше">
              <Icon name="minus" />
            </button>
            <input
              inputMode="numeric"
              value={qty}
              onChange={(e) => {
                setQty(Math.max(0, parseInt(e.target.value.replace(/\D/g, "") || "0", 10)));
                setError(null);
              }}
              className="num h-11 min-w-0 flex-1 rounded-m border border-line text-center text-[20px] font-semibold outline-none focus:border-accent"
            />
            <button type="button" onClick={() => setQty((q) => q + 1)} className="flex h-11 w-11 items-center justify-center rounded-m bg-muted cursor-pointer" aria-label="Больше">
              <Icon name="plus" />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between text-[12px] text-ink-2">
            <span>
              Доступно: <span className="num font-semibold">{fmtQty(available)}</span>
            </span>
            <div className="flex gap-1">
              {[1, 10, 100].map((n) => (
                <button key={n} type="button" onClick={() => setQty(n)} className="h-7 rounded-s bg-muted px-2 font-semibold cursor-pointer">
                  {n}
                </button>
              ))}
            </div>
          </div>
          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-m bg-error-surface px-3 py-2 text-[13px] font-medium text-error" role="alert">
              <Icon name="alert" size={18} />
              {error}
            </div>
          )}
        </section>

        <section data-tour="trade-total" className="mt-3 rounded-l border border-line-subtle bg-surface p-4 text-[14px]">
          <Row k="Сумма" v={fmtMoney(sum)} />
          <Row k="Комиссия 0,05%" v={fmtMoney(fee)} />
          <div className="my-2 border-t border-line-subtle" />
          <Row k={side === "buy" ? "Итого спишется" : "Итого поступит"} v={fmtMoney(side === "buy" ? sum + fee : sum - fee)} bold />
          <Row k="Виртуальных средств" v={fmtMoney(app.account.cash)} />
        </section>

        <div className="mt-3 flex items-start gap-2 rounded-m bg-tr-surface p-3 text-[12px] leading-[18px] text-tr-text border border-tr-border">
          <Icon name="shield" size={18} className="shrink-0" />
          Это тренировка. Сделка виртуальная — настоящие деньги и ценные бумаги не затрагиваются.
        </div>

        <Button full className="mt-4" data-tour="trade-submit" onClick={submit}>
          {side === "buy" ? "Купить" : "Продать"} виртуально · {fmtMoney(side === "buy" ? sum + fee : sum - fee)}
        </Button>
      </Page>
    </>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-ink-2">{k}</span>
      <span className={cx("num", bold ? "text-[16px] font-bold" : "font-semibold")}>{v}</span>
    </div>
  );
}

// ================= История =================
const OP_ICON: Record<Operation["kind"], IconName> = {
  buy: "cart",
  sell: "arrowUp",
  topup: "arrowDown",
  withdraw: "arrowUp",
  coupon: "wallet",
  dividend: "wallet",
};

const HISTORY_FILTERS = ["Все", "Сделки", "Деньги"] as const;

export function History() {
  const app = useApp();
  const training = app.mode === "training";
  const [filter, setFilter] = useState<"Все" | "Сделки" | "Деньги">("Все");
  const list = app.account.history.filter((o) =>
    filter === "Все" ? true : filter === "Сделки" ? o.kind === "buy" || o.kind === "sell" : o.kind !== "buy" && o.kind !== "sell",
  );
  const groups = list.reduce<Record<string, Operation[]>>((acc, o) => {
    const key = fmtDate(o.ts);
    (acc[key] ??= []).push(o);
    return acc;
  }, {});

  return (
    <>
      <TopBar title="История операций" subtitle={training ? "Только виртуальные операции" : undefined} />
      <Page>
        <div className="mt-4">
          <Segmented options={HISTORY_FILTERS} value={filter} onChange={setFilter} />
        </div>
        <div data-tour="history-list" className="mt-3 min-h-[120px]">
          {list.length === 0 && (
            <div className="flex flex-col items-center rounded-l border border-line-subtle bg-surface px-6 py-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-l bg-muted text-ink-3">
                <Icon name="clock" size={26} />
              </span>
              <div className="mt-3 text-[16px] font-semibold">Операций пока нет</div>
              <div className="mt-1 text-[13px] text-ink-2">Здесь появятся пополнения, выводы и сделки</div>
            </div>
          )}
          {Object.entries(groups).map(([date, ops]) => (
            <div key={date} className="mb-3">
              <div className="mb-1.5 px-1 text-[13px] font-semibold text-ink-2">{date}</div>
              <div className="overflow-hidden rounded-l border border-line-subtle bg-surface">
                {ops.map((o) => (
                  <div key={o.id} className="flex items-center gap-3 border-b border-line-subtle px-4 py-3 last:border-0">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-m bg-muted text-ink-2">
                      <Icon name={OP_ICON[o.kind]} size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15px] font-medium">{o.title}</div>
                      <div className="truncate text-[12px] text-ink-2">
                        {fmtTime(o.ts)}
                        {o.detail ? ` · ${o.detail}` : ""}
                      </div>
                    </div>
                    <div className={cx("num shrink-0 text-[15px] font-semibold", o.amount > 0 ? "text-success" : "text-ink")}>{fmtMoney(o.amount, { sign: true })}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Page>
    </>
  );
}

