import { useEffect, useState, type ReactNode } from "react";
import { useApp, type ScreenName } from "../state/AppState";
import { useTour } from "../tour/Tour";
import { ACHIEVEMENTS, STAGES, TASKS, tasksUntilNextAchievement } from "../lib/training";
import { plural } from "../lib/format";
import Icon, { type IconName } from "./Icons";
import { Button, ProgressBar, cx } from "./kit";

// ---------- Статус-бар телефона (только в рамке на десктопе) ----------
export function StatusBar({ dark }: { dark?: boolean }) {
  return (
    <div className={cx("flex h-11 shrink-0 items-center justify-between px-7 text-[15px] font-semibold", dark ? "text-white" : "text-ink")}>
      <span className="num">9:41</span>
      <span className="flex items-center gap-1.5" aria-hidden="true">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5" width="3" height="7" rx="1" />
          <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor" />
          <rect x="24" y="4" width="1.5" height="4" rx="0.75" fill="currentColor" opacity="0.4" />
        </svg>
      </span>
    </div>
  );
}

// ---------- Постоянный статус тренировочного режима ----------
export function TrainingBanner() {
  const app = useApp();
  return (
    <div data-tour="training-banner" className="training-stripe relative z-[150] flex shrink-0 items-center gap-3 px-4 py-2 text-white">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-m bg-white/20">
        <Icon name="cap" size={20} />
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <div className="text-[13px] font-bold tracking-[0.06em]">ФЕЙКОВЫЕ ТОРГИ</div>
        <div className="text-[11px] font-medium leading-[14px] text-white/85">Деньги виртуальные, реальные не используются</div>
      </div>
      <button type="button" onClick={app.exitTraining} className="flex h-8 items-center gap-1 rounded-m bg-white/20 px-2.5 text-[12px] font-semibold cursor-pointer active:bg-white/30">
        <Icon name="logout" size={16} />
        Выйти
      </button>
    </div>
  );
}

