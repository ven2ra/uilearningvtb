import { useEffect, useState } from "react";
import { AppProvider, useApp } from "./state/AppState";
import { TourProvider } from "./tour/Tour";
import { AchievementModal, ActionsSheet, BottomNav, HelpSheet, MarketOfferSheet, QuestPanel, StageModalView, StatusBar, TaskPanel, Toasts, TrainingBanner, WelcomeSheet } from "./ui/chrome";
import Home from "./screens/Home";
import { History, Instrument, Market, Portfolio, Trade } from "./screens/Invest";
import { DocOrder, DocReady, Documents, MoveMoney } from "./screens/Service";
import { Achievements, DemoButtons, Hub, More, TrainingFinish, TrainingIntro } from "./screens/Learning";
import { cx } from "./ui/kit";
import { ACHIEVEMENTS } from "./lib/achievements";
import Splash from "./ui/Splash";

function useIsDesktop() {
  const q = "(min-width: 720px)";
  const [v, setV] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setV(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return v;
}

function CurrentScreen() {
  const { current } = useApp();
  const p = current.params ?? {};
  switch (current.name) {
    case "home":
      return <Home />;
    case "portfolio":
      return <Portfolio />;
    case "market":
      return <Market />;
    case "history":
      return <History />;
    case "more":
      return <More />;
    case "hub":
      return <Hub />;
    case "achievements":
      return <Achievements />;
    case "instrument":
      return <Instrument id={p.id!} />;
    case "trade":
      return <Trade id={p.id!} side={p.side ?? "buy"} />;
    case "topup":
      return <MoveMoney key="topup" kind="topup" />;
    case "withdraw":
      return <MoveMoney key="withdraw" kind="withdraw" />;
    case "documents":
      return <Documents />;
    case "doc-order":
      return <DocOrder />;
    case "doc-ready":
      return <DocReady />;
    case "training-intro":
      return <TrainingIntro />;
    case "training-finish":
      return <TrainingFinish />;
  }
}

function Phone({ framed }: { framed: boolean }) {
  const app = useApp();
  const training = app.mode === "training";
  const fullScreen = app.current.name === "training-intro" || app.current.name === "training-finish";
  const panelHidden = fullScreen || app.current.name === "hub" || app.current.name === "achievements";
  // Квест «Первая покупка» важнее текущего задания программы: сначала он
  const showQuest = !panelHidden && app.buyQuest.active === app.mode;
  const showTaskPanel = !panelHidden && !showQuest && training && app.training.started && !app.training.finished;

  return (
    <div
      ref={app.frameRef}
      className={cx(
        "relative flex flex-col overflow-hidden bg-page transition-colors duration-300",
        training ? "mode-training" : "mode-real",
        framed ? "h-[844px] w-[390px] rounded-[44px] border-[10px] border-[#0F172A] shadow-[0_30px_80px_rgba(15,23,42,0.35)]" : "h-dvh w-full",
      )}
    >
      {framed && (training ? <div className="training-stripe"><StatusBar dark /></div> : <StatusBar />)}
      {training && !fullScreen && <TrainingBanner />}
      {training && fullScreen && <div className="training-stripe h-1.5 shrink-0" />}
      <main key={`${app.mode}-${app.stack.length}-${app.current.name}`} className={cx("no-scrollbar relative flex-1 overflow-y-auto anim-fade", (showTaskPanel || showQuest) && "pb-36")}>
        <CurrentScreen />
      </main>
      {showTaskPanel && <TaskPanel />}
      {showQuest && <QuestPanel />}
      {!fullScreen && <BottomNav />}
      <ActionsSheet />
      <WelcomeSheet />
      <MarketOfferSheet />
      <HelpSheet />
      <StageModalView />
      <AchievementModal />
      <Toasts />
    </div>
  );
}

function Shell() {
  const desktop = useIsDesktop();
  const app = useApp();
  if (!desktop) return <Phone framed={false} />;
  const training = app.mode === "training";
  return (
    <div className="flex min-h-full items-center justify-center gap-10 p-8">
      <Phone framed />
      <aside className="w-[300px] shrink-0 text-[14px] leading-5 text-ink-2">
        <div className="text-[12px] font-semibold uppercase tracking-wide text-ink-3">Концепт · прототип</div>
        <h1 className="mt-1 text-[24px] font-bold leading-8 text-ink">ВТБ Мои Инвестиции: онбординг и обучение</h1>
        <div className="mt-4 flex gap-2 whitespace-nowrap text-[12px] font-semibold">
          <span className={cx("flex items-center gap-1.5 rounded-m px-2.5 py-1.5", !training ? "bg-brand text-white" : "bg-white text-ink-2")}>
            <span className="h-2 w-2 rounded-full bg-current" />
            Реальное приложение
          </span>
          <span className={cx("flex items-center gap-1.5 rounded-m px-2.5 py-1.5", training ? "training-stripe text-white" : "bg-white text-ink-2")}>
            <span className="h-2 w-2 rounded-full bg-current" />
            Фейковые торги
          </span>
        </div>
        <ol className="mt-5 space-y-2">
          <li>
            <b className="text-ink">1. Онбординг.</b> Короткие подсказки: «Действия» → Пополнить, Вывести, Отчёты и справки → Документы.
          </li>
          <li>
            <b className="text-ink">2. «Помощь»</b> вверху любого экрана: подсказки к экрану, переключение на фейковые торги и обратно, достижения.
          </li>
          <li>
            <b className="text-ink">3. «Пройти обучение»</b> на главной открывает тренировку: 7 этапов, 11 заданий. Действия, сделанные заранее, засчитываются, когда программа до них дойдёт.
          </li>
          <li>
            <b className="text-ink">4. Возврат.</b> Выйдите из тренировки — на главной появится прогресс и «Продолжить обучение».
          </li>
          <li>
            <b className="text-ink">5. Первая покупка.</b> После пополнения — на биржу: баннер предлагает фейковые торги или обучение в приложении. Старт с фонда ликвидности, но выбор за клиентом.
          </li>
          <li>
            <b className="text-ink">6. Достижения</b> — {ACHIEVEMENTS.length} наград почти за каждое первое действие. Фьючерсы без теста можно попробовать на фейковых торгах.
          </li>
        </ol>
        <div className="mt-6 rounded-l border border-line bg-white p-4">
          <div className="text-[13px] font-semibold text-ink">Быстрые состояния</div>
          <DemoButtons compact />
        </div>
        <p className="mt-4 text-[12px] text-ink-3">Все данные тестовые. Реальных платежей, сделок и банковских API нет.</p>
      </aside>
    </div>
  );
}

export default function App() {
  const [booting, setBooting] = useState(true);
  return (
    <AppProvider>
      <TourProvider>
        <Shell />
      </TourProvider>
      {booting && <Splash onDone={() => setBooting(false)} />}
    </AppProvider>
  );
}
