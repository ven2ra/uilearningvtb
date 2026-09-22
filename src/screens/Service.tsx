import { useState } from "react";
import { useApp } from "../state/AppState";
import { DOC_PERIODS, DOC_TYPES } from "../lib/data";
import { fmtDate, fmtMoney } from "../lib/format";
import Icon from "../ui/Icons";
import { Badge, Button, ListRow, Page, Segmented, TopBar, cx } from "../ui/kit";

// ================= Пополнить / Вывести =================
export function MoveMoney({ kind }: { kind: "topup" | "withdraw" }) {
  const app = useApp();
  const training = app.mode === "training";
  const [amount, setAmount] = useState(kind === "topup" ? (training ? "50000" : "5000") : "");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);
  const value = parseInt(amount.replace(/\D/g, "") || "0", 10);
  const topup = kind === "topup";
  const t = topup ? "topup" : "withdraw";

  if (done !== null) {
    const nextBuy = topup && !training && !app.buyQuest.done;
    return (
      <>
        <TopBar title={topup ? "Пополнение" : "Вывод"} />
        <Page className="flex flex-col items-center pt-10 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-surface text-success anim-pop">
            <Icon name="check" size={34} />
          </span>
          <h2 className="mt-4 text-[24px] font-bold">{topup ? "Счёт пополнен" : "Деньги выведены"}</h2>
          <p className="num mt-1 text-[17px] font-semibold">{fmtMoney(done, { sign: false })}</p>
          <div className="mt-3">
            {training ? <Badge tone="training">Виртуальная операция</Badge> : <Badge tone="accent">Карта ВТБ ··1234 → брокерский счёт</Badge>}
          </div>
          {!training && <p className="mt-2 text-[12px] text-ink-3">В прототипе операция имитируется</p>}

          {nextBuy && (
            <div className="mt-6 w-full rounded-l border border-line-subtle bg-surface p-4 text-left anim-rise" style={{ animationDelay: "200ms" }}>
              <div className="text-[12px] font-semibold uppercase tracking-wide text-brand">Следующий шаг</div>
              <div className="mt-0.5 text-[17px] font-semibold leading-6">Первая покупка на бирже</div>
              <p className="mt-1 text-[13px] leading-5 text-ink-2">Начать можно с минимума — пай фонда ликвидности стоит около 2 ₽. Или выберите любую акцию.</p>
              <div className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-[#B45309]">
                <Icon name="trophy" size={14} /> За первую покупку — достижение
              </div>
            </div>
          )}

          <div className="mt-6 flex w-full flex-col gap-2">
            {nextBuy ? (
              <>
                <Button full data-tour="go-market" onClick={() => app.tab("market")}>
                  Перейти на биржу
                </Button>
                <Button full variant="tertiary" onClick={() => app.tab("home")}>
                  Позже
                </Button>
              </>
            ) : (
              <>
                <Button full onClick={() => app.tab("home")}>
                  На главную
                </Button>
                <Button full variant="tertiary" onClick={() => app.tab("history")}>
                  История операций
                </Button>
              </>
            )}
          </div>
        </Page>
      </>
    );
  }

  const submit = () => {
    const err = app.moveMoney(kind, value);
    setError(err);
    if (!err) setDone(value);
  };

  return (
    <>
      <TopBar back title={topup ? "Пополнить счёт" : "Вывести деньги"} subtitle={training ? "Виртуальная операция" : "Брокерский счёт ···4821"} />
      <Page>
        {!topup && (
          <div className="mt-4 rounded-l border border-line-subtle bg-surface p-4">
            <div className="text-[13px] text-ink-2">Доступно для вывода</div>
            <div className="num text-[20px] font-semibold">{fmtMoney(app.account.cash)}</div>
          </div>
        )}

        <section data-tour={`${t}-amount`} className={cx("mt-4 rounded-l border bg-surface p-4", error ? "border-error anim-shake" : "border-line-subtle")}>
          <label className="text-[13px] text-ink-2" htmlFor="amount">
            Сумма
          </label>
          <div className="mt-1 flex items-center gap-2 border-b-2 border-accent pb-1">
            <input
              id="amount"
              inputMode="numeric"
              value={value ? value.toLocaleString("ru-RU") : ""}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              placeholder="0"
              className="num min-w-0 flex-1 bg-transparent text-[32px] font-bold leading-10 outline-none placeholder:text-ink-4"
            />
            <span className="text-[24px] font-bold text-ink-3">₽</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(topup ? (training ? [10000, 50000, 100000] : [1000, 5000, 10000]) : [5000, 25000]).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setAmount(String(n));
                  setError(null);
                }}
                className={cx("h-8 rounded-s px-3 text-[13px] font-semibold cursor-pointer", value === n ? "bg-accent text-white" : "bg-muted text-ink")}
              >
                {n.toLocaleString("ru-RU")} ₽
              </button>
            ))}
            {!topup && (
              <button type="button" onClick={() => setAmount(String(Math.floor(app.account.cash)))} className="h-8 rounded-s bg-muted px-3 text-[13px] font-semibold cursor-pointer">
                Всё
              </button>
            )}
          </div>
          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-m bg-error-surface px-3 py-2 text-[13px] font-medium text-error" role="alert">
              <Icon name="alert" size={18} />
              {error}
            </div>
          )}
        </section>

        <section data-tour={`${t}-source`} className="mt-3 overflow-hidden rounded-l border border-line-subtle bg-surface">
          <ListRow icon="card" tone="neutral" title={training ? "Учебная карта ··0000" : "Карта ВТБ ··1234"} subtitle={topup ? "Откуда списать" : "Куда зачислить"} />
        </section>

        <div className="mt-3 flex items-start gap-2 px-1 text-[12px] leading-[18px] text-ink-2">
          <Icon name="info" size={16} className="mt-0.5 shrink-0" />
          {topup ? "Без комиссии. Деньги поступят на брокерский счёт сразу." : "Без комиссии. Деньги придут на карту в течение дня."}
        </div>

        <Button full className="mt-5" data-tour={`${t}-submit`} onClick={submit} disabled={!value}>
          {topup ? "Пополнить" : "Вывести"} {value ? fmtMoney(value, { whole: true }) : ""}
        </Button>
        {training ? (
          <p className="mt-2 text-center text-[12px] text-tr-text">Операция виртуальная — реальные деньги не списываются</p>
        ) : (
          <p className="mt-2 text-center text-[12px] text-ink-3">В прототипе операция имитируется</p>
        )}
      </Page>
    </>
  );
}