// ---------- Нижняя навигация ----------
export function BottomNav() {
  const app = useApp();
  const training = app.mode === "training";
  const items: { name: ScreenName; label: string; icon: IconName; tour: string }[] = [
    { name: "home", label: "Главная", icon: "home", tour: "nav-home" },
    { name: "portfolio", label: "Портфель", icon: "briefcase", tour: "nav-portfolio" },
    { name: "market", label: "Рынок", icon: "market", tour: "nav-market" },
    { name: "history", label: "История", icon: "clock", tour: "nav-history" },
    training ? { name: "hub", label: "Задания", icon: "cap", tour: "nav-hub" } : { name: "more", label: "Ещё", icon: "grid", tour: "nav-more" },
  ];
  const root = app.stack[0].name;
  return (
    <nav data-tour="bottom-nav" className="relative z-[100] flex shrink-0 border-t border-line-subtle bg-surface pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5">
      {items.map((it) => {
        const active = root === it.name;
        return (
          <button
            key={it.name}
            type="button"
            data-tour={it.tour}
            onClick={() => app.tab(it.name)}
            className={cx("relative flex flex-1 flex-col items-center gap-0.5 py-1 text-[11px] font-semibold cursor-pointer", active ? "text-accent" : "text-ink-2")}
            aria-current={active ? "page" : undefined}
          >
            <Icon name={it.icon} size={24} />
            {it.label}
            {it.name === "hub" && app.training.done < TASKS.length && (
              <span className="absolute right-[calc(50%-18px)] top-0.5 h-2 w-2 rounded-full border-2 border-surface bg-tr-accent" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

// ---------- Панель текущего задания (тренировка) ----------
export function TaskPanel() {
  const app = useApp();
  const tour = useTour();
  const { training } = app;
  const task = TASKS[training.done];
  if (!training.started || !task || app.current.name === "training-intro" || app.current.name === "training-finish") return null;
  const stage = STAGES[task.stage - 1];
  const stageTasks = TASKS.filter((t) => t.stage === task.stage);
  const within = stageTasks.indexOf(task) + 1;

  if (!app.taskPanelOpen) {
    return (
      <button
        type="button"
        data-tour="task-panel"
        onClick={() => app.setTaskPanelOpen(true)}
        className="absolute bottom-[76px] right-3 z-[160] flex h-11 items-center gap-2 rounded-full bg-tr px-4 text-[13px] font-semibold text-white shadow-e3 cursor-pointer anim-pop"
      >
        <Icon name="target" size={18} />
        Задание {training.done + 1}/{TASKS.length}
      </button>
    );
  }

  return (
    <div data-tour="task-panel" key={task.id} className="absolute bottom-[72px] left-3 right-3 z-[160] rounded-l border border-tr-border bg-surface p-3 shadow-e3 anim-rise">
      <div className="flex items-center gap-2">
        <span className="rounded-s bg-tr-surface px-1.5 py-0.5 text-[11px] font-bold text-tr-text">{String(stage.n).padStart(2, "0")}</span>
        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ink-2">
          {stage.title} · {within} из {stageTasks.length}
        </span>
        <button type="button" onClick={() => app.setTaskPanelOpen(false)} className="flex h-7 w-7 items-center justify-center rounded-m text-ink-3 cursor-pointer" aria-label="Свернуть задание">
          <Icon name="chevronDown" size={18} />
        </button>
      </div>
      <div className="mt-1.5 flex items-start gap-2.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-m bg-tr-surface text-tr">
          <Icon name="target" size={20} />
        </span>
        <p className="flex-1 text-[15px] font-semibold leading-[21px]">{task.instruction}</p>
      </div>
      <div className="mt-2.5 flex items-center gap-3">
        <ProgressBar value={training.done} max={TASKS.length} tone="training" className="flex-1" />
        <span className="num text-[12px] font-semibold text-ink-2">
          {training.done}/{TASKS.length}
        </span>
        <button type="button" onClick={tour.startHint} className="flex h-8 items-center gap-1 rounded-m bg-tr-surface px-2.5 text-[12px] font-semibold text-tr-text border border-tr-border cursor-pointer">
          <Icon name="bulb" size={16} />
          Подсказка
        </button>
      </div>
    </div>
  );
}

// ---------- Базовый bottom sheet ----------
export function Sheet({ open, onClose, children, tour, label }: { open: boolean; onClose: () => void; children: ReactNode; tour?: string; label: string }) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-[500]" role="dialog" aria-label={label}>
      <div className="absolute inset-0 anim-fade" style={{ background: "var(--overlay)" }} onClick={onClose} />
      <div data-tour={tour} className="absolute bottom-0 left-0 right-0 rounded-t-xl bg-surface pb-[max(env(safe-area-inset-bottom),16px)] anim-sheet">
        <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-line-strong" />
        {children}
      </div>
    </div>
  );
}

// ---------- Меню «Действия» ----------
export function ActionsSheet() {
  const app = useApp();
  const training = app.mode === "training";
  const items: { tour: string; icon: IconName; title: string; sub: string; to: ScreenName }[] = [
    { tour: "action-topup", icon: "arrowDown", title: "Пополнить", sub: training ? "Виртуальное пополнение счёта" : "С карты или по реквизитам", to: "topup" },
    { tour: "action-withdraw", icon: "arrowUp", title: "Вывести", sub: training ? "Виртуальный вывод" : "На карту или счёт в банке", to: "withdraw" },
    { tour: "action-docs", icon: "file", title: "Отчёты и справки", sub: "Заказать и скачать документы", to: "documents" },
  ];
  return (
    <Sheet open={app.actionsOpen} onClose={() => app.setActionsOpen(false)} tour="actions-sheet" label="Действия">
      <div className="flex items-center justify-between px-5 pb-2 pt-3">
        <h2 className="text-[20px] font-semibold">Действия</h2>
        <div className="flex items-center gap-1">
          <button type="button" data-help-trigger className="flex h-9 items-center gap-1.5 rounded-m bg-accent-subtle px-2.5 text-[13px] font-semibold text-accent-text cursor-pointer">
            <Icon name="help" size={18} />
            Помощь
          </button>
          <button type="button" onClick={() => app.setActionsOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-m text-ink-2 cursor-pointer" aria-label="Закрыть">
            <Icon name="x" />
          </button>
        </div>
      </div>
      <div className="px-1 pb-2">
        {items.map((it) => (
          <button
            key={it.tour}
            type="button"
            data-tour={it.tour}
            onClick={() => app.openFromActions(it.to)}
            className="flex w-full items-center gap-3 rounded-l px-4 py-3 text-left cursor-pointer active:bg-surface-muted"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-l bg-accent-subtle text-accent-text">
              <Icon name={it.icon} />
            </span>
            <span className="flex-1">
              <span className="block text-[16px] font-semibold">{it.title}</span>
              <span className="block text-[13px] text-ink-2">{it.sub}</span>
            </span>
            <Icon name="chevronRight" size={20} className="text-ink-3" />
          </button>
        ))}
      </div>
    </Sheet>
  );
}

// ---------- Первый запуск ----------
export function WelcomeSheet() {
  const app = useApp();
  const open = app.onboarding === "new" && app.mode === "real";
  return (
    <Sheet open={open} onClose={() => app.setOnboarding("skipped")} label="Добро пожаловать">
      <div className="px-5 pb-2 pt-5">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-l bg-brand-subtle text-brand">
          <Icon name="sparkle" size={28} />
        </div>
        <h2 className="text-[24px] font-bold leading-8 tracking-tight">Покажем главное</h2>
        <p className="mt-1 text-[15px] leading-[22px] text-ink-2">3 короткие подсказки — меньше минуты. Закрыть можно в любой момент.</p>
        <div className="mt-5 flex flex-col gap-2">
          <Button full onClick={() => app.setOnboarding("running")}>
            Показать
          </Button>
          <Button full variant="tertiary" onClick={() => app.setOnboarding("skipped")}>
            Не сейчас
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

// ---------- Реальная сделка в прототипе недоступна ----------
export function DealInfoSheet() {
  const app = useApp();
  return (
    <Sheet open={app.dealInfoOpen} onClose={() => app.setDealInfoOpen(false)} label="Сделки в прототипе">
      <div className="px-5 pb-2 pt-5">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-l bg-info-surface text-info">
          <Icon name="info" />
        </div>
        <h2 className="text-[20px] font-semibold">Это прототип</h2>
        <p className="mt-1 text-[15px] leading-[22px] text-ink-2">Реальные операции здесь не проводятся. Всё то же самое можно безопасно попробовать в тренировке.</p>
        <div className="mt-5 flex flex-col gap-2">
          <Button full variant="tertiary" onClick={() => app.setDealInfoOpen(false)}>
            Понятно
          </Button>
          <button
            type="button"
            onClick={() => {
              app.setDealInfoOpen(false);
              app.enterTraining();
            }}
            className="h-11 text-[14px] font-semibold text-tr-text cursor-pointer"
          >
            Открыть тренировку
          </button>
        </div>
      </div>
    </Sheet>
  );
}

// ---------- Завершение этапа ----------
const ACH_ICON: Record<string, IconName> = { flag: "flag", compass: "compass", cart: "cart", briefcase: "briefcase", medal: "medal" };

function Confetti() {
  const colors = ["#885CF6", "#D946EF", "#A788FA", "#F59E0B", "#16A34A"];
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 22 }).map((_, i) => (
        <span
          key={i}
          className="absolute h-2 w-1.5 rounded-[2px]"
          style={{
            left: `${(i * 37) % 100}%`,
            background: colors[i % colors.length],
            animation: `confetti-fall ${1.2 + (i % 5) * 0.2}s var(--ease) ${(i % 7) * 0.06}s both`,
          }}
        />
      ))}
    </div>
  );
}

export function StageModalView() {
  const app = useApp();
  const m = app.stageModal;
  const [fill, setFill] = useState(0);
  useEffect(() => {
    if (!m) return;
    setFill(m.stage - 1);
    const t = window.setTimeout(() => setFill(m.stage), 250);
    return () => window.clearTimeout(t);
  }, [m]);
  if (!m) return null;
  const stage = STAGES[m.stage - 1];
  const nextStage = STAGES[m.stage];
  const ach = ACHIEVEMENTS.find((a) => a.id === m.achievementId);
  const isFinal = !nextStage;
  const until = tasksUntilNextAchievement(app.training.done);

  return (
    <div className="absolute inset-0 z-[550] flex items-end" role="dialog" aria-label={`Этап ${m.stage} пройден`}>
      <div className="absolute inset-0 anim-fade" style={{ background: "var(--overlay)" }} />
      <div className="relative w-full overflow-hidden rounded-t-xl bg-surface px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-6 anim-sheet">
        <Confetti />
        <div className="relative flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-surface text-success anim-pop">
            <Icon name="check" size={28} />
          </span>
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wide text-success">Этап {String(m.stage).padStart(2, "0")} пройден</div>
            <div className="text-[20px] font-semibold leading-7">{stage.title}</div>
          </div>
        </div>
        <p className="relative mt-3 text-[15px] leading-[22px] text-ink-2">{m.success}</p>

        <div className="relative mt-4">
          <div className="mb-1.5 flex justify-between text-[13px] font-semibold">
            <span>Ваш прогресс</span>
            <span className="num text-tr-text">
              {fill}/{STAGES.length} этапов
            </span>
          </div>
          <ProgressBar value={fill} max={STAGES.length} tone="training" />
        </div>

        {ach && (
          <div className="relative mt-4 flex items-center gap-3 rounded-l border border-tr-border bg-tr-surface p-3 anim-pop" style={{ animationDelay: "300ms" }}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-l bg-surface text-tr border border-tr-border">
              <Icon name={ACH_ICON[ach.icon]} size={26} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#B45309]">
                <Icon name="trophy" size={14} /> Новое достижение
              </div>
              <div className="text-[16px] font-semibold">{ach.title}</div>
              <div className="text-[13px] text-ink-2">{ach.desc}</div>
            </div>
          </div>
        )}

        {!isFinal && (
          <div className="relative mt-4 rounded-l bg-surface-muted p-3">
            <div className="text-[12px] font-semibold text-ink-3">Открыт следующий этап</div>
            <div className="text-[15px] font-semibold">
              {String(nextStage.n).padStart(2, "0")} — {nextStage.title}
            </div>
            {until && until.left > 0 && (
              <div className="mt-0.5 text-[13px] text-ink-2">
                До достижения «{until.achievement.title}» — {until.left} {plural(until.left, "задание", "задания", "заданий")}
              </div>
            )}
          </div>
        )}

        <div className="relative mt-5 flex flex-col gap-2">
          {isFinal ? (
            <Button
              full
              onClick={() => {
                app.setStageModal(null);
                app.replace("training-finish");
              }}
            >
              Завершить обучение
            </Button>
          ) : (
            <>
              <Button full onClick={() => app.setStageModal(null)}>
                Следующий этап
              </Button>
              <Button
                full
                variant="tertiary"
                onClick={() => {
                  app.setStageModal(null);
                  app.tab("hub");
                }}
              >
                Мой прогресс
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Тосты: success / error / info ----------
export function Toasts() {
  const app = useApp();
  return (
    <div className="pointer-events-none absolute inset-x-3 top-14 z-[800] flex flex-col gap-2" aria-live="polite">
      {app.toasts.map((t) => {
        const tone = {
          success: { icon: "checkCircle", cls: "text-success", bg: "bg-success-surface" },
          error: { icon: "alert", cls: "text-error", bg: "bg-error-surface" },
          info: { icon: "info", cls: "text-info", bg: "bg-info-surface" },
        }[t.kind];
        return (
          <div key={t.id} className={cx("pointer-events-auto flex items-start gap-2.5 rounded-l border border-line-subtle bg-surface p-3 shadow-e3 anim-rise", t.kind === "error" && "anim-shake")} role="status">
            <span className={cx("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", tone.bg, tone.cls)}>
              <Icon name={tone.icon} size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold leading-5">{t.title}</div>
              {t.text && <div className="text-[13px] leading-[18px] text-ink-2">{t.text}</div>}
            </div>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  app.dismissToast(t.id);
                  t.action!.fn();
                }}
                className="h-8 shrink-0 rounded-m bg-accent-subtle px-2.5 text-[12px] font-semibold text-accent-text cursor-pointer"
              >
                {t.action.label}
              </button>
            )}
            <button type="button" onClick={() => app.dismissToast(t.id)} className="-mr-1 flex h-8 w-6 items-center justify-center text-ink-3 cursor-pointer" aria-label="Закрыть">
              <Icon name="x" size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
