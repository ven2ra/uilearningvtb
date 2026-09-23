import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { INITIAL_PRICES, INSTRUMENT_BY_ID, REAL_ACCOUNT, VIRTUAL_START_CASH, type Doc, type Operation, type Position } from "../lib/data";
import { STAGES, TASKS } from "../lib/training";
import { ACHIEVEMENTS, ACH_BY_ID } from "../lib/achievements";
import { FINCODE_BY_ID, FINCODE_COVERS, FINCODE_DISCOUNTS, MICRO_TASKS, MICRO_TASK_BY_ID, dailyMicroTaskIds, daysBetween, todayStr } from "../lib/fincode";
import { fmtMoney, fmtQty } from "../lib/format";

export type Mode = "real" | "training";
export type ScreenName =
  | "home"
  | "portfolio"
  | "market"
  | "history"
  | "more"
  | "hub"
  | "achievements"
  | "instrument"
  | "trade"
  | "topup"
  | "withdraw"
  | "documents"
  | "doc-order"
  | "doc-ready"
  | "training-intro"
  | "training-finish"
  | "fincode"
  | "fincode-topic"
  | "fincode-shop"
  | "chat";

export interface Screen {
  name: ScreenName;
  params?: { id?: string; side?: "buy" | "sell" };
}

export type OnboardingStatus = "new" | "running" | "done" | "skipped";

export interface Account {
  cash: number;
  positions: Position[];
  history: Operation[];
  docs: Doc[];
}

export interface TrainingState extends Account {
  started: boolean;
  done: number; // выполнено заданий программы
  log: { taskId: string; ts: number }[];
  /** Задания, выполненные раньше очереди: засчитаются, когда программа до них дойдёт */
  credited: string[];
  finished: boolean;
  readyCardDismissed: boolean;
}

/** Квест «Первая покупка»: предлагается при первом заходе на биржу */
export interface BuyQuest {
  offer: "new" | "seen";
  active: Mode | null;
  done: boolean;
}

export interface Toast {
  id: number;
  kind: "success" | "error" | "info" | "achievement";
  title: string;
  text?: string;
  action?: { label: string; fn: () => void };
}

export interface StageModal {
  stage: number;
  /** Если одно действие закрыло несколько этапов */
  fromStage?: number;
  success: string;
  achievementIds: string[];
}

/** Прогресс «Финкода»: темы, стрик, финкоины, магазин */
export interface FinCodeState {
  progress: Record<string, { done: boolean; bestScore: number }>;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  coins: number;
  /** Дата → id выполненных сегодня микро-заданий */
  dailyChoices: Record<string, string[]>;
  ownedCovers: string[];
  equippedCover: string;
  activeDiscount: { pct: number; until: number } | null;
}

type Listener = (ev: string) => void;

const freshTraining = (): TrainingState => ({
  started: false,
  done: 0,
  log: [],
  credited: [],
  cash: VIRTUAL_START_CASH,
  positions: [],
  history: [],
  docs: [],
  finished: false,
  readyCardDismissed: false,
});

const freshReal = (): Account => ({ cash: REAL_ACCOUNT.cash, positions: REAL_ACCOUNT.positions, history: REAL_ACCOUNT.history, docs: REAL_ACCOUNT.docs });
const freshQuest = (): BuyQuest => ({ offer: "new", active: null, done: false });
const freshFinCode = (): FinCodeState => ({
  progress: {},
  streak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  coins: 0,
  dailyChoices: {},
  ownedCovers: ["classic"],
  equippedCover: "classic",
  activeDiscount: null,
});

interface Persisted {
  onboarding: OnboardingStatus;
  training: TrainingState;
  real: Account;
  achievements: { id: string; ts: number }[];
  buyQuest: BuyQuest;
  finCode: FinCodeState;
}

const STORAGE_KEY = "vtb-learning-proto-v3";

function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Persisted) : null;
  } catch {
    return null;
  }
}

function savePersisted(p: Persisted) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* хранилище недоступно — прототип работает без него */
  }
}

let uid = 0;
const nextId = (p: string) => `${p}${Date.now().toString(36)}${(uid++).toString(36)}`;

