import { useEffect, useRef, useState } from "react";
import { useApp } from "../../state/AppState";
import { ACHIEVEMENTS } from "../../lib/achievements";
import {
  STAGES,
  TASKS,
  statusFor,
  tasksUntilNextAchievement,
} from "../../lib/training";
import { plural } from "../../lib/format";
import Icon from "../../ui/Icons";
import { Button, ProgressBar, cx } from "../../ui/kit";

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
      className={cx(
        "flex h-9 items-center gap-1 rounded-m bg-warning-surface px-2 text-[13px] font-semibold text-[#B45309] cursor-pointer",
        pulse && "anim-pulse",
      )}
      aria-label={`Достижения: ${app.achievements.length} из ${ACHIEVEMENTS.length}`}
    >
      <Icon name="trophy" size={18} />
      <span className="num">{app.achievements.length}</span>
    </button>
  );
}

/** «Первые шаги» в реальном приложении: знакомство → пополнение → первая покупка */
export function FirstSteps() {
  const app = useApp();
  const steps = [
    {
      title: "Познакомиться с приложением",
      done: app.onboarding === "done" || app.has("welcome"),
      reward: "Добро пожаловать",
    },
    {
      title: "Пополнить счёт",
      done: app.has("first-topup"),
      reward: "Первое пополнение",
    },
    {
      title: "Первая покупка — от 2 ₽",
      done: app.has("first-buy"),
      reward: "Первая покупка",
    },
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
    <section
      data-tour="first-steps"
      className="mt-3 rounded-l border border-line-subtle bg-surface p-4"
    >
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
                s.done
                  ? "bg-success-surface text-success"
                  : i === nextIdx
                    ? "bg-brand text-white"
                    : "bg-muted text-ink-3",
              )}
            >
              {s.done ? <Icon name="check" size={14} /> : i + 1}
            </span>
            <span
              className={cx(
                "flex-1 text-[14px]",
                s.done
                  ? "text-ink-3 line-through"
                  : i === nextIdx
                    ? "font-semibold"
                    : "text-ink-2",
              )}
            >
              {s.title}
            </span>
            <span
              className={cx(
                "flex items-center gap-1 text-[11px] font-semibold",
                s.done ? "text-ink-3" : "text-[#B45309]",
              )}
              title={`Достижение «${s.reward}»`}
            >
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

/** Карточка обучения в обычном интерфейсе: старт → возврат к прогрессу → «Готовы продолжить самостоятельно?» */
export function LearningCard() {
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
          <span className="block text-[15px] font-semibold">
            Обучение пройдено
          </span>
          <span className="block text-[13px] text-tr-text">
            Статус: Инвестор-новичок · 7/7
          </span>
        </span>
        <Icon name="chevronRight" size={20} className="text-ink-3" />
      </button>
    );
  }

  return (
    <section
      data-tour="training-card"
      className="relative mt-3 overflow-hidden rounded-l border border-tr-border bg-tr-surface p-4"
    >
      <div className="training-stripe absolute inset-x-0 top-0 h-1" />
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-l bg-surface text-tr border border-tr-border">
          <Icon name={t.finished ? "medal" : "cap"} size={24} />
        </span>
        <div className="min-w-0 flex-1">
          {!t.started && (
            <>
              <div className="text-[18px] font-semibold leading-6">
                Пройти обучение
              </div>
              <div className="text-[13px] leading-5 text-ink-2">
                Попробуйте инвестировать без риска
              </div>
            </>
          )}
          {t.started && !t.finished && (
            <>
              <div className="text-[18px] font-semibold leading-6">
                Вы прошли {app.doneStages} из {STAGES.length} этапов
              </div>
              <div className="text-[13px] leading-5 text-ink-2">
                Следующий этап: {nextStage?.title.toLowerCase()}
              </div>
            </>
          )}
          {t.finished && (
            <>
              <div className="text-[18px] font-semibold leading-6">
                Готовы продолжить самостоятельно?
              </div>
              <div className="text-[13px] leading-5 text-ink-2">
                Вы прошли все этапы и получили статус «
                {statusFor(STAGES.length)}»
              </div>
            </>
          )}
        </div>
      </div>

      {t.started && !t.finished && (
        <div className="mt-3">
          <ProgressBar
            value={app.doneStages}
            max={STAGES.length}
            tone="training"
          />
          {until && until.left > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-ink-2">
              <Icon name="trophy" size={14} className="text-warning" />
              До достижения «{until.achievement.title}» — {until.left}{" "}
              {plural(until.left, "задание", "задания", "заданий")}
            </div>
          )}
        </div>
      )}

      {!t.started && (
        <div className="mt-3 flex gap-1.5 text-[12px] text-ink-2">
          <span className="rounded-s bg-surface px-2 py-1 border border-tr-border">
            1 000 000 ₽ виртуальных
          </span>
          <span className="rounded-s bg-surface px-2 py-1 border border-tr-border">
            7 этапов
          </span>
          <span className="rounded-s bg-surface px-2 py-1 border border-tr-border">
            ~5 минут
          </span>
        </div>
      )}

      <div className={cx("mt-4 flex gap-2", t.finished && "flex-col-reverse")}>
        {!t.finished ? (
          <button
            type="button"
            onClick={app.enterTraining}
            className="h-11 flex-1 rounded-m bg-tr text-[15px] font-semibold text-white cursor-pointer active:brightness-90"
          >
            {t.started ? "Продолжить обучение" : "Начать обучение"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={app.restartTraining}
              className="h-11 w-full rounded-m border border-tr-border bg-surface text-[14px] font-semibold text-tr-text cursor-pointer"
            >
              Повторить обучение
            </button>
            <Button
              full
              className="h-11"
              size="m"
              variant="primary"
              onClick={() =>
                app.setTraining((x) => ({ ...x, readyCardDismissed: true }))
              }
            >
              Перейти к приложению
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
