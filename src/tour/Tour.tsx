import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useApp, type AppApi, type ScreenName } from "../state/AppState";
import { TASKS } from "../lib/training";
import Icon from "../ui/Icons";
import { cx } from "../ui/kit";

export interface TourStep {
  target: string;
  title: string;
  text: string;
  /** next — «Далее» (цель заблокирована); click — пользователь сам нажимает на подсвеченный элемент */
  mode?: "next" | "click";
  /** Событие, по которому шаг click считается выполненным */
  advanceOn?: string;
  button?: string;
  /** Вторая кнопка тултипа (например, «Выберу сам») — завершает тур */
  secondary?: string;
  /** Действие при переходе дальше: например, вернуться назад в меню после показа раздела */
  onNext?: () => void;
  /** Обязательный шаг: кнопка закрытия обучения скрыта, пройти можно только через «Далее» */
  lockClose?: boolean;
}

export interface Tour {
  id: string;
  /** hint и quest — «путь»: тур сам перескакивает к самому дальнему шагу, цель которого уже на экране */
  kind: "onboarding" | "help" | "hint" | "quest";
  steps: TourStep[];
  onDone?: () => void;
  onClose?: () => void;
  onSecondary?: () => void;
  /** Событие, завершающее тур (например, do:buy) */
  endOn?: string;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface TourApi {
  start: (t: Tour | string) => void;
  startHelp: () => void;
  startHint: () => void;
  startQuest: () => void;
  active: Tour | null;
}

const TourCtx = createContext<TourApi | null>(null);
export const useTour = () => useContext(TourCtx)!;

// ---------- Сценарии ----------

function onboardingTours(app: AppApi, start: (id: string) => void): Record<string, Tour> {
  const backToActions = () => {
    app.back();
    app.openActions();
  };
  const skip = () => {
    app.setOnboarding("skipped");
    app.toast({ kind: "info", title: "Обучение закрыто", text: "Вернуться к подсказкам можно кнопкой «Помощь» вверху экрана" });
    app.setHelpPulse(true);
    window.setTimeout(() => app.setHelpPulse(false), 5000);
  };
  return {
    "onb-home": {
      id: "onb-home",
      kind: "onboarding",
      onClose: skip,
      onDone: () => start("onb-actions"),
      steps: [
        {
          target: "actions",
          title: "Действия",
          text: "Все операции со счётом собраны здесь. Нажмите, чтобы открыть",
          mode: "click",
          advanceOn: "open:actions",
        },
      ],
    },
    // Принцип «нажми сам»: каждый раздел пользователь открывает сам, видит его и возвращается в меню
    "onb-actions": {
      id: "onb-actions",
      kind: "onboarding",
      onClose: skip,
      onDone: () => start("onb-docs"),
      steps: [
        { target: "actions-sheet", title: "Меню действий", text: "Здесь находятся основные операции с вашим счётом", lockClose: true },
        { target: "action-topup", title: "Пополнить", text: "Нажмите на «Пополнить», чтобы открыть", mode: "click", advanceOn: "open:topup", lockClose: true },
        {
          target: "topup-amount",
          title: "Так пополняется счёт",
          text: "Сумма, карта и кнопка — всё на одном экране",
          button: "Назад к меню",
          onNext: backToActions,
          lockClose: true,
        },
        { target: "action-withdraw", title: "Вывести", text: "Теперь нажмите на «Вывести»", mode: "click", advanceOn: "open:withdraw", lockClose: true },
        {
          target: "withdraw-amount",
          title: "Вывод на карту",
          text: "Выводить можно только свободные деньги",
          button: "Назад к меню",
          onNext: backToActions,
          lockClose: true,
        },
        { target: "action-docs", title: "Отчёты и справки", text: "И последнее — нажмите на «Отчёты и справки»", mode: "click", advanceOn: "open:documents", lockClose: true },
      ],
    },
    "onb-docs": {
      id: "onb-docs",
      kind: "onboarding",
      onClose: skip,
      onDone: () => {
        app.tab("home");
        start("onb-final");
      },
      // Клиент заказывает настоящий документ, нажимая на его название, а не на общую плитку
      steps: [
        { target: "doc-quick-broker", title: "Заказать документ", text: "Например, «Брокерский отчёт» — нажмите на название", mode: "click", advanceOn: "open:doc-order", lockClose: true },
        { target: "doc-type-pick", title: "Выберите тип", text: "Нажмите на нужный документ — например, справку о доходах", mode: "click", advanceOn: "select:doc-type", onNext: app.back, lockClose: true },
        { target: "docs-ready", title: "Скачать готовые", text: "А здесь документы, которые уже готовы. Нажмите", mode: "click", advanceOn: "open:doc-ready", lockClose: true },
        { target: "docs-list", title: "Готовые документы", text: "Нажмите на документ, чтобы скачать", button: "Понятно", lockClose: true },
      ],
    },
    "onb-final": {
      id: "onb-final",
      kind: "onboarding",
      onClose: skip,
      onDone: () => {
        app.setOnboarding("done");
        app.emit("onb:done");
      },
      steps: [
        { target: "first-steps", title: "Первые шаги", text: "Пополните счёт и совершите первую покупку — подскажем на каждом шаге" },
        { target: "training-card", title: "Попробуйте без риска", text: "Фейковые торги: тот же интерфейс, виртуальные деньги" },
        { target: "ach-chip", title: "Достижения", text: "Почти за каждое действие — достижение. Нажмите, чтобы посмотреть", mode: "click", advanceOn: "open:achievements" },
        { target: "ach-summary", title: "Ваша коллекция", text: "У закрытых достижений написано, как их получить", button: "Назад", onNext: app.back },
        { target: "help-btn", title: "Помощь", text: "Подсказки, фейковые торги и обучение — здесь. Нажмите", mode: "click", advanceOn: "help:open" },
        {
          target: "help-screen",
          title: "Вернуться можно всегда",
          text: "Закройте обучение в любой момент — и продолжите отсюда",
          button: "Завершить",
          onNext: () => app.setHelpOpen(false),
        },
      ],
    },
  };
}

const HELP: Partial<Record<ScreenName | "actions", TourStep[]>> = {
  home: [
    { target: "balance", title: "Стоимость портфеля", text: "Сколько сейчас стоят все активы и свободные деньги" },
    { target: "actions", title: "Действия", text: "Пополнение, вывод, отчёты и справки" },
    { target: "training-card", title: "Обучение", text: "Тренировка на виртуальных деньгах" },
    { target: "bottom-nav", title: "Разделы", text: "Портфель, рынок и история — внизу экрана" },
  ],
  actions: [
    { target: "actions-sheet", title: "Меню действий", text: "Основные операции с вашим счётом" },
    { target: "action-topup", title: "Пополнить", text: "Пополнение инвестиционного счёта" },
    { target: "action-withdraw", title: "Вывести", text: "Вывод денег на карту" },
    { target: "action-docs", title: "Отчёты и справки", text: "Заказ и скачивание документов" },
  ],
  portfolio: [
    { target: "portfolio-total", title: "Портфель", text: "Общая стоимость и доход за всё время" },
    { target: "portfolio-alloc", title: "Структура", text: "Доли акций, облигаций, фондов и денег" },
    { target: "portfolio-list", title: "Активы", text: "Нажмите на актив, чтобы открыть карточку" },
  ],
  market: [
    { target: "market-search", title: "Поиск", text: "Найдите бумагу по названию или тикеру" },
    { target: "market-segments", title: "Категории", text: "Акции, облигации, фонды и фьючерсы" },
    { target: "market-first", title: "Инструмент", text: "Нажмите, чтобы открыть карточку" },
  ],
  history: [{ target: "history-list", title: "История", text: "Все сделки, пополнения и выводы по датам" }],
  instrument: [
    { target: "instr-price", title: "Цена", text: "Текущая цена и изменение за день" },
    { target: "chart-periods", title: "Период", text: "Переключайте период графика" },
    { target: "trade-buttons", title: "Сделки", text: "Покупка и продажа начинаются отсюда" },
  ],
  trade: [
    { target: "trade-qty", title: "Количество", text: "Сколько бумаг купить или продать" },
    { target: "trade-total", title: "Итог", text: "Сумма сделки с комиссией" },
    { target: "trade-submit", title: "Подтверждение", text: "Сделка происходит только после нажатия" },
  ],
  topup: [
    { target: "topup-amount", title: "Сумма", text: "Введите сумму или выберите готовую" },
    { target: "topup-source", title: "Откуда", text: "Карта, с которой спишутся деньги" },
    { target: "topup-submit", title: "Пополнить", text: "Перевод выполняется после нажатия" },
  ],
  withdraw: [
    { target: "withdraw-amount", title: "Сумма", text: "Сколько вывести — не больше доступного" },
    { target: "withdraw-submit", title: "Вывести", text: "Деньги придут на выбранную карту" },
  ],
  documents: [
    { target: "docs-order", title: "Заказать документ", text: "Здесь можно заказать необходимые документы" },
    { target: "docs-ready", title: "Скачать готовые", text: "А здесь находятся документы, которые уже готовы" },
  ],
  "doc-order": [
    { target: "doc-types", title: "Тип документа", text: "Выберите нужную справку или отчёт" },
    { target: "doc-submit", title: "Заказать", text: "Документ подготовится за пару минут" },
  ],
  "doc-ready": [{ target: "docs-list", title: "Готовые документы", text: "Нажмите на документ, чтобы скачать" }],
  achievements: [
    { target: "ach-summary", title: "Ваши достижения", text: "Почти за каждое первое действие — новое достижение" },
    { target: "ach-grid", title: "Как открыть", text: "У закрытых достижений написано, что нужно сделать" },
  ],
  more: [
    { target: "more-learning", title: "Обучение", text: "Тренировка и подсказки по приложению" },
    { target: "more-demo", title: "Состояния прототипа", text: "Быстрый переход к нужному сценарию для показа" },
  ],
  hub: [
    { target: "hub-progress", title: "Ваш прогресс", text: "Сколько этапов пройдено и ваш статус" },
    { target: "hub-stages", title: "Этапы", text: "Каждый этап — несколько коротких заданий" },
    { target: "hub-achievements", title: "Достижения", text: "Открываются за пройденные этапы" },
  ],
  "training-intro": [
    { target: "intro-balance", title: "Виртуальный счёт", text: "Эти деньги ненастоящие — рисковать нечем" },
    { target: "intro-stages", title: "7 этапов", text: "Короткие задания в знакомом интерфейсе" },
  ],
};

const TRAINING_PREFIX: TourStep[] = [
  { target: "training-banner", title: "Фейковые торги", text: "Здесь всё понарошку: деньги виртуальные, сделки не настоящие" },
  { target: "task-panel", title: "Текущее задание", text: "Выполните его — и откроется следующее" },
];

// ---------- Провайдер ----------

export function TourProvider({ children }: { children: ReactNode }) {
  const app = useApp();
  const [tour, setTour] = useState<Tour | null>(null);
  const [idx, setIdx] = useState(0);
  const appRef = useRef(app);
  appRef.current = app;
  const endTour = useCallback(() => setTour(null), []);

  const start = useCallback((t: Tour | string) => {
    const resolved = typeof t === "string" ? onboardingTours(appRef.current, (id) => start(id))[t] : t;
    if (!resolved) return;
    setIdx(0);
    setTour(resolved);
  }, []);

  const startHelp = useCallback(() => {
    const a = appRef.current;
    a.setHelpOpen(false);
    const key = a.actionsOpen ? "actions" : a.current.name;
    let steps = HELP[key] ?? [];
    if (a.mode === "training" && key === "home") steps = [...TRAINING_PREFIX, ...steps];
    if (!steps.length) {
      a.toast({ kind: "info", title: "Подсказок для этого экрана пока нет" });
      return;
    }
    start({ id: `help-${key}`, kind: "help", steps });
  }, [start]);

  const startHint = useCallback(() => {
    const a = appRef.current;
    const task = TASKS[a.training.done];
    if (!task) return;
    start({ id: `hint-${task.id}`, kind: "hint", steps: task.hint.map((h) => ({ ...h, mode: "click" as const })) });
  }, [start]);

  const startQuest = useCallback(() => {
    const a = appRef.current;
    const training = a.mode === "training";
    start({
      id: "quest-buy",
      kind: "quest",
      endOn: "do:buy",
      onSecondary: () =>
        appRef.current.toast({ kind: "info", title: "Выбирайте любой актив", text: "Откройте карточку и нажмите «Купить». За первую покупку — достижение" }),
      steps: [
        { target: "nav-market", title: "Биржа", text: "Все инструменты — в разделе «Рынок»", mode: "click" },
        {
          target: "seg-Фонды",
          title: "Начните с минимума",
          text: "Пай фонда ликвидности стоит около 2 ₽. А можно выбрать и любую акцию — решать вам",
          mode: "click",
          secondary: "Выберу сам",
        },
        {
          target: "instr-LQDT",
          title: "Фонд ликвидности",
          text: "Деньги работают каждый день, продать можно в любой момент",
          mode: "click",
          secondary: "Выберу сам",
        },
        { target: "btn-buy", title: "Купить", text: "Нажмите «Купить»", mode: "click" },
        {
          target: "trade-submit",
          title: "Подтверждение",
          text: training ? "Сделка виртуальная — подтверждайте смело" : "Проверьте сумму. Покупка произойдёт только после нажатия",
          mode: "click",
        },
      ],
    });
  }, [start]);

  useEffect(() => {
    app.hintRef.current = startHint;
  }, [app.hintRef, startHint]);

  // Кнопка «Помощь» на любом экране
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest?.("[data-help-trigger]")) appRef.current.openHelp();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Первый запуск: онбординг стартует после приветствия
  useEffect(() => {
    if (app.onboarding === "running" && !tour && app.mode === "real" && app.current.name === "home") {
      start("onb-home");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.onboarding]);

  // Подсказка к заданию закрывается, как только задание выполнено
  useEffect(() => {
    setTour((t) => (t?.kind === "hint" ? null : t));
  }, [app.training.done]);

  // Смена режима прерывает тур — кроме квеста, который как раз и переключает режим
  useEffect(() => {
    setTour((t) => (t?.kind === "quest" ? t : null));
  }, [app.mode]);

  return (
    <TourCtx.Provider value={{ start, startHelp, startHint, startQuest, active: tour }}>
      {children}
      {tour && app.frameRef.current && createPortal(<TourLayer key={tour.id} tour={tour} idx={idx} setIdx={setIdx} end={endTour} />, app.frameRef.current)}
    </TourCtx.Provider>
  );
}

// ---------- Слой spotlight + tooltip ----------

function TourLayer({ tour, idx, setIdx, end }: { tour: Tour; idx: number; setIdx: (n: number) => void; end: () => void }) {
  const app = useApp();
  const [rect, setRect] = useState<Rect | null>(null);
  const [frameSize, setFrameSize] = useState({ w: 390, h: 800 });
  const [shake, setShake] = useState(0);
  const step = tour.steps[idx];
  const mode = step?.mode ?? "next";
  const elRef = useRef<HTMLElement | null>(null);
  const idxRef = useRef(idx);
  idxRef.current = idx;

  const finish = useCallback(() => {
    end();
    tour.onDone?.();
  }, [end, tour]);

  const next = useCallback(() => {
    const i = idxRef.current;
    tour.steps[i]?.onNext?.();
    if (i + 1 >= tour.steps.length) finish();
    else setIdx(i + 1);
  }, [finish, setIdx, tour.steps]);

  const close = () => {
    end();
    tour.onClose?.();
  };

  // Переход по событию интерфейса
  useEffect(
    () =>
      app.subscribe((ev) => {
        if (tour.endOn === ev) {
          end();
          return;
        }
        const s = tour.steps[idxRef.current];
        if (s?.advanceOn && s.advanceOn === ev) next();
      }),
    [app, next, end, tour.endOn, tour.steps],
  );

  // Отслеживание цели каждый кадр: цель может анимироваться, прокручиваться или появиться позже
  useLayoutEffect(() => {
    const frame = app.frameRef.current;
    if (!frame || !step) return;
    let raf = 0;
    let missingSince = performance.now();
    let scrolled = false;
    const find = (target: string) => {
      const el = frame.querySelector<HTMLElement>(`[data-tour~="${target}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 ? el : null;
    };
    const loop = () => {
      // Подсказка к заданию: перескакиваем на самый дальний шаг, цель которого уже на экране
      if (tour.kind === "hint" || tour.kind === "quest") {
        for (let j = tour.steps.length - 1; j > idxRef.current; j--) {
          if (find(tour.steps[j].target)) {
            setIdx(j);
            return;
          }
        }
      }
      const el = find(step.target);
      const fr = frame.getBoundingClientRect();
      if (el) {
        missingSince = performance.now();
        elRef.current = el;
        if (!scrolled) {
          scrolled = true;
          const r0 = el.getBoundingClientRect();
          if (r0.top < fr.top + 60 || r0.bottom > fr.bottom - 150) el.scrollIntoView({ block: "center", behavior: "smooth" });
        }
        const r = el.getBoundingClientRect();
        const nr = { x: Math.round(r.left - fr.left), y: Math.round(r.top - fr.top), w: Math.round(r.width), h: Math.round(r.height) };
        setRect((p) => (p && p.x === nr.x && p.y === nr.y && p.w === nr.w && p.h === nr.h ? p : nr));
        setFrameSize((p) => (p.w === Math.round(fr.width) && p.h === Math.round(fr.height) ? p : { w: Math.round(fr.width), h: Math.round(fr.height) }));
      } else {
        elRef.current = null;
        setRect(null);
        if (performance.now() - missingSince > 1600) {
          // Цель так и не появилась — пропускаем шаг (или завершаем подсказку)
          if (tour.kind === "hint" || tour.kind === "quest" || idxRef.current + 1 >= tour.steps.length) {
            end();
            return;
          }
          setIdx(idxRef.current + 1);
          return;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [app.frameRef, step, tour, setIdx, end]);

  if (!step) return null;

  const pad = 6;
  const cut = rect ? { x: rect.x - pad, y: rect.y - pad, w: rect.w + pad * 2, h: rect.h + pad * 2 } : null;
  const passThrough = mode === "click";

  // Позиция тултипа
  const tipW = Math.min(300, frameSize.w - 24);
  let tipStyle: CSSProperties = { left: 12, bottom: 90, width: tipW };
  let arrow: { left: number; side: "top" | "bottom" } | null = null;
  if (cut) {
    const cx0 = cut.x + cut.w / 2;
    const left = Math.max(12, Math.min(frameSize.w - tipW - 12, cx0 - tipW / 2));
    const below = frameSize.h - (cut.y + cut.h);
    const placeBelow = below > 200 || below > cut.y;
    tipStyle = placeBelow ? { left, top: cut.y + cut.h + 14, width: tipW } : { left, bottom: frameSize.h - cut.y + 14, width: tipW };
    arrow = { left: Math.max(18, Math.min(tipW - 18, cx0 - left)), side: placeBelow ? "top" : "bottom" };
  }

  const onBlockerClick = (e: ReactMouseEvent) => {
    if (!cut) return;
    const fr = app.frameRef.current!.getBoundingClientRect();
    const px = e.clientX - fr.left;
    const py = e.clientY - fr.top;
    const inside = px >= cut.x && px <= cut.x + cut.w && py >= cut.y && py <= cut.y + cut.h;
    if (inside && mode === "next") next();
    else if (tour.kind === "hint" || tour.kind === "quest") end();
    else setShake((s) => s + 1);
  };

  const total = tour.steps.length;
  const isLast = idx + 1 >= total;
  const primaryLabel = step.button ?? (mode === "click" ? "Показать" : isLast ? "Готово" : "Далее");
  const onPrimary = () => {
    if (mode === "click") elRef.current?.click();
    else next();
  };

  return (
    // pointer-events-none на корне — иначе он сам перехватывает клики в «прозрачном» вырезе,
    // даже когда все видимые слои внутри него pointer-events-none. Интерактивные части
    // (блокеры фона, тултип) явно возвращают pointer-events-auto.
    <div className="pointer-events-none absolute inset-0 z-[700]" aria-live="polite">
      {/* Затемнение с вырезом */}
      {cut ? (
        <div
          className="pointer-events-none absolute rounded-l transition-all duration-300"
          style={{
            left: cut.x,
            top: cut.y,
            width: cut.w,
            height: cut.h,
            boxShadow: "0 0 0 9999px var(--overlay)",
            outline: "2px dashed var(--accent)",
            outlineOffset: 2,
            transitionTimingFunction: "var(--ease)",
          }}
        >
          {/* Пульсация — отдельным слоем: иначе анимация box-shadow перетирает затемнение вокруг выреза */}
          {passThrough && <span className="absolute inset-0 rounded-l anim-pulse" />}
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-0 anim-fade" style={{ background: "var(--overlay)" }} />
      )}

      {/* Блокировка фона. Для шагов click вырез пропускает нажатие к настоящему элементу */}
      {passThrough && cut ? (
        <>
          <div className="pointer-events-auto absolute left-0 right-0 top-0" style={{ height: Math.max(0, cut.y) }} onClick={onBlockerClick} />
          <div className="pointer-events-auto absolute left-0 right-0 bottom-0" style={{ top: cut.y + cut.h }} onClick={onBlockerClick} />
          <div className="pointer-events-auto absolute left-0" style={{ top: cut.y, height: cut.h, width: Math.max(0, cut.x) }} onClick={onBlockerClick} />
          <div className="pointer-events-auto absolute right-0" style={{ top: cut.y, height: cut.h, left: cut.x + cut.w }} onClick={onBlockerClick} />
        </>
      ) : (
        <div className="pointer-events-auto absolute inset-0" onClick={onBlockerClick} />
      )}

      {/* Указатель-«палец» для шагов, где нужно нажать самому */}
      {cut && passThrough && (
        <div className="pointer-events-none absolute flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white shadow-e2 anim-pop" style={{ left: cut.x + cut.w - 16, top: cut.y - 12 }}>
          <Icon name="target" size={16} />
        </div>
      )}

      {/* Тултип */}
      <div
        key={`${idx}-${shake}`}
        role="dialog"
        aria-label={step.title}
        className={cx("pointer-events-auto absolute rounded-l border border-line-subtle bg-surface p-4 shadow-e3", shake ? "anim-shake" : "anim-rise")}
        style={tipStyle}
      >
        {arrow && (
          <span
            className="absolute h-3 w-3 rotate-45 border-line-subtle bg-surface"
            style={{
              left: arrow.left - 6,
              ...(arrow.side === "top" ? { top: -7, borderLeftWidth: 1, borderTopWidth: 1 } : { bottom: -7, borderRightWidth: 1, borderBottomWidth: 1 }),
            }}
          />
        )}
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-accent-text">
              {tour.kind === "quest" ? "Первая покупка" : tour.kind === "hint" ? "Подсказка" : total > 1 ? `Шаг ${idx + 1} из ${total}` : app.mode === "training" ? "Тренировка" : "Подсказка"}
            </div>
            <div className="text-[18px] font-semibold leading-6">{step.title}</div>
            <p className="mt-1 text-[14px] leading-5 text-ink-2">{step.text}</p>
          </div>
          {!step.lockClose && (
            <button type="button" onClick={close} className="-mr-2 -mt-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-m text-ink-3 cursor-pointer" aria-label={tour.kind === "onboarding" ? "Закрыть обучение" : "Закрыть подсказку"}>
              <Icon name="x" size={20} />
            </button>
          )}
        </div>
        {step.lockClose && <p className="mt-1 text-[12px] text-ink-3">Этот шаг обязателен — пройдите его до конца</p>}
        <div className="mt-3 flex items-center justify-between gap-2">
          {total > 1 ? (
            <div className="flex gap-1.5" aria-hidden="true">
              {tour.steps.map((_, i) => (
                <span key={i} className={cx("h-1.5 rounded-full transition-all", i === idx ? "w-4 bg-accent" : i < idx ? "w-1.5 bg-accent" : "w-1.5 bg-line-strong")} />
              ))}
            </div>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-1">
            {step.secondary && (
              <button
                type="button"
                onClick={() => {
                  end();
                  tour.onSecondary?.();
                }}
                className="h-9 px-2 text-[13px] font-semibold text-ink-2 cursor-pointer"
              >
                {step.secondary}
              </button>
            )}
            {/* Шаги click требуют реального тапа по разделу — кнопки-обманки нет, только выход (если шаг не обязателен) */}
            {mode === "click" ? (
              !step.lockClose && (
                <button type="button" onClick={close} className="h-9 px-2 text-[13px] font-semibold text-ink-2 cursor-pointer">
                  Закрыть
                </button>
              )
            ) : (
              <button type="button" onClick={onPrimary} className="h-9 rounded-m bg-accent px-4 text-[13px] font-semibold text-white active:bg-accent-pressed cursor-pointer">
                {primaryLabel}
              </button>
            )}
          </div>
        </div>
        {mode === "click" && <p className="mt-1.5 text-[12px] text-ink-3">Нажмите на выделенный раздел на экране</p>}
      </div>
    </div>
  );
}