// ================= Документы =================
export function Documents() {
  const app = useApp();
  const ready = app.account.docs.filter((d) => d.status === "ready").length;
  const pending = app.account.docs.filter((d) => d.status === "pending").length;
  return (
    <>
      <TopBar back title="Отчёты и справки" />
      <Page>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" data-tour="docs-order" onClick={() => app.go("doc-order")} className="flex h-[132px] flex-col justify-between rounded-l border border-line-subtle bg-surface p-4 text-left cursor-pointer active:bg-surface-muted">
            <span className="flex h-11 w-11 items-center justify-center rounded-l bg-accent-subtle text-accent-text">
              <Icon name="filePlus" />
            </span>
            <span>
              <span className="block text-[16px] font-semibold leading-5">Заказать документ</span>
              <span className="block text-[12px] text-ink-2">Отчёты, справки, выписки</span>
            </span>
          </button>
          <button type="button" data-tour="docs-ready" onClick={() => app.go("doc-ready")} className="relative flex h-[132px] flex-col justify-between rounded-l border border-line-subtle bg-surface p-4 text-left cursor-pointer active:bg-surface-muted">
            <span className="flex h-11 w-11 items-center justify-center rounded-l bg-accent-subtle text-accent-text">
              <Icon name="download" />
            </span>
            {ready > 0 && <span className="num absolute right-3 top-3 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white">{ready}</span>}
            <span>
              <span className="block text-[16px] font-semibold leading-5">Скачать готовые</span>
              <span className="block text-[12px] text-ink-2">{pending ? `${pending} готовится` : "Готовые документы"}</span>
            </span>
          </button>
        </div>

        <div className="mb-2 mt-6 px-1 text-[15px] font-semibold">Часто заказывают</div>
        <div className="overflow-hidden rounded-l border border-line-subtle bg-surface">
          {DOC_TYPES.slice(0, 3).map((d) => (
            <ListRow key={d.id} icon="file" tone="neutral" title={d.title} subtitle={d.hint} onClick={() => app.go("doc-order")} />
          ))}
        </div>
      </Page>
    </>
  );
}

