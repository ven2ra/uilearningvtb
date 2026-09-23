import { useEffect, useRef, useState } from "react";
import { useApp } from "../state/AppState";
import { INSTRUMENTS, INSTRUMENT_BY_ID } from "../lib/data";
import { STAGES, TASKS, statusFor, tasksUntilNextAchievement } from "../lib/training";
import { ACHIEVEMENTS } from "../lib/achievements";
import { COVER_BY_ID } from "../lib/fincode";
import { fmtMoney, plural } from "../lib/format";
import { series } from "../lib/chart";
import Icon, { type IconName } from "../ui/Icons";
import { Button, Change, HelpButton, Monogram, ProgressBar, SectionTitle, Sparkline, VirtualTag, cx } from "../ui/kit";

export default function Home() {
  const app = useApp();
  const training = app.mode === "training";
  const pct = app.portfolioValue - app.dayChange ? (app.dayChange / (app.portfolioValue - app.dayChange)) * 100 : 0;
  const [hidden, setHidden] = useState(false);
  const cover = COVER_BY_ID[app.finCode.equippedCover] ?? COVER_BY_ID.classic;
  const covered = !training && cover.id !== "classic";

  return (
    <div className="pb-6">
      {/* Шапка */}
      <header className="sticky top-0 z-[100] flex items-center gap-3 bg-page/95 px-4 py-2.5 backdrop-blur">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-subtle text-[14px] font-bold text-accent-text">АД</div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-[12px] text-ink-2">{training ? "Учебный счёт" : "ВТБ Мои Инвестиции"}</div>
          <div className="text-[16px] font-semibold">Анастасия Д.</div>
        </div>
        <AchChip />
        <HelpButton />
      </header>

      <div className="px-4">
        {/* Баланс */}
        <section
          data-tour="balance"
          className={cx("mt-1 rounded-l border p-6 text-center", training ? "border-tr-border bg-tr-surface" : covered ? "border-transparent" : "border-line-subtle bg-surface")}
          style={covered ? { background: cover.gradient } : undefined}
        >
          <span className={cx("text-[13px] font-medium", covered ? "text-white/80" : "text-ink-2")}>{training ? "Виртуальный баланс" : "Стоимость портфеля"}</span>
          <div className="mt-1.5 flex items-center justify-center gap-2">
            <span className={cx("num text-[36px] font-bold leading-none tracking-tight", covered && "text-white")}>{hidden ? "•••• ₽" : fmtMoney(app.portfolioValue)}</span>
            <button
              type="button"
              onClick={() => setHidden((h) => !h)}
              className={cx("flex h-8 w-8 shrink-0 items-center justify-center rounded-full cursor-pointer", covered ? "text-white/80 active:bg-white/15" : "text-ink-3 active:bg-muted")}
              aria-label={hidden ? "Показать сумму" : "Скрыть сумму"}
            >
              <Icon name={hidden ? "eyeOff" : "eye"} size={20} />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-center gap-2 text-[13px]">
            <Change value={app.dayChange} pct={pct} />
            <span className={covered ? "text-white/70" : "text-ink-3"}>за день</span>
          </div>
          <div className="mt-3">
            {training ? (
              <VirtualTag />
            ) : (
              <span className={cx("rounded-full px-2.5 py-1 text-[11px] font-semibold", covered ? "bg-white/15 text-white" : "bg-muted text-ink-2")}>Брокерский ···4821</span>
            )}
          </div>
          {training && <div className="mt-2 text-[12px] text-tr-text">Виртуальные средства. Реальные деньги не списываются.</div>}
        </section>

        {/* Быстрые действия */}
        <div className="mt-3 flex gap-2">
          <QuickAction tour="actions" icon="grid" label="Действия" primary onClick={app.openActions} />
          <QuickAction icon="search" label="Рынок" onClick={() => app.tab("market")} />
          <QuickAction icon="pie" label="Портфель" onClick={() => app.tab("portfolio")} />
        </div>

        {/* Обучение */}
        {!training && <FirstSteps />}
        {training ? <TrainingProgressCard /> : <LearningCard />}
        <FinCodeTeaser />

        {/* Активы */}
        <SectionTitle
          action={
            <button type="button" onClick={() => app.tab("portfolio")} className="text-[13px] font-semibold text-accent-text cursor-pointer">
              Все
            </button>
          }
        >
          Мои активы
        </SectionTitle>
        {app.account.positions.length === 0 ? (
          <div className="flex items-center gap-3 rounded-l border border-line-subtle bg-surface p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-m bg-muted text-ink-3">
              <Icon name="briefcase" size={22} />
            </span>
            <div className="flex-1 text-[13px] leading-5 text-ink-2">Пока нет активов. Они появятся после первой покупки.</div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {app.account.positions.slice(0, 3).map((p) => {
              const price = app.prices[p.id];
              const i = INSTRUMENT_BY_ID[p.id];
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => app.go("instrument", { id: p.id })}
                  className="flex w-full items-center justify-between gap-3 rounded-l border border-line-subtle bg-surface p-4 text-left cursor-pointer active:bg-surface-muted"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Monogram id={p.id} />
                    <div className="min-w-0">
                      <div className="num text-[17px] font-semibold leading-6">{fmtMoney(price * p.qty)}</div>
                      <div className="truncate text-[12px] text-ink-2">
                        {i.name} · {p.qty.toLocaleString("ru-RU")} шт.
                      </div>
                    </div>
                  </div>
                  <Change pct={((price - p.avg) / p.avg) * 100} />
                </button>
              );
            })}
          </div>
        )}

        {/* Популярное */}
        <SectionTitle>Популярное</SectionTitle>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {INSTRUMENTS.slice(0, 6).map((i) => {
            const price = app.prices[i.id];
            return (
              <button key={i.id} type="button" onClick={() => app.go("instrument", { id: i.id })} className="w-[150px] shrink-0 rounded-l border border-line-subtle bg-surface p-3 text-left cursor-pointer active:bg-surface-muted">
                <div className="flex items-center gap-2">
                  <Monogram id={i.id} size={28} />
                  <span className="truncate text-[13px] font-semibold">{i.ticker}</span>
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <div className="num text-[14px] font-semibold">{fmtMoney(price)}</div>
                    <Change pct={((price - i.open) / i.open) * 100} className="text-[12px]" />
                  </div>
                  <Sparkline data={series(i.id, "1Д", price, 20)} width={44} height={24} />
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-4 px-1 text-[11px] leading-4 text-ink-3">Котировки — тестовые данные прототипа и не являются инвестиционной рекомендацией.</p>
      </div>
    </div>
  );
}

/** Счётчик достижений в шапке — напоминает, что награды есть почти за всё */
export function AchChip() {
  const app = useApp();
  const count = app.achievements.length;
  const prev = useRef(count);
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    if (count > prev.current) {
      setPulse(true);
      const t = window.setTimeout(() => setPulse(false), 2400);
      prev.current = count;
      return () => window.clearTimeout(t);
    }
    prev.current = count;
  }, [count]);
  return (
    <button
      type="button"
      data-tour="ach-chip"
      onClick={() => app.go("achievements")}
      className={cx("flex h-9 items-center gap-1 rounded-m bg-warning-surface px-2 text-[13px] font-semibold text-[#B45309] cursor-pointer", pulse && "anim-pulse")}
      aria-label={`Достижения: ${app.achievements.length} из ${ACHIEVEMENTS.length}`}
    >
      <Icon name="trophy" size={18} />
      <span className="num">{app.achievements.length}</span>
    </button>
  );
}

