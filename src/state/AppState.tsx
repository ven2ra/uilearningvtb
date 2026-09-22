import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { INITIAL_PRICES, INSTRUMENT_BY_ID, REAL_ACCOUNT, VIRTUAL_START_CASH, type Doc, type Operation, type Position } from "../lib/data";
import { ACHIEVEMENTS, STAGES, TASKS } from "../lib/training";
import { fmtMoney, fmtQty } from "../lib/format";

export type Mode = "real" | "training";
export type ScreenName =
  | "home"
  | "portfolio"
  | "market"
  | "history"
  | "more"
  | "hub"
  | "instrument"
  | "trade"
  | "topup"
  | "withdraw"
  | "documents"
  | "doc-order"
  | "doc-ready"
  | "training-intro"
  | "training-finish";

export const TAB_SCREENS: ScreenName[] = ["home", "portfolio", "market", "history", "more", "hub"];

export interface Screen {
  name: ScreenName;
  params?: { id?: string; side?: "buy" | "sell" };
}

export type OnboardingStatus = "new" | "running" | "done" | "skipped";

export interface TrainingState {
  started: boolean;
  done: number; // выполнено заданий
  log: { taskId: string; ts: number }[];
  achievements: { id: string; ts: number }[];
  cash: number;
  positions: Position[];
  history: Operation[];
  docs: Doc[];
  finished: boolean;
  readyCardDismissed: boolean;
}

export interface Toast {
  id: number;
  kind: "success" | "error" | "info";
  title: string;
  text?: string;
  action?: { label: string; fn: () => void };
}

export interface StageModal {
  stage: number;
  success: string;
  achievementId?: string;
}

export interface Account {
  cash: number;
  positions: Position[];
  history: Operation[];
  docs: Doc[];
}

type Listener = (ev: string) => void;

const freshTraining = (): TrainingState => ({
  started: false,
  done: 0,
  log: [],
  achievements: [],
  cash: VIRTUAL_START_CASH,
  positions: [],
  history: [],
  docs: [],
  finished: false,
  readyCardDismissed: false,
});

interface Persisted {
  onboarding: OnboardingStatus;
  training: TrainingState;
  realDocs: Doc[];
}

const STORAGE_KEY = "vtb-learning-proto-v1";

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