export function DocOrder() {
  const app = useApp();
  const [type, setType] = useState<string | null>(DOC_TYPES[0].id);
  const [period, setPeriod] = useState(DOC_PERIODS[0]);
  const [done, setDone] = useState(false);
  const doc = DOC_TYPES.find((d) => d.id === type);

  if (done) {
    return (
      <>
        <TopBar title="Документ заказан" />
        <Page className="flex flex-col items-center pt-10 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-surface text-success anim-pop">
            <Icon name="check" size={34} />
          </span>
          <h2 className="mt-4 text-[24px] font-bold">Заказ принят</h2>
          <p className="mt-1 text-[15px] text-ink-2">{doc?.title} будет готов через несколько секунд</p>
          <div className="mt-8 flex w-full flex-col gap-2">
            <Button full onClick={() => app.replace("doc-ready")}>
              К готовым документам
            </Button>
            <Button full variant="tertiary" onClick={app.back}>
              Назад
            </Button>
          </div>
        </Page>
      </>
    );
  }

  return (
    <>
      <TopBar back title="Заказать документ" />
      <Page>
        <div data-tour="doc-types" className="mt-4 overflow-hidden rounded-l border border-line-subtle bg-surface">
          {DOC_TYPES.map((d) => (
            <button key={d.id} type="button" onClick={() => setType(d.id)} className="flex w-full items-center gap-3 border-b border-line-subtle px-4 py-3 text-left last:border-0 cursor-pointer">
              <span className={cx("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", type === d.id ? "border-accent" : "border-line-strong")}>
                {type === d.id && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
              </span>
              <span className="flex-1">
                <span className="block text-[15px] font-medium">{d.title}</span>
                <span className="block text-[12px] text-ink-2">{d.hint}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="mb-2 mt-5 px-1 text-[13px] font-semibold text-ink-2">Период</div>
        <Segmented options={DOC_PERIODS} value={period} onChange={setPeriod} />
        <Button
          full
          className="mt-6"
          data-tour="doc-submit"
          disabled={!doc}
          onClick={() => {
            app.orderDoc(doc!.title, period === "Месяц" ? "Сентябрь 2026" : period === "Квартал" ? "III квартал 2026" : "2026 год");
            setDone(true);
          }}
        >
          Заказать
        </Button>
      </Page>
    </>
  );
}

export function DocReady() {
  const app = useApp();
  const docs = app.account.docs;
  return (
    <>
      <TopBar back title="Готовые документы" />
      <Page>
        <div data-tour="docs-list" className="mt-4 overflow-hidden rounded-l border border-line-subtle bg-surface">
          {docs.length === 0 && (
            <div className="flex flex-col items-center px-6 py-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-l bg-muted text-ink-3">
                <Icon name="file" size={26} />
              </span>
              <div className="mt-3 text-[16px] font-semibold">Готовых документов нет</div>
              <div className="mt-1 text-[13px] text-ink-2">Закажите документ — он появится здесь</div>
              <Button className="mt-4" size="m" variant="secondary" onClick={() => app.replace("doc-order")}>
                Заказать документ
              </Button>
            </div>
          )}
          {docs.map((d) => (
            <button
              key={d.id}
              type="button"
              disabled={d.status !== "ready"}
              onClick={() => app.toast({ kind: "success", title: "Документ скачан", text: `${d.title}, ${d.period} (демо-файл)` })}
              className="flex w-full items-center gap-3 border-b border-line-subtle px-4 py-3 text-left last:border-0 cursor-pointer disabled:cursor-default"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-m bg-muted text-ink-2">
                <Icon name="file" size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium">{d.title}</span>
                <span className="block text-[12px] text-ink-2">
                  {d.period} · {fmtDate(d.ts)}
                </span>
              </span>
              {d.status === "ready" ? (
                <span className="flex h-9 w-9 items-center justify-center rounded-m bg-accent-subtle text-accent-text">
                  <Icon name="download" size={20} />
                </span>
              ) : (
                <Badge tone="warning">Готовится</Badge>
              )}
            </button>
          ))}
        </div>
      </Page>
    </>
  );
}