/** «Первые шаги» в реальном приложении: знакомство → пополнение → первая покупка */
function FirstSteps() {
  const app = useApp();
  const steps = [
    { title: "Познакомиться с приложением", done: app.onboarding === "done" || app.has("welcome"), reward: "Добро пожаловать" },
    { title: "Пополнить счёт", done: app.has("first-topup"), reward: "Первое пополнение" },
    { title: "Первая покупка — от 2 ₽", done: app.has("first-buy"), reward: "Первая покупка" },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;
  const nextIdx = steps.findIndex((s) => !s.done);
  const cta =
    nextIdx === 0
      ? { label: "Показать подсказки", fn: () => app.setOnboarding("running") }
      : nextIdx === 1
        ? { label: "Пополнить счёт", fn: () => app.go("topup") }
        : { label: "Перейти на биржу", fn: () => app.tab("market") };
  return (
    <section data-tour="first-steps" className="mt-3 rounded-l border border-line-subtle bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-[18px] font-semibold leading-6">Первые шаги</span>
        <span className="num text-[13px] font-semibold text-ink-2">
          {doneCount}/{steps.length}
        </span>
      </div>
      <ProgressBar value={doneCount} max={steps.length} className="mt-2" />
      <ol className="mt-3 space-y-2">
        {steps.map((s, i) => (
          <li key={s.title} className="flex items-center gap-2.5">
            <span
              className={cx(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                s.done ? "bg-success-surface text-success" : i === nextIdx ? "bg-brand text-white" : "bg-muted text-ink-3",
              )}
            >
              {s.done ? <Icon name="check" size={14} /> : i + 1}
            </span>
            <span className={cx("flex-1 text-[14px]", s.done ? "text-ink-3 line-through" : i === nextIdx ? "font-semibold" : "text-ink-2")}>{s.title}</span>
            <span className={cx("flex items-center gap-1 text-[11px] font-semibold", s.done ? "text-ink-3" : "text-[#B45309]")} title={`Достижение «${s.reward}»`}>
              <Icon name="trophy" size={14} />
            </span>
          </li>
        ))}
      </ol>
      <Button full size="m" className="mt-3" onClick={cta.fn}>
        {cta.label}
      </Button>
    </section>
  );
}

function QuickAction({ icon, label, onClick, primary, tour }: { icon: IconName; label: string; onClick: () => void; primary?: boolean; tour?: string }) {
  return (
    <button
      type="button"
      data-tour={tour}
      onClick={onClick}
      className={cx(
        "flex h-12 flex-1 items-center justify-center gap-2 rounded-full border text-[13px] font-semibold cursor-pointer active:scale-[0.98] transition-transform",
        primary ? "border-transparent bg-accent text-white" : "border-line-subtle bg-surface text-ink",
      )}
    >
      <Icon name={icon} size={20} />
      {label}
    </button>
  );
}

/** Карточка обучения в обычном интерфейсе: старт → возврат к прогрессу → «Готовы продолжить самостоятельно?» */
function LearningCard() {
  const app = useApp();
  const t = app.training;
  const nextTask = TASKS[t.done];
  const nextStage = nextTask ? STAGES[nextTask.stage - 1] : null;
  const until = tasksUntilNextAchievement(t.done);

  if (t.finished && t.readyCardDismissed) {
    return (
      <button
        type="button"
        data-tour="training-card"
        onClick={app.enterTraining}
        className="mt-3 flex w-full items-center gap-3 rounded-l border border-tr-border bg-tr-surface p-3 text-left cursor-pointer"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-m bg-surface text-tr border border-tr-border">
          <Icon name="medal" size={22} />
        </span>
        <span className="flex-1">
          <span className="block text-[15px] font-semibold">Обучение пройдено</span>
          <span className="block text-[13px] text-tr-text">Статус: Инвестор-новичок · 7/7</span>
        </span>
        <Icon name="chevronRight" size={20} className="text-ink-3" />
      </button>
    );
  }

  return (
    <section data-tour="training-card" className="relative mt-3 overflow-hidden rounded-l border border-tr-border bg-tr-surface p-4">
      <div className="training-stripe absolute inset-x-0 top-0 h-1" />
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-l bg-surface text-tr border border-tr-border">
          <Icon name={t.finished ? "medal" : "cap"} size={24} />
        </span>
        <div className="min-w-0 flex-1">
          {!t.started && (
            <>
              <div className="text-[18px] font-semibold leading-6">Пройти обучение</div>
              <div className="text-[13px] leading-5 text-ink-2">Попробуйте инвестировать без риска</div>
            </>
          )}
          {t.started && !t.finished && (
            <>
              <div className="text-[18px] font-semibold leading-6">
                Вы прошли {app.doneStages} из {STAGES.length} этапов
              </div>
              <div className="text-[13px] leading-5 text-ink-2">Следующий этап: {nextStage?.title.toLowerCase()}</div>
            </>
          )}
          {t.finished && (
            <>
              <div className="text-[18px] font-semibold leading-6">Готовы продолжить самостоятельно?</div>
              <div className="text-[13px] leading-5 text-ink-2">Вы прошли все этапы и получили статус «{statusFor(STAGES.length)}»</div>
            </>
          )}
        </div>
      </div>

      {t.started && !t.finished && (
        <div className="mt-3">
          <ProgressBar value={app.doneStages} max={STAGES.length} tone="training" />
          {until && until.left > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-ink-2">
              <Icon name="trophy" size={14} className="text-warning" />
              До достижения «{until.achievement.title}» — {until.left} {plural(until.left, "задание", "задания", "заданий")}
            </div>
          )}
        </div>
      )}

      {!t.started && (
        <div className="mt-3 flex gap-1.5 text-[12px] text-ink-2">
          <span className="rounded-s bg-surface px-2 py-1 border border-tr-border">1 000 000 ₽ виртуальных</span>
          <span className="rounded-s bg-surface px-2 py-1 border border-tr-border">7 этапов</span>
          <span className="rounded-s bg-surface px-2 py-1 border border-tr-border">~5 минут</span>
        </div>
      )}

      <div className={cx("mt-4 flex gap-2", t.finished && "flex-col-reverse")}>
        {!t.finished ? (
          <button type="button" onClick={app.enterTraining} className="h-11 flex-1 rounded-m bg-tr text-[15px] font-semibold text-white cursor-pointer active:brightness-90">
            {t.started ? "Продолжить обучение" : "Начать обучение"}
          </button>
        ) : (
          <>
            <button type="button" onClick={app.restartTraining} className="h-11 w-full rounded-m border border-tr-border bg-surface text-[14px] font-semibold text-tr-text cursor-pointer">
              Повторить обучение
            </button>
            <Button full className="h-11" size="m" variant="primary" onClick={() => app.setTraining((x) => ({ ...x, readyCardDismissed: true }))}>
              Перейти к приложению
            </Button>
          </>
        )}
      </div>
    </section>
  );
}

