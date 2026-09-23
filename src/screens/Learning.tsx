import { useApp } from "../state/AppState";
import { STAGES, TASKS, statusFor, tasksUntilNextAchievement } from "../lib/training";
import { ACHIEVEMENTS, ACH_GROUPS } from "../lib/achievements";
import { AchBadge } from "../ui/chrome";
import { fmtMoney, fmtTime, plural } from "../lib/format";
import { VIRTUAL_START_CASH } from "../lib/data";
import Icon, { type IconName } from "../ui/Icons";
import { Button, HelpButton, ProgressBar, ProgressRing, TopBar, cx } from "../ui/kit";

// ================= Вход в тренировку =================
export function TrainingIntro() {
  const app = useApp();
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex items-center justify-between px-4 pt-3">
        <button type="button" onClick={app.exitTraining} className="flex h-10 w-10 items-center justify-center rounded-m text-ink-2 cursor-pointer" aria-label="Закрыть">
          <Icon name="x" />
        </button>
        <HelpButton />
      </div>
      <div className="flex-1 px-5 pb-6">
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-s bg-surface px-2 py-1 text-[11px] font-bold tracking-[0.06em] text-tr-text border border-tr-border">
          <Icon name="cap" size={14} /> ФЕЙКОВЫЕ ТОРГИ
        </div>
        <h1 className="mt-3 text-[28px] font-bold leading-9 tracking-tight">Учитесь на знакомом интерфейсе — без риска</h1>
        <p className="mt-2 text-[15px] leading-[22px] text-ink-2">Всё как в приложении, только деньги виртуальные. Выполняйте короткие задания и открывайте следующие этапы.</p>

        <section data-tour="intro-balance" className="mt-5 flex items-center gap-4 rounded-l border border-tr-border bg-surface p-5">
          <div className="h-14 w-14 shrink-0 rounded-full" style={{ background: "radial-gradient(circle at 32% 28%, var(--training-secondary), var(--training))", boxShadow: "inset 0 -4px 0 rgba(0,0,0,.12)" }} />
          <div>
            <div className="text-[13px] font-medium text-ink-2">Виртуальный баланс</div>
            <div className="num text-[28px] font-bold leading-9 tracking-tight">{fmtMoney(VIRTUAL_START_CASH, { whole: true })}</div>
            <div className="text-[12px] font-medium text-tr-text">Виртуальные средства — не настоящие деньги</div>
          </div>
        </section>

        <section data-tour="intro-stages" className="mt-3 rounded-l border border-line-subtle bg-surface p-4">
          <div className="text-[13px] font-semibold text-ink-2">7 этапов · около 5 минут</div>
          <ol className="mt-2 space-y-1.5">
            {STAGES.map((s) => (
              <li key={s.n} className="flex items-center gap-3 text-[14px]">
                <span className="num w-6 text-[12px] font-bold text-tr">{String(s.n).padStart(2, "0")}</span>
                {s.title}
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-3 flex items-start gap-2 rounded-m bg-surface/70 p-3 text-[12px] leading-[18px] text-ink-2">
          <Icon name="shield" size={18} className="shrink-0 text-tr" />
          Реальные операции в тренировке невозможны. Выйти можно в любой момент — прогресс сохранится.
        </div>
      </div>
      <div className="sticky bottom-0 bg-page/95 px-5 pb-4 pt-2 backdrop-blur">
        <Button full onClick={app.startTraining}>
          Начать тренировку
        </Button>
      </div>
    </div>
  );
}

// ================= Прогресс, этапы, достижения =================
export function Hub() {
  const app = useApp();
  const t = app.training;
  const done = app.doneStages;
  const current = TASKS[t.done];
  const until = tasksUntilNextAchievement(t.done);

  return (
    <>
      <TopBar title="Обучение" subtitle="Фейковые торги · прогресс сохраняется" />
      <div className="px-4 pb-8">
        <section data-tour="hub-progress" className="mt-4 flex items-center gap-4 rounded-l border border-tr-border bg-surface p-4">
          <ProgressRing value={done} max={STAGES.length} size={80}>
            <div className="text-center leading-none">
              <div className="num text-[22px] font-bold">{done}/7</div>
              <div className="mt-0.5 text-[10px] font-semibold text-ink-3">этапов</div>
            </div>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-semibold text-ink-3">Ваш статус</div>
            <div className="text-[20px] font-semibold leading-7">{statusFor(done)}</div>
            <div className="mt-0.5 text-[13px] text-ink-2">
              {t.finished
                ? "Все этапы пройдены"
                : until && until.left > 0
                  ? `До «${until.achievement.title}» — ${until.left} ${plural(until.left, "задание", "задания", "заданий")}`
                  : `Заданий выполнено: ${t.done} из ${TASKS.length}`}
            </div>
          </div>
        </section>

        {current && (
          <section className="mt-3 rounded-l border border-tr-border bg-tr-surface p-4">
            <div className="text-[12px] font-semibold text-tr-text">Текущее задание</div>
            <div className="mt-0.5 text-[16px] font-semibold leading-[22px]">{current.instruction}</div>
            <Button size="m" className="mt-3" onClick={() => app.tab("home")}>
              Продолжить
            </Button>
          </section>
        )}
        {t.finished && (
          <section className="mt-3 rounded-l border border-tr-border bg-tr-surface p-4">
            <div className="text-[16px] font-semibold">Обучение завершено</div>
            <div className="mt-0.5 text-[13px] text-ink-2">Можно продолжать тренироваться свободно или вернуться в приложение.</div>
            <div className="mt-3 flex gap-2">
              <Button size="m" onClick={app.exitTraining}>
                В ВТБ Мои Инвестиции
              </Button>
              <Button size="m" variant="tertiary" onClick={app.restartTraining}>
                Пройти заново
              </Button>
            </div>
          </section>
        )}

        <h2 className="mb-2 mt-6 px-1 text-[18px] font-semibold">Этапы</h2>
        <ol data-tour="hub-stages" className="overflow-hidden rounded-l border border-line-subtle bg-surface">
          {STAGES.map((s) => {
            const tasks = TASKS.filter((x) => x.stage === s.n);
            const first = TASKS.indexOf(tasks[0]);
            const doneIn = Math.max(0, Math.min(tasks.length, t.done - first));
            const state = doneIn === tasks.length ? "done" : t.done >= first ? "current" : "locked";
            return (
              <li key={s.n} className={cx("flex items-center gap-3 border-b border-line-subtle px-4 py-3 last:border-0", state === "current" && "bg-tr-surface")}>
                <span
                  className={cx(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-m text-[12px] font-bold",
                    state === "done" && "bg-success-surface text-success",
                    state === "current" && "bg-tr text-white",
                    state === "locked" && "bg-muted text-ink-4",
                  )}
                >
                  {state === "done" ? <Icon name="check" size={18} /> : state === "locked" ? <Icon name="lock" size={16} /> : String(s.n).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className={cx("text-[15px] font-medium leading-5", state === "locked" && "text-ink-3")}>{s.title}</div>
                  <div className="text-[12px] text-ink-2">
                    {state === "done" ? "Пройден" : state === "current" ? `В процессе · ${doneIn} из ${tasks.length}` : "Откроется после предыдущего этапа"}
                  </div>
                </div>
                {state === "current" && <span className="h-2 w-2 rounded-full bg-tr-accent" />}
              </li>
            );
          })}
        </ol>

        <div className="mb-2 mt-6 flex items-center justify-between px-1">
          <h2 className="text-[18px] font-semibold">Достижения тренировки</h2>
          <button type="button" onClick={() => app.go("achievements")} className="text-[13px] font-semibold text-accent-text cursor-pointer">
            Все
          </button>
        </div>
        <div data-tour="hub-achievements" className="grid grid-cols-2 gap-2">
          {ACHIEVEMENTS.filter((a) => a.group === "Фейковые торги").map((a) => {
            const got = app.has(a.id);
            return (
              <div key={a.id} className={cx("flex flex-col items-center rounded-l border p-4 text-center", got ? "border-tr-border bg-tr-surface" : "border-line-subtle bg-surface")}>
                <AchBadge def={a} locked={!got} />
                <div className={cx("mt-2 text-[14px] font-semibold leading-5", !got && "text-ink-2")}>{a.title}</div>
                <div className="mt-0.5 text-[12px] leading-4 text-ink-2">{a.desc}</div>
              </div>
            );
          })}
        </div>

        <h2 className="mb-2 mt-6 px-1 text-[18px] font-semibold">История прогресса</h2>
        <div className="rounded-l border border-line-subtle bg-surface p-4">
          {t.log.length === 0 && <div className="text-[13px] text-ink-2">Здесь появятся выполненные задания</div>}
          <ol className="relative space-y-3">
            {[...t.log].reverse().map((l) => {
              const task = TASKS.find((x) => x.id === l.taskId)!;
              return (
                <li key={l.taskId} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-surface text-success">
                    <Icon name="check" size={12} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] leading-5">{task.instruction}</div>
                    <div className="text-[12px] text-ink-3">
                      Этап {String(task.stage).padStart(2, "0")} · {fmtTime(l.ts)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </>
  );
}

// ================= Завершение обучения =================
export function TrainingFinish() {
  const app = useApp();
  return (
    <div className="flex min-h-full flex-col px-5 pb-6 pt-8 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-tr-border bg-surface text-tr anim-pop">
        <Icon name="medal" size={48} />
      </div>
      <div className="mx-auto mt-4 inline-flex items-center gap-1 rounded-s bg-warning-surface px-2 py-1 text-[12px] font-semibold text-[#B45309]">
        <Icon name="trophy" size={14} /> Достижение «Инвестор-новичок»
      </div>
      <h1 className="mt-3 text-[28px] font-bold leading-9 tracking-tight">Вы освоили основные возможности</h1>
      <p className="mt-2 text-[15px] leading-[22px] text-ink-2">Теперь вы знаете, где находятся ключевые разделы приложения и как работают основные операции.</p>

      <div className="mt-5 grid grid-cols-3 gap-2 text-left">
        {[
          ["7/7", "этапов"],
          [String(TASKS.length), "заданий"],
          [String(app.achievements.length), "достижений"],
        ].map(([v, l]) => (
          <div key={l} className="rounded-l border border-tr-border bg-surface p-3">
            <div className="num text-[20px] font-bold">{v}</div>
            <div className="text-[12px] text-ink-2">{l}</div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[12px] leading-[18px] text-ink-3">Все сделки в тренировке были виртуальными. Реальные операции вы совершаете только сами, когда будете готовы.</p>

      <div className="mt-auto flex flex-col gap-2 pt-6">
        <Button full onClick={app.exitTraining}>
          Вернуться в ВТБ Мои Инвестиции
        </Button>
        <Button full variant="tertiary" onClick={() => app.tab("hub")}>
          Посмотреть прогресс
        </Button>
      </div>
    </div>
  );
}

// ================= Ещё =================
export function More() {
  const app = useApp();
  const t = app.training;
  return (
    <>
      <TopBar title="Ещё" />
      <div className="px-4 pb-8">
        <section className="mt-4 flex items-center gap-3 rounded-l border border-line-subtle bg-surface p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-subtle text-[16px] font-bold text-brand">АД</div>
          <div className="flex-1">
            <div className="text-[16px] font-semibold">Анастасия Д.</div>
            <div className="text-[13px] text-ink-2">Брокерский счёт ···4821</div>
          </div>
        </section>

        <div data-tour="more-learning" className="mt-3 overflow-hidden rounded-l border border-line-subtle bg-surface">
          <MoreRow icon="cap" tone="training" title="Фейковые торги" sub={t.started ? `Пройдено ${app.doneStages} из 7 этапов` : "Тренировка на виртуальных деньгах"} onClick={app.enterTraining} />
          <MoreRow
            icon="help"
            title="Подсказки по приложению"
            sub="Пройти онбординг заново"
            onClick={() => {
              app.tab("home");
              app.setOnboarding("running");
            }}
          />
        </div>

        <div className="mt-3 overflow-hidden rounded-l border border-line-subtle bg-surface">
          <MoreRow icon="trophy" title="Мои достижения" sub={`Открыто ${app.achievements.length} из ${ACHIEVEMENTS.length}`} onClick={() => app.go("achievements")} />
          <MoreRow icon="user" title="Профиль" sub="Данные и документы" />
          <MoreRow icon="shield" title="Безопасность" sub="Код входа, биометрия" />
          <MoreRow icon="settings" title="Настройки" sub="Уведомления, внешний вид" />
          <MoreRow icon="chat" title="Чат с поддержкой" sub="Ответим за пару минут" />
        </div>

        <div data-tour="more-demo" className="mt-6 rounded-l border border-dashed border-line-strong bg-surface p-4">
          <div className="text-[13px] font-semibold text-ink-2">Состояния прототипа (для показа)</div>
          <DemoButtons />
        </div>
      </div>
    </>
  );
}

function MoreRow({ icon, title, sub, onClick, tone = "accent" }: { icon: IconName; title: string; sub: string; onClick?: () => void; tone?: "accent" | "training" }) {
  const app = useApp();
  return (
    <button
      type="button"
      onClick={onClick ?? (() => app.toast({ kind: "info", title, text: "Раздел не входит в сценарий прототипа" }))}
      className="flex w-full items-center gap-3 border-b border-line-subtle px-4 py-3 text-left last:border-0 cursor-pointer active:bg-surface-muted"
    >
      <span className={cx("flex h-10 w-10 items-center justify-center rounded-m", tone === "training" ? "bg-tr-surface text-tr border border-tr-border" : "bg-brand-subtle text-brand")}>
        <Icon name={icon} size={22} />
      </span>
      <span className="flex-1">
        <span className="block text-[15px] font-medium">{title}</span>
        <span className="block text-[13px] text-ink-2">{sub}</span>
      </span>
      <Icon name="chevronRight" size={20} className="text-ink-3" />
    </button>
  );
}

export function DemoButtons({ compact }: { compact?: boolean }) {
  const app = useApp();
  const items: [Parameters<typeof app.demo>[0], string][] = [
    ["first-run", "Первый запуск"],
    ["onboarding-done", "Онбординг пройден"],
    ["topped-up", "Счёт пополнен → биржа"],
    ["training-progress", "Обучение: 4 из 7"],
    ["training-done", "Обучение завершено"],
  ];
  return (
    <div className={cx("mt-2 grid gap-2", compact ? "grid-cols-1" : "grid-cols-2")}>
      {items.map(([k, label]) => (
        <button key={k} type="button" onClick={() => app.demo(k)} className="h-10 rounded-m bg-muted px-3 text-left text-[13px] font-semibold cursor-pointer hover:bg-surface-selected">
          {label}
        </button>
      ))}
    </div>
  );
}

// ================= Мои достижения =================
export function Achievements() {
  const app = useApp();
  const got = app.achievements.length;
  return (
    <>
      <TopBar back={app.stack.length > 1} title="Мои достижения" />
      <div className="px-4 pb-8">
        <section data-tour="ach-summary" className="mt-4 rounded-l border border-tr-border bg-tr-surface p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-l bg-warning text-white">
              <Icon name="trophy" size={26} />
            </span>
            <div className="flex-1">
              <div className="num text-[24px] font-bold leading-8">
                {got} <span className="text-[15px] font-medium text-ink-2">из {ACHIEVEMENTS.length}</span>
              </div>
              <div className="text-[13px] text-ink-2">Почти за каждое первое действие — достижение</div>
            </div>
          </div>
          <ProgressBar value={got} max={ACHIEVEMENTS.length} tone="training" className="mt-3" />
        </section>

        <div data-tour="ach-grid">
          {ACH_GROUPS.map((g) => {
            const list = ACHIEVEMENTS.filter((a) => a.group === g);
            const n = list.filter((a) => app.has(a.id)).length;
            return (
              <section key={g}>
                <div className="mb-2 mt-6 flex items-center justify-between px-1">
                  <h2 className="text-[18px] font-semibold">{g}</h2>
                  <span className="num text-[13px] font-semibold text-ink-2">
                    {n}/{list.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {list.map((a) => {
                    const rec = app.achievements.find((x) => x.id === a.id);
                    return (
                      <div key={a.id} className={cx("flex flex-col items-center rounded-l border p-3 text-center", rec ? "border-tr-border bg-tr-surface" : "border-line-subtle bg-surface")}>
                        <AchBadge def={a} locked={!rec} size={52} />
                        <div className={cx("mt-2 text-[14px] font-semibold leading-5", !rec && "text-ink-2")}>{a.title}</div>
                        <div className="mt-0.5 text-[12px] leading-4 text-ink-2">{a.desc}</div>
                        <div className={cx("mt-1.5 text-[11px] font-semibold", rec ? "text-tr-text" : "text-ink-3")}>
                          {rec ? `Получено ${fmtTime(rec.ts)}` : a.mode === "training" ? "На фейковых торгах" : a.mode === "real" ? "В приложении" : "В любом режиме"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