function useAppStateValue() {
  const persisted = useMemo(loadPersisted, []);
  const frameRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<Mode>("real");
  const [stack, setStack] = useState<Screen[]>([{ name: "home" }]);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [dealInfoOpen, setDealInfoOpen] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingStatus>(persisted?.onboarding ?? "new");
  const [training, setTraining] = useState<TrainingState>(persisted?.training ?? freshTraining());
  const [realDocs, setRealDocs] = useState<Doc[]>(persisted?.realDocs ?? REAL_ACCOUNT.docs);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [stageModal, setStageModal] = useState<StageModal | null>(null);
  const [helpPulse, setHelpPulse] = useState(false);
  const [taskPanelOpen, setTaskPanelOpen] = useState(true);
  const [prices, setPrices] = useState<Record<string, number>>(INITIAL_PRICES);
  const [moves, setMoves] = useState<Record<string, "up" | "down">>({});

  useEffect(() => savePersisted({ onboarding, training, realDocs }), [onboarding, training, realDocs]);

  // Имитация движения котировок (тестовые данные)
  useEffect(() => {
    const t = window.setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev };
        const mv: Record<string, "up" | "down"> = {};
        for (const id of Object.keys(prev)) {
          if (Math.random() < 0.45) continue;
          const vol = INSTRUMENT_BY_ID[id].type === "Акции" ? 0.004 : 0.0008;
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
    setToasts((prev) => [...prev.filter((x) => x.title !== t.title), { ...t, id }].slice(-2));
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), t.kind === "error" ? 4500 : 2800);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((prev) => prev.filter((x) => x.id !== id)), []);

  // ---------- Шина событий (spotlight и задания подписываются на неё) ----------
  const listeners = useRef(new Set<Listener>());
  const subscribe = useCallback((fn: Listener) => {
    listeners.current.add(fn);
    return () => void listeners.current.delete(fn);
  }, []);

  const modeRef = useRef(mode);
  modeRef.current = mode;
  const trainingRef = useRef(training);
  trainingRef.current = training;
  const hintRef = useRef<() => void>(() => {});

  const completeTask = useCallback(
    (idx: number) => {
      const task = TASKS[idx];
      const ts = Date.now();
      const isStageEnd = TASKS[idx + 1]?.stage !== task.stage;
      const ach = isStageEnd ? ACHIEVEMENTS.find((a) => a.stage === task.stage) : undefined;
      setTraining((t) => ({
        ...t,
        done: idx + 1,
        log: [...t.log, { taskId: task.id, ts }],
        achievements: ach ? [...t.achievements, { id: ach.id, ts }] : t.achievements,
        finished: idx + 1 >= TASKS.length ? true : t.finished,
      }));
      if (isStageEnd) {
        window.setTimeout(() => {
          setToasts([]);
          setStageModal({ stage: task.stage, success: task.success, achievementId: ach?.id });
        }, 350);
      } else {
        toast({ kind: "success", title: "Задание выполнено", text: task.success });
      }
      setTaskPanelOpen(true);
    },
    [toast],
  );

  const emit = useCallback(
    (ev: string) => {
      listeners.current.forEach((fn) => fn(ev));
      const t = trainingRef.current;
      if (modeRef.current !== "training" || !t.started || t.done >= TASKS.length) return;
      const task = TASKS[t.done];
      if (ev === task.event) {
        // Засчитываем один раз даже при повторных событиях
        trainingRef.current = { ...t, done: t.done + 1 };
        completeTask(t.done);
      } else if (task.wrong?.[ev]) {
        toast({
          kind: "error",
          title: "Не совсем",
          text: task.wrong[ev],
          action: { label: "Подсказка", fn: () => hintRef.current() },
        });
      }
    },
    [completeTask, toast],
  );

  // ---------- Навигация ----------
  const current = stack[stack.length - 1];

  const go = useCallback(
    (name: ScreenName, params?: Screen["params"]) => {
      setStack((s) => [...s, { name, params }]);
      emit(`open:${name}`);
    },
    [emit],
  );

  const tab = useCallback(
    (name: ScreenName) => {
      setActionsOpen(false);
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

  // ---------- Режимы ----------
  const enterTraining = useCallback(() => {
    setToasts([]);
    setActionsOpen(false);
    setMode("training");
    if (!trainingRef.current.started) {
      setStack([{ name: "training-intro" }]);
    } else if (trainingRef.current.finished) {
      setStack([{ name: "hub" }]);
    } else {
      setStack([{ name: "home" }]);
      setTaskPanelOpen(true);
    }
  }, []);

  const startTraining = useCallback(() => {
    setTraining((t) => ({ ...t, started: true }));
    trainingRef.current = { ...trainingRef.current, started: true };
    setStack([{ name: "home" }]);
    setTaskPanelOpen(true);
  }, []);

  const exitTraining = useCallback(() => {
    setToasts([]);
    setActionsOpen(false);
    setStageModal(null);
    setMode("real");
    setStack([{ name: "home" }]);
  }, []);

  const restartTraining = useCallback(() => {
    const fresh = { ...freshTraining(), started: true };
    setTraining(fresh);
    trainingRef.current = fresh;
    setMode("training");
    setStack([{ name: "home" }]);
    setTaskPanelOpen(true);
  }, []);

  // ---------- Счета ----------
  const realPositions = REAL_ACCOUNT.positions;
  const account: Account =
    mode === "training"
      ? { cash: training.cash, positions: training.positions, history: training.history, docs: training.docs }
      : { cash: REAL_ACCOUNT.cash, positions: realPositions, history: REAL_ACCOUNT.history, docs: realDocs };

  const portfolioValue = account.cash + account.positions.reduce((s, p) => s + p.qty * (prices[p.id] ?? p.avg), 0);
  const investedCost = account.positions.reduce((s, p) => s + p.qty * p.avg, 0);
  const positionsValue = portfolioValue - account.cash;
  const dayChange = account.positions.reduce((s, p) => s + p.qty * ((prices[p.id] ?? 0) - INSTRUMENT_BY_ID[p.id].open), 0);

  /** Виртуальная сделка. Возвращает текст ошибки или null. В реальном режиме сделки не проводятся. */
  const trade = useCallback(
    (id: string, side: "buy" | "sell", qty: number): string | null => {
      if (modeRef.current !== "training") return "В прототипе реальные сделки отключены";
      const price = prices[id];
      const t = trainingRef.current;
      const pos = t.positions.find((p) => p.id === id);
      const sum = price * qty;
      const fee = +(sum * 0.0005).toFixed(2);
      if (!qty || qty <= 0) return "Укажите количество";
      if (side === "buy" && sum + fee > t.cash) {
        emit("err:insufficient");
        return "Недостаточно виртуальных средств";
      }
      if (side === "sell" && (!pos || pos.qty < qty)) {
        emit("err:oversell");
        return `В портфеле только ${fmtQty(pos?.qty ?? 0)}`;
      }
      const name = INSTRUMENT_BY_ID[id].name;
      const op: Operation = {
        id: nextId("o"),
        ts: Date.now(),
        kind: side,
        title: `${side === "buy" ? "Покупка" : "Продажа"} ${name}`,
        amount: side === "buy" ? -(sum + fee) : sum - fee,
        detail: `${fmtQty(qty)} по ${fmtMoney(price)} · комиссия ${fmtMoney(fee)}`,
      };
      let positions = t.positions;
      if (side === "buy") {
        positions = pos
          ? positions.map((p) => (p.id === id ? { ...p, qty: p.qty + qty, avg: (p.avg * p.qty + sum) / (p.qty + qty) } : p))
          : [...positions, { id, qty, avg: price }];
      } else {
        positions = positions.map((p) => (p.id === id ? { ...p, qty: p.qty - qty } : p)).filter((p) => p.qty > 0);
      }
      const next = { ...t, positions, cash: t.cash + op.amount, history: [op, ...t.history] };
      trainingRef.current = next;
      setTraining((cur) => ({ ...cur, positions, cash: next.cash, history: next.history }));
      emit(side === "buy" ? "do:buy" : "do:sell");
      return null;
    },
    [prices, emit],
  );

  const moveMoney = useCallback(
    (kind: "topup" | "withdraw", amount: number): string | null => {
      if (modeRef.current !== "training") return "В прототипе реальные переводы отключены";
      const t = trainingRef.current;
      if (!amount || amount <= 0) return "Укажите сумму";
      if (kind === "withdraw" && amount > t.cash) return "Сумма больше доступного остатка";
      if (kind === "topup" && amount > 5_000_000) return "Максимум 5 000 000 ₽ за раз";
      const op: Operation = {
        id: nextId("o"),
        ts: Date.now(),
        kind,
        title: kind === "topup" ? "Виртуальное пополнение" : "Виртуальный вывод",
        amount: kind === "topup" ? amount : -amount,
        detail: "Учебная карта ··0000",
      };
      const next = { ...t, cash: t.cash + op.amount, history: [op, ...t.history] };
      trainingRef.current = next;
      setTraining((cur) => ({ ...cur, cash: next.cash, history: next.history }));
      emit(`do:${kind}`);
      return null;
    },
    [emit],
  );

  const orderDoc = useCallback(
    (title: string, period: string) => {
      const doc: Doc = { id: nextId("d"), title, period, status: "pending", ts: Date.now() };
      const training = modeRef.current === "training";
      const set = training
        ? (fn: (d: Doc[]) => Doc[]) => setTraining((t) => ({ ...t, docs: fn(t.docs) }))
        : (fn: (d: Doc[]) => Doc[]) => setRealDocs(fn);
      set((d) => [doc, ...d]);
      window.setTimeout(() => set((d) => d.map((x) => (x.id === doc.id ? { ...x, status: "ready" } : x))), 4000);
      emit("do:order-doc");
    },
    [emit],
  );

  // ---------- Состояния для демонстрации ----------
  const demo = useCallback((state: "first-run" | "onboarding-done" | "training-progress" | "training-done") => {
    setToasts([]);
    setStageModal(null);
    setActionsOpen(false);
    setMode("real");
    setStack([{ name: "home" }]);
    if (state === "first-run") {
      setOnboarding("new");
      setTraining(freshTraining());
    } else if (state === "onboarding-done") {
      setOnboarding("done");
      setTraining(freshTraining());
    } else {
      setOnboarding("done");
      const done = state === "training-done" ? TASKS.length : TASKS.findIndex((t) => t.stage === 5);
      const base = Date.now() - done * 60000;
      const buy: Operation = { id: "demo-buy", ts: base, kind: "buy", title: "Покупка Сбербанк", amount: -3125.07, detail: "10 шт. по 312,45 ₽ · комиссия 1,56 ₽" };
      const top: Operation = { id: "demo-top", ts: base - 60000, kind: "topup", title: "Виртуальное пополнение", amount: 50000, detail: "Учебная карта ··0000" };
      const ended = TASKS.slice(0, done);
      const stagesComplete = new Set(ended.filter((t, i) => TASKS[i + 1]?.stage !== t.stage).map((t) => t.stage));
      setTraining({
        ...freshTraining(),
        started: true,
        done,
        log: ended.map((t, i) => ({ taskId: t.id, ts: base + i * 60000 })),
        achievements: ACHIEVEMENTS.filter((a) => stagesComplete.has(a.stage)).map((a) => ({ id: a.id, ts: base })),
        cash: VIRTUAL_START_CASH + 50000 - (state === "training-done" ? 3125.07 : 0),
        positions: state === "training-done" ? [{ id: "SBER", qty: 10, avg: 312.45 }] : [],
        history: state === "training-done" ? [buy, top] : [top],
        finished: state === "training-done",
      });
    }
  }, []);

  const doneStages = STAGES.filter((s) => {
    const last = TASKS.map((t) => t.stage).lastIndexOf(s.n);
    return last < training.done;
  }).length;

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
    dealInfoOpen,
    setDealInfoOpen,
    onboarding,
    setOnboarding,
    training,
    setTraining,
    doneStages,
    enterTraining,
    startTraining,
    exitTraining,
    restartTraining,
    account,
    portfolioValue,
    positionsValue,
    investedCost,
    dayChange,
    prices,
    moves,
    trade,
    moveMoney,
    orderDoc,
    toasts,
    toast,
    dismissToast,
    stageModal,
    setStageModal,
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