/** В тренировке: мини-сводка прогресса и ссылка на задания */
function TrainingProgressCard() {
  const app = useApp();
  const t = app.training;
  const until = tasksUntilNextAchievement(t.done);
  return (
    <button type="button" onClick={() => app.tab("hub")} className="mt-3 w-full rounded-l border border-tr-border bg-surface p-4 text-left cursor-pointer">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-ink-2">Ваш прогресс</span>
        <span className="rounded-s bg-tr-surface px-2 py-0.5 text-[11px] font-semibold text-tr-text">{statusFor(app.doneStages)}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="num text-[24px] font-bold">{app.doneStages}</span>
        <span className="text-[15px] text-ink-2">из {STAGES.length} этапов</span>
      </div>
      <ProgressBar value={t.done} max={TASKS.length} tone="training" className="mt-2" />
      <div className="mt-2 flex items-center justify-between text-[12px] text-ink-2">
        <span>
          {until && until.left > 0 ? `До «${until.achievement.title}» — ${until.left} ${plural(until.left, "задание", "задания", "заданий")}` : "Все достижения открыты"}
        </span>
        <span className="flex items-center font-semibold text-tr-text">
          Все этапы <Icon name="chevronRight" size={16} />
        </span>
      </div>
    </button>
  );
}

/** Тизер «Финкода»: стрик и финкоины, ссылка на обучение поручениям и бирже */
function FinCodeTeaser() {
  const app = useApp();
  const streak = app.finCodeStreak;
  const doneCount = app.finCodeDaily.doneIds.length;
  return (
    <button type="button" onClick={() => app.go("fincode")} className="mt-3 flex w-full items-center gap-3 rounded-l border border-line-subtle bg-surface p-3 text-left cursor-pointer active:bg-surface-muted">
      <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-l", streak > 0 ? "bg-warning-surface text-[#B45309]" : "bg-[#EEF2FF] text-[#4F46E5]")}>
        <Icon name={streak > 0 ? "flame" : "book"} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold leading-5">Финкод</div>
        <div className="truncate text-[12px] leading-4 text-ink-2">
          {streak > 0 ? `Стрик ${streak} ${plural(streak, "день", "дня", "дней")} · задания ${doneCount}/3` : "Ежедневные задания · поручения и биржа"}
        </div>
      </div>
      <span className="flex shrink-0 items-center gap-1 rounded-m bg-[#EEF2FF] px-2 py-1 text-[12px] font-semibold text-[#4F46E5]">
        <Icon name="coin" size={14} />
        {app.finCode.coins}
      </span>
    </button>
  );
}