/** Экраны, которые существуют только в одном из режимов */
const TRAINING_ONLY: ScreenName[] = ["hub", "training-intro", "training-finish"];
const REAL_ONLY: ScreenName[] = ["more"];

function useAppStateValue() {
  const persisted = useMemo(loadPersisted, []);
  const frameRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<Mode>("real");
  const [stack, setStack] = useState<Screen[]>([{ name: "home" }]);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingStatus>(persisted?.onboarding ?? "new");
  const [training, setTraining] = useState<TrainingState>(persisted?.training ?? freshTraining());
  const [real, setReal] = useState<Account>(persisted?.real ?? freshReal());
  const [achievements, setAchievements] = useState<{ id: string; ts: number }[]>(persisted?.achievements ?? []);
  const [buyQuest, setBuyQuest] = useState<BuyQuest>(persisted?.buyQuest ?? freshQuest());
  const [finCode, setFinCode] = useState<FinCodeState>(persisted?.finCode ?? freshFinCode());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [stageModal, setStageModal] = useState<StageModal | null>(null);
  const [achModal, setAchModal] = useState<string[] | null>(null);
  const [helpPulse, setHelpPulse] = useState(false);
  const [taskPanelOpen, setTaskPanelOpen] = useState(true);
  const [prices, setPrices] = useState<Record<string, number>>(INITIAL_PRICES);
  const [moves, setMoves] = useState<Record<string, "up" | "down">>({});

  useEffect(
    () => savePersisted({ onboarding, training, real, achievements, buyQuest, finCode }),
    [onboarding, training, real, achievements, buyQuest, finCode],
  );

  // Имитация движения котировок (тестовые данные)
  useEffect(() => {
    const t = window.setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev };
        const mv: Record<string, "up" | "down"> = {};
        for (const id of Object.keys(prev)) {
          if (Math.random() < 0.45) continue;
          const type = INSTRUMENT_BY_ID[id].type;
          const vol = type === "Акции" || type === "Фьючерсы" ? 0.004 : 0.0008;
          const d = (Math.random() - 0.48) * vol;
          next[id] = +(prev[id] * (1 + d)).toFixed(prev[id] < 10 ? 4 : 2);
          mv[id] = d >= 0 ? "up" : "down";
        }
        setMoves(mv);
        return next;
      });
    }, 3000);
    return () => window.clearInterval(t);
  }, []);

  // ---------- Тосты ----------
  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = ++uid;
    setToasts((prev) => [...prev.filter((x) => x.title !== t.title), { ...t, id }].slice(-1));
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), t.kind === "error" ? 4500 : 3200);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((prev) => prev.filter((x) => x.id !== id)), []);

  // ---------- Рефы для синхронной логики событий ----------
  const listeners = useRef(new Set<Listener>());
  const subscribe = useCallback((fn: Listener) => {
    listeners.current.add(fn);
    return () => void listeners.current.delete(fn);
  }, []);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const trainingRef = useRef(training);
  trainingRef.current = training;
  const realRef = useRef(real);
  realRef.current = real;
  const achRef = useRef(achievements);
  achRef.current = achievements;
  const finCodeRef = useRef(finCode);
  finCodeRef.current = finCode;
  const hintRef = useRef<() => void>(() => {});
  const goRef = useRef<(name: ScreenName) => void>(() => {});

  // ---------- Достижения ----------
  /** Открывает достижения и возвращает только новые */
  const unlock = useCallback((ids: string[]) => {
    const fresh = ids.filter((id) => !achRef.current.some((a) => a.id === id));
    if (!fresh.length) return [];
    const ts = Date.now();
    achRef.current = [...achRef.current, ...fresh.map((id) => ({ id, ts }))];
    setAchievements(achRef.current);
    return fresh;
  }, []);

  /**
   * Показ новых достижений. События одного действия (например, покупка → инструмент, тип, покупка)
   * собираются в пачку: крупные — праздничным окном, остальные — одним тостом.
   * Если в этот момент показывается завершение этапа, достижения попадают в него.
   */
  const pendingAch = useRef<string[]>([]);
  const flushTimer = useRef<number | null>(null);
  const stageModalRef = useRef<StageModal | null>(null);
  const celebrate = useCallback(
    (ids: string[]) => {
      if (!ids.length) return;
      pendingAch.current.push(...ids);
      if (flushTimer.current) return;
      flushTimer.current = window.setTimeout(() => {
        flushTimer.current = null;
        const batch = pendingAch.current;
        pendingAch.current = [];
        const defs = batch.map((id) => ACH_BY_ID[id]);
        if (stageModalRef.current) {
          const next = { ...stageModalRef.current, achievementIds: [...stageModalRef.current.achievementIds, ...batch] };
          stageModalRef.current = next;
          setStageModal(next);
        } else if (defs.some((d) => d.major)) {
          setToasts([]);
          setAchModal(batch);
        } else {
          toast({
            kind: "achievement",
            title: defs.length > 1 ? `Достижения: ${defs.map((d) => d.title).join(", ")}` : `Достижение: ${defs[0].title}`,
            text: defs.length > 1 ? undefined : defs[0].desc,
            action: { label: "Все", fn: () => goRef.current("achievements") },
          });
        }
      }, 420);
    },
    [toast],
  );

  const showStageModal = useCallback((m: StageModal | null) => {
    stageModalRef.current = m;
    setStageModal(m);
  }, []);

  // ---------- Платина: все остальные достижения собраны — как в PlayStation ----------
  useEffect(() => {
    const rest = ACHIEVEMENTS.filter((a) => a.id !== "platinum");
    const got = new Set(achievements.map((a) => a.id));
    if (rest.every((a) => got.has(a.id)) && !got.has("platinum")) {
      celebrate(unlock(["platinum"]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievements]);

  // ---------- Программа тренировки ----------
  /** Засчитывает задание idx и все следующие, выполненные заранее. Возвращает завершённые этапы. */
  const advanceProgram = useCallback((idx: number) => {
    const t = trainingRef.current;
    const ts = Date.now();
    let done = idx + 1;
    while (done < TASKS.length && t.credited.includes(TASKS[done].id)) done++;
    const completed = TASKS.slice(idx, done);
    const endedStages = completed.filter((task, i) => TASKS[idx + i + 1]?.stage !== task.stage).map((task) => task.stage);
    const next: TrainingState = {
      ...t,
      done,
      log: [...t.log, ...completed.map((task) => ({ taskId: task.id, ts }))],
      finished: done >= TASKS.length,
    };
    trainingRef.current = next;
    setTraining((cur) => ({ ...cur, done: next.done, log: next.log, finished: next.finished }));
    setTaskPanelOpen(true);
    return { completed, endedStages };
  }, []);

  // ---------- Шина событий ----------
  const emit = useCallback(
    (ev: string) => {
      listeners.current.forEach((fn) => fn(ev));
      const m = modeRef.current;

      // 1. Задания программы тренировки
      const t = trainingRef.current;
      if (m === "training" && t.started && t.done < TASKS.length) {
        const task = TASKS[t.done];
        if (ev === task.event) {
          const { completed, endedStages } = advanceProgram(t.done);
          celebrate(unlock(ACHIEVEMENTS.filter((a) => a.stage && endedStages.includes(a.stage)).map((a) => a.id)));
          if (endedStages.length) {
            const auto = completed.length > 1 ? " Следующие задания вы уже выполнили раньше — они засчитаны." : "";
            const modal = { stage: endedStages[endedStages.length - 1], fromStage: endedStages[0], success: task.success + auto, achievementIds: [] as string[] };
            stageModalRef.current = modal;
            window.setTimeout(() => {
              setToasts([]);
              setStageModal(stageModalRef.current);
            }, 350);
          } else {
            toast({ kind: "success", title: "Задание выполнено", text: task.success });
          }
        } else if (task.wrong?.[ev]) {
          toast({ kind: "error", title: "Не совсем", text: task.wrong[ev], action: { label: "Подсказка", fn: () => hintRef.current() } });
        } else if (ev.startsWith("do:")) {
          // Действие из будущего этапа: засчитаем, когда программа до него дойдёт
          const ahead = TASKS.slice(t.done + 1).find((x) => x.event === ev && !t.credited.includes(x.id));
          if (ahead) {
            const next = { ...t, credited: [...t.credited, ahead.id] };
            trainingRef.current = next;
            setTraining((cur) => ({ ...cur, credited: next.credited }));
          }
        }
      }

      // 2. Достижения за действия
      celebrate(unlock(ACHIEVEMENTS.filter((a) => a.event === ev && (a.mode === "any" || a.mode === m)).map((a) => a.id)));

      // 3. Микро-задания Финкода: стрик и финкоины за реальные действия дня
      const today = todayStr();
      const offeredIds = dailyMicroTaskIds(today);
      const doneToday = finCodeRef.current.dailyChoices[today] ?? [];
      const microTask = MICRO_TASKS.find((mt) => offeredIds.includes(mt.id) && !doneToday.includes(mt.id) && mt.events.includes(ev));
      if (microTask) {
        const cur = finCodeRef.current;
        const wasEmpty = doneToday.length === 0;
        const diff = cur.lastActiveDate ? daysBetween(cur.lastActiveDate, today) : null;
        const newStreak = !wasEmpty ? cur.streak : diff === 0 ? cur.streak : diff === 1 ? cur.streak + 1 : 1;
        const next: FinCodeState = {
          ...cur,
          coins: cur.coins + microTask.coins,
          streak: newStreak,
          longestStreak: Math.max(cur.longestStreak, newStreak),
          lastActiveDate: wasEmpty ? today : cur.lastActiveDate,
          dailyChoices: { ...cur.dailyChoices, [today]: [...doneToday, microTask.id] },
        };
        finCodeRef.current = next;
        setFinCode(next);
        toast({
          kind: "achievement",
          title: `Финкод: +${microTask.coins} финкоинов`,
          text: wasEmpty ? `«${microTask.title}» — стрик продлён до ${newStreak}` : `«${microTask.title}» выполнено`,
        });
        if (newStreak === 7 || newStreak === 30) {
          celebrate(unlock(ACHIEVEMENTS.filter((a) => a.event === `fincode:streak:${newStreak}`).map((a) => a.id)));
        }
      }
    },
    [advanceProgram, celebrate, toast, unlock],
  );

  // ---------- Навигация ----------
  const current = stack[stack.length - 1];

  const go = useCallback(
    (name: ScreenName, params?: Screen["params"]) => {
      setHelpOpen(false);
      setStack((s) => [...s, { name, params }]);
      emit(`open:${name}`);
    },
    [emit],
  );
  goRef.current = go;

  const tab = useCallback(
    (name: ScreenName) => {
      setActionsOpen(false);
      setHelpOpen(false);
      setStack([{ name }]);
      emit(`open:${name}`);
    },
    [emit],
  );

  const back = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const replace = useCallback((name: ScreenName, params?: Screen["params"]) => setStack((s) => [...s.slice(0, -1), { name, params }]), []);

  const openActions = useCallback(() => {
    setActionsOpen(true);
    emit("open:actions");
  }, [emit]);

  const openFromActions = useCallback(
    (name: ScreenName) => {
      setActionsOpen(false);
      go(name);
    },
    [go],
  );

  const openHelp = useCallback(() => {
    setHelpOpen(true);
    emit("help:open");
  }, [emit]);

  // ---------- Режимы ----------
  const resetOverlays = () => {
    setToasts([]);
    setActionsOpen(false);
    setHelpOpen(false);
    setOfferOpen(false);
    showStageModal(null);
    setAchModal(null);
  };

  const applyMode = (to: Mode) => {
    setMode(to);
    modeRef.current = to;
  };

  const markTrainingStarted = () => {
    if (trainingRef.current.started) return;
    const next = { ...trainingRef.current, started: true };
    trainingRef.current = next;
    setTraining((t) => ({ ...t, started: true }));
  };

  /** Контекстное переключение режима — пользователь остаётся на том же экране */
  const switchMode = useCallback(
    (to: Mode) => {
      resetOverlays();
      const wasStarted = trainingRef.current.started;
      if (to === "training") markTrainingStarted();
      applyMode(to);
      setStack((s) => {
        const invalid = to === "real" ? TRAINING_ONLY : REAL_ONLY;
        const kept = s.filter((x) => !invalid.includes(x.name));
        return kept.length ? kept : [{ name: "home" }];
      });
      setTaskPanelOpen(true);
      if (to === "training") {
        if (!wasStarted) toast({ kind: "info", title: "Фейковые торги включены", text: "1 000 000 ₽ виртуальных. Реальные деньги не используются" });
        emit("mode:training");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [emit, toast],
  );

  /** Вход в программу обучения с карточки «Пройти обучение» */
  const enterTraining = useCallback(() => {
    resetOverlays();
    applyMode("training");
    if (!trainingRef.current.started) setStack([{ name: "training-intro" }]);
    else if (trainingRef.current.finished) setStack([{ name: "hub" }]);
    else setStack([{ name: "home" }]);
    setTaskPanelOpen(true);
    emit("mode:training");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emit]);

  const startTraining = useCallback(() => {
    markTrainingStarted();
    setStack([{ name: "home" }]);
    setTaskPanelOpen(true);
  }, []);

  const exitTraining = useCallback(() => {
    resetOverlays();
    applyMode("real");
    setStack([{ name: "home" }]);
  }, []);

  const restartTraining = useCallback(() => {
    const fresh = { ...freshTraining(), started: true };
    setTraining(fresh);
    trainingRef.current = fresh;
    resetOverlays();
    applyMode("training");
    setStack([{ name: "home" }]);
    setTaskPanelOpen(true);
  }, []);

  // ---------- Квест «Первая покупка» ----------
  const startBuyQuest = useCallback(
    (where: Mode) => {
      setOfferOpen(false);
      setBuyQuest((q) => ({ ...q, offer: "seen", active: where }));
      if (where !== modeRef.current) switchMode(where);
    },
    [switchMode],
  );
  const closeBuyQuest = useCallback(() => {
    setBuyQuest((q) => ({ ...q, active: null }));
    toast({ kind: "info", title: "Подсказки к покупке закрыты", text: "Вернуться к ним можно через «Помощь»" });
  }, [toast]);
  const markOfferSeen = useCallback(() => setBuyQuest((q) => (q.offer === "seen" ? q : { ...q, offer: "seen" })), []);

  // ---------- Счета ----------
  const account: Account = mode === "training" ? training : real;
  const setAccount = (fn: (a: Account) => Account) => {
    if (modeRef.current === "training") {
      const next = { ...trainingRef.current, ...fn(trainingRef.current) };
      trainingRef.current = next;
      setTraining(next);
    } else {
      const next = fn(realRef.current);
      realRef.current = next;
      setReal(next);
    }
  };
  const accountNow = () => (modeRef.current === "training" ? trainingRef.current : realRef.current);

  const portfolioValue = account.cash + account.positions.reduce((s, p) => s + p.qty * (prices[p.id] ?? p.avg), 0);
  const investedCost = account.positions.reduce((s, p) => s + p.qty * p.avg, 0);
  const positionsValue = portfolioValue - account.cash;
  const dayChange = account.positions.reduce((s, p) => s + p.qty * ((prices[p.id] ?? 0) - INSTRUMENT_BY_ID[p.id].open), 0);

  // ---------- Комиссия с учётом скидки за финкоины ----------
  const currentFeeRate = () => {
    const d = finCodeRef.current.activeDiscount;
    const active = d && d.until > Date.now() ? d : null;
    return 0.0005 * (1 - (active?.pct ?? 0) / 100);
  };
  const activeDiscount = finCode.activeDiscount && finCode.activeDiscount.until > Date.now() ? finCode.activeDiscount : null;

  /**
   * Сделка. В тренировке — виртуальная, в реальном режиме прототипа — имитация на тестовом счёте.
   * Возвращает текст ошибки или null.
   */
  const trade = useCallback(
    (id: string, side: "buy" | "sell", qty: number): string | null => {
      const training = modeRef.current === "training";
      const instr = INSTRUMENT_BY_ID[id];
      if (!training && instr.needsTest) {
        const passedMargin = finCodeRef.current.progress["margin"]?.done || finCodeRef.current.progress["final"]?.done;
        if (!passedMargin) return "Пройдите тему «Срочный рынок и маржа» в Финкоде, чтобы открыть этот инструмент";
      }
      const price = prices[id];
      const acc = accountNow();
      const pos = acc.positions.find((p) => p.id === id);
      const sum = price * qty;
      const fee = +(sum * currentFeeRate()).toFixed(2);
      if (!qty || qty <= 0) return "Укажите количество";
      if (side === "buy" && sum + fee > acc.cash) {
        emit("err:insufficient");
        return training ? "Недостаточно виртуальных средств" : "Недостаточно денег на счёте — пополните его";
      }
      if (side === "sell" && (!pos || pos.qty < qty)) {
        emit("err:oversell");
        return `В портфеле только ${fmtQty(pos?.qty ?? 0)}`;
      }
      const op: Operation = {
        id: nextId("o"),
        ts: Date.now(),
        kind: side,
        title: `${side === "buy" ? "Покупка" : "Продажа"} ${instr.name}`,
        amount: side === "buy" ? -(sum + fee) : sum - fee,
        detail: `${fmtQty(qty)} по ${fmtMoney(price)} · комиссия ${fmtMoney(fee)}`,
      };
      setAccount((a) => {
        let positions = a.positions;
        const p = positions.find((x) => x.id === id);
        if (side === "buy") {
          positions = p
            ? positions.map((x) => (x.id === id ? { ...x, qty: x.qty + qty, avg: (x.avg * x.qty + sum) / (x.qty + qty) } : x))
            : [...positions, { id, qty, avg: price }];
        } else {
          positions = positions.map((x) => (x.id === id ? { ...x, qty: x.qty - qty } : x)).filter((x) => x.qty > 0);
        }
        return { ...a, positions, cash: a.cash + op.amount, history: [op, ...a.history] };
      });
      if (side === "buy") {
        setBuyQuest((q) => ({ ...q, offer: "seen", active: null, done: true }));
        // Уточняющие события — за конкретный инструмент и тип
        emit(`do:buy:${id}`);
        emit(`do:buy:${instr.type}`);
      }
      emit(side === "buy" ? "do:buy" : "do:sell");
      return null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prices, emit],
  );

  const moveMoney = useCallback(
    (kind: "topup" | "withdraw", amount: number): string | null => {
      const training = modeRef.current === "training";
      const acc = accountNow();
      if (!amount || amount <= 0) return "Укажите сумму";
      if (kind === "withdraw" && amount > acc.cash) return "Сумма больше доступного остатка";
      if (kind === "topup" && amount > 5_000_000) return "Максимум 5 000 000 ₽ за раз";
      const op: Operation = {
        id: nextId("o"),
        ts: Date.now(),
        kind,
        title: training ? (kind === "topup" ? "Виртуальное пополнение" : "Виртуальный вывод") : kind === "topup" ? "Пополнение с карты" : "Вывод на карту",
        amount: kind === "topup" ? amount : -amount,
        detail: training ? "Учебная карта ··0000" : "Карта ВТБ ··1234",
      };
      setAccount((a) => ({ ...a, cash: a.cash + op.amount, history: [op, ...a.history] }));
      emit(`do:${kind}`);
      return null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [emit],
  );

  const orderDoc = useCallback(
    (title: string, period: string) => {
      const doc: Doc = { id: nextId("d"), title, period, status: "pending", ts: Date.now() };
      const training = modeRef.current === "training";
      const set = (fn: (d: Doc[]) => Doc[]) =>
        training ? setTraining((t) => ({ ...t, docs: fn(t.docs) })) : setReal((r) => ({ ...r, docs: fn(r.docs) }));
      set((d) => [doc, ...d]);
      window.setTimeout(() => set((d) => d.map((x) => (x.id === doc.id ? { ...x, status: "ready" } : x))), 4000);
      emit("do:order-doc");
    },
    [emit],
  );

  // ---------- Финкод: темы, стрик, финкоины ----------
  /** Эффективный стрик для показа: если пропущен день и больше — считаем прерванным, даже если ещё не записали это */
  const finCodeStreak = (() => {
    if (!finCode.lastActiveDate) return 0;
    const diff = daysBetween(finCode.lastActiveDate, todayStr());
    return diff <= 1 ? finCode.streak : 0;
  })();
  /** Три задания на сегодня (меняются по дням) и то, какие из них уже выполнены */
  const finCodeDaily = (() => {
    const today = todayStr();
    const doneIds = finCode.dailyChoices[today] ?? [];
    return { offered: dailyMicroTaskIds(today).map((id) => MICRO_TASK_BY_ID[id]), doneIds };
  })();

  /** Прохождение темы/теста: только очки прогресса и финкоины за первое прохождение — на стрик не влияет */
  const completeFinCodeQuiz = useCallback(
    (topicId: string, correct: number, total: number) => {
      const topic = FINCODE_BY_ID[topicId];
      if (!topic) return { passed: false, coinsEarned: 0 };
      const passed = total > 0 && correct / total >= topic.passRatio;
      if (!passed) return { passed, coinsEarned: 0 };
      const cur = finCodeRef.current;
      const firstTime = !cur.progress[topicId]?.done;
      const topicCoins = firstTime ? topic.reward : 0;
      const next: FinCodeState = {
        ...cur,
        progress: { ...cur.progress, [topicId]: { done: true, bestScore: Math.max(cur.progress[topicId]?.bestScore ?? 0, correct) } },
        coins: cur.coins + topicCoins,
      };
      finCodeRef.current = next;
      setFinCode(next);
      emit(`fincode:topic:${topicId}:passed`);
      return { passed, coinsEarned: topicCoins };
    },
    [emit],
  );

  const buyCover = useCallback(
    (id: string) => {
      const item = FINCODE_COVERS.find((c) => c.id === id);
      if (!item) return "Такой обложки нет";
      const cur = finCodeRef.current;
      if (cur.ownedCovers.includes(id)) {
        equipCoverInner(id);
        return null;
      }
      if (cur.coins < item.price) return "Недостаточно финкоинов";
      const next: FinCodeState = { ...cur, coins: cur.coins - item.price, ownedCovers: [...cur.ownedCovers, id], equippedCover: id };
      finCodeRef.current = next;
      setFinCode(next);
      toast({ kind: "success", title: "Обложка куплена", text: item.title });
      return null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toast],
  );

  function equipCoverInner(id: string) {
    const cur = finCodeRef.current;
    if (!cur.ownedCovers.includes(id)) return;
    const next = { ...cur, equippedCover: id };
    finCodeRef.current = next;
    setFinCode(next);
  }
  const equipCover = useCallback((id: string) => equipCoverInner(id), []);

  const buyDiscount = useCallback(
    (id: string) => {
      const item = FINCODE_DISCOUNTS.find((d) => d.id === id);
      if (!item) return "Такого предложения нет";
      const cur = finCodeRef.current;
      if (cur.coins < item.price) return "Недостаточно финкоинов";
      const until = Date.now() + item.hours * 3600000;
      const next: FinCodeState = { ...cur, coins: cur.coins - item.price, activeDiscount: { pct: item.pct, until } };
      finCodeRef.current = next;
      setFinCode(next);
      toast({ kind: "success", title: "Скидка активирована", text: item.title });
      return null;
    },
    [toast],
  );

  // ---------- Состояния для демонстрации ----------
  type DemoState = "first-run" | "onboarding-done" | "topped-up" | "training-progress" | "training-done";
  const demo = useCallback((state: DemoState) => {
    resetOverlays();
    applyMode("real");
    setStack([{ name: "home" }]);
    const base = Date.now() - 20 * 60000;
    const stamp = (ids: string[]) => ids.map((id, i) => ({ id, ts: base + i * 60000 }));
    const realTopped: Account = {
      ...freshReal(),
      cash: 5000,
      history: [{ id: "demo-rt", ts: base, kind: "topup", title: "Пополнение с карты", amount: 5000, detail: "Карта ВТБ ··1234" }],
    };
    setBuyQuest(freshQuest());
    if (state === "first-run") {
      setOnboarding("new");
      setTraining(freshTraining());
      setReal(freshReal());
      setAchievements([]);
      return;
    }
    setOnboarding("done");
    if (state === "onboarding-done") {
      setTraining(freshTraining());
      setReal(freshReal());
      setAchievements(stamp(["welcome"]));
      return;
    }
    setReal(realTopped);
    if (state === "topped-up") {
      setTraining(freshTraining());
      setAchievements(stamp(["welcome", "first-topup"]));
      return;
    }
    const done = state === "training-done" ? TASKS.length : TASKS.findIndex((t) => t.stage === 5);
    const buy: Operation = { id: "demo-buy", ts: base, kind: "buy", title: "Покупка Фонд денежного рынка", amount: -178.43, detail: "100 шт. по 1,78 ₽ · комиссия 0,09 ₽" };
    const top: Operation = { id: "demo-top", ts: base - 60000, kind: "topup", title: "Виртуальное пополнение", amount: 50000, detail: "Учебная карта ··0000" };
    const ended = TASKS.slice(0, done);
    const stagesComplete = new Set(ended.filter((t, i) => TASKS[i + 1]?.stage !== t.stage).map((t) => t.stage));
    const stageAch = ACHIEVEMENTS.filter((a) => a.stage && stagesComplete.has(a.stage)).map((a) => a.id);
    const trainingDone = state === "training-done";
    setAchievements(stamp(["welcome", "first-topup", "switcher", "on-market", "explorer", "analyst", ...stageAch, ...(trainingDone ? ["v-buy"] : [])]));
    setTraining({
      ...freshTraining(),
      started: true,
      done,
      log: ended.map((t, i) => ({ taskId: t.id, ts: base + i * 60000 })),
      cash: VIRTUAL_START_CASH + 50000 - (trainingDone ? 178.43 : 0),
      positions: trainingDone ? [{ id: "LQDT", qty: 100, avg: 1.7834 }] : [],
      history: trainingDone ? [buy, top] : [top],
      finished: trainingDone,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doneStages = STAGES.filter((s) => TASKS.map((t) => t.stage).lastIndexOf(s.n) < training.done).length;
  const has = useCallback((id: string) => achievements.some((a) => a.id === id), [achievements]);

  return {
    frameRef: frameRef as RefObject<HTMLDivElement | null>,
    mode,
    stack,
    current,
    go,
    tab,
    back,
    replace,
    actionsOpen,
    setActionsOpen,
    openActions,
    openFromActions,
    helpOpen,
    setHelpOpen,
    openHelp,
    offerOpen,
    setOfferOpen,
    onboarding,
    setOnboarding,
    training,
    setTraining,
    doneStages,
    enterTraining,
    startTraining,
    exitTraining,
    restartTraining,
    switchMode,
    buyQuest,
    startBuyQuest,
    closeBuyQuest,
    markOfferSeen,
    account,
    portfolioValue,
    positionsValue,
    investedCost,
    dayChange,
    prices,
    moves,
    trade,
    feeRate: currentFeeRate(),
    activeDiscount,
    moveMoney,
    orderDoc,
    achievements,
    has,
    finCode,
    finCodeStreak,
    finCodeDaily,
    completeFinCodeQuiz,
    buyCover,
    equipCover,
    buyDiscount,
    achModal,
    setAchModal,
    toasts,
    toast,
    dismissToast,
    stageModal,
    setStageModal: showStageModal,
    helpPulse,
    setHelpPulse,
    taskPanelOpen,
    setTaskPanelOpen,
    emit,
    subscribe,
    hintRef,
    demo,
  };
}

export type AppApi = ReturnType<typeof useAppStateValue>;
export type DemoStateName = Parameters<AppApi["demo"]>[0];

const Ctx = createContext<AppApi | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const value = useAppStateValue();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp вне AppProvider");
  return v;
}
