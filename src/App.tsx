import { useEffect, useState } from "react";
import { AppProvider, useApp } from "./state/AppState";
import { TourProvider } from "./tour/Tour";
import { AchievementModal, ActionsSheet, BottomNav, HelpSheet, MarketOfferSheet, QuestPanel, StageModalView, StatusBar, TaskPanel, Toasts, TrainingBanner, WelcomeSheet } from "./ui/chrome";
import Home from "./screens/Home";
import SourceHome from "./screens/SourceHome";
import { History, Instrument, Market, Portfolio, Trade } from "./screens/Invest";
import { DocOrder, DocReady, Documents, MoveMoney } from "./screens/Service";
import { Achievements, DemoButtons, Hub, More, TrainingFinish, TrainingIntro } from "./screens/Learning";
import Profile from "./screens/Profile";
import { SourceProfile, ProfileLearning } from "./screens/SourceProfile";
import MoneyOperations from "./screens/MoneyOperations";
import { cx } from "./ui/kit";
import { ACHIEVEMENTS } from "./lib/achievements";
import Splash from "./ui/Splash";

function useIsDesktop() {
  const q = "(min-width: 1100px)";
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
  const { current, mode } = useApp();
  const p = current.params ?? {};
  switch (current.name) {
    case "home":
      return mode === "real" ? <SourceHome /> : <Home />;
    case "portfolio":
      return <Portfolio />;
    case "market":
      return <Market />;
    case "history":
      return <History />;
    case "more":
      return <More />;
    case "profile":
      return mode === "real" ? <SourceProfile /> : <Profile />;
    case "profile-learning":
      return <ProfileLearning />;
    case "hub":
      return <Hub />;
    case "achievements":
      return <Achievements />;
    case "instrument":
      return <Instrument id={p.id!} />;
    case "trade":
      return <Trade id={p.id!} side={p.side ?? "buy"} />;
    case "topup":
      return mode === "real" ? <MoneyOperations kind="topup" /> : <MoveMoney key="topup" kind="topup" />;
    case "transfer":
      return <MoneyOperations kind="transfer" />;
    case "withdraw":
      return mode === "real" ? <MoneyOperations kind="withdraw" /> : <MoveMoney key="withdraw" kind="withdraw" />;
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
  const fullScreen = app.current.name === "training-intro" || app.current.name === "training-finish" || (!training && ["topup", "transfer", "withdraw"].includes(app.current.name));
  const profileScreen = !training && ["profile", "profile-learning"].includes(app.current.name);
  const panelHidden = fullScreen || profileScreen || app.current.name === "hub" || app.current.name === "achievements";
  // РљРІРµСЃС‚ В«РџРµСЂРІР°СЏ РїРѕРєСѓРїРєР°В» РІР°Р¶РЅРµРµ С‚РµРєСѓС‰РµРіРѕ Р·Р°РґР°РЅРёСЏ РїСЂРѕРіСЂР°РјРјС‹: СЃРЅР°С‡Р°Р»Р° РѕРЅ
  const showQuest = !panelHidden && app.buyQuest.active === app.mode;
  const showTaskPanel = !panelHidden && !showQuest && training && app.training.started && !app.training.finished;

  return (
    <div
      ref={app.frameRef}
      className={cx(
        "source-design relative flex flex-col overflow-hidden bg-page transition-colors duration-300",
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
      {!fullScreen && !profileScreen && <BottomNav />}
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
  if (app.mode === "real") {
    return <div className="source-desktop-host"><Phone framed={false} /></div>;
  }
  const training = app.mode === "training";
  return (
    <div className="flex min-h-full items-center justify-center gap-10 p-8">
      <Phone framed />
      <aside className="w-[300px] shrink-0 text-[14px] leading-5 text-ink-2">
        <div className="text-[12px] font-semibold uppercase tracking-wide text-ink-3">РљРѕРЅС†РµРїС‚ В· РїСЂРѕС‚РѕС‚РёРї</div>
        <h1 className="mt-1 text-[24px] font-bold leading-8 text-ink">Р’РўР‘ РњРѕРё РРЅРІРµСЃС‚РёС†РёРё: РѕРЅР±РѕСЂРґРёРЅРі Рё РѕР±СѓС‡РµРЅРёРµ</h1>
        <div className="mt-4 flex gap-2 whitespace-nowrap text-[12px] font-semibold">
          <span className={cx("flex items-center gap-1.5 rounded-m px-2.5 py-1.5", !training ? "bg-brand text-white" : "bg-white text-ink-2")}>
            <span className="h-2 w-2 rounded-full bg-current" />
            Р РµР°Р»СЊРЅРѕРµ РїСЂРёР»РѕР¶РµРЅРёРµ
          </span>
          <span className={cx("flex items-center gap-1.5 rounded-m px-2.5 py-1.5", training ? "training-stripe text-white" : "bg-white text-ink-2")}>
            <span className="h-2 w-2 rounded-full bg-current" />
            Р¤РµР№РєРѕРІС‹Рµ С‚РѕСЂРіРё
          </span>
        </div>
        <ol className="mt-5 space-y-2">
          <li>
            <b className="text-ink">1. РћРЅР±РѕСЂРґРёРЅРі.</b> РљРѕСЂРѕС‚РєРёРµ РїРѕРґСЃРєР°Р·РєРё: В«Р”РµР№СЃС‚РІРёСЏВ» в†’ РџРѕРїРѕР»РЅРёС‚СЊ, Р’С‹РІРµСЃС‚Рё, РћС‚С‡С‘С‚С‹ Рё СЃРїСЂР°РІРєРё в†’ Р”РѕРєСѓРјРµРЅС‚С‹.
          </li>
          <li>
            <b className="text-ink">2. В«РџРѕРјРѕС‰СЊВ»</b> РІРІРµСЂС…Сѓ Р»СЋР±РѕРіРѕ СЌРєСЂР°РЅР°: РїРѕРґСЃРєР°Р·РєРё Рє СЌРєСЂР°РЅСѓ, РїРµСЂРµРєР»СЋС‡РµРЅРёРµ РЅР° С„РµР№РєРѕРІС‹Рµ С‚РѕСЂРіРё Рё РѕР±СЂР°С‚РЅРѕ, РґРѕСЃС‚РёР¶РµРЅРёСЏ.
          </li>
          <li>
            <b className="text-ink">3. В«РџСЂРѕР№С‚Рё РѕР±СѓС‡РµРЅРёРµВ»</b> РЅР° РіР»Р°РІРЅРѕР№ РѕС‚РєСЂС‹РІР°РµС‚ С‚СЂРµРЅРёСЂРѕРІРєСѓ: 7 СЌС‚Р°РїРѕРІ, 11 Р·Р°РґР°РЅРёР№. Р”РµР№СЃС‚РІРёСЏ, СЃРґРµР»Р°РЅРЅС‹Рµ Р·Р°СЂР°РЅРµРµ, Р·Р°СЃС‡РёС‚С‹РІР°СЋС‚СЃСЏ, РєРѕРіРґР° РїСЂРѕРіСЂР°РјРјР° РґРѕ РЅРёС… РґРѕР№РґС‘С‚.
          </li>
          <li>
            <b className="text-ink">4. Р’РѕР·РІСЂР°С‚.</b> Р’С‹Р№РґРёС‚Рµ РёР· С‚СЂРµРЅРёСЂРѕРІРєРё вЂ” РЅР° РіР»Р°РІРЅРѕР№ РїРѕСЏРІРёС‚СЃСЏ РїСЂРѕРіСЂРµСЃСЃ Рё В«РџСЂРѕРґРѕР»Р¶РёС‚СЊ РѕР±СѓС‡РµРЅРёРµВ».
          </li>
          <li>
            <b className="text-ink">5. РџРµСЂРІР°СЏ РїРѕРєСѓРїРєР°.</b> РџРѕСЃР»Рµ РїРѕРїРѕР»РЅРµРЅРёСЏ вЂ” РЅР° Р±РёСЂР¶Сѓ: Р±Р°РЅРЅРµСЂ РїСЂРµРґР»Р°РіР°РµС‚ С„РµР№РєРѕРІС‹Рµ С‚РѕСЂРіРё РёР»Рё РѕР±СѓС‡РµРЅРёРµ РІ РїСЂРёР»РѕР¶РµРЅРёРё. РЎС‚Р°СЂС‚ СЃ С„РѕРЅРґР° Р»РёРєРІРёРґРЅРѕСЃС‚Рё, РЅРѕ РІС‹Р±РѕСЂ Р·Р° РєР»РёРµРЅС‚РѕРј.
          </li>
          <li>
            <b className="text-ink">6. Р”РѕСЃС‚РёР¶РµРЅРёСЏ</b> вЂ” {ACHIEVEMENTS.length} РЅР°РіСЂР°Рґ РїРѕС‡С‚Рё Р·Р° РєР°Р¶РґРѕРµ РїРµСЂРІРѕРµ РґРµР№СЃС‚РІРёРµ. Р¤СЊСЋС‡РµСЂСЃС‹ Р±РµР· С‚РµСЃС‚Р° РјРѕР¶РЅРѕ РїРѕРїСЂРѕР±РѕРІР°С‚СЊ РЅР° С„РµР№РєРѕРІС‹С… С‚РѕСЂРіР°С….
          </li>
        </ol>
        <div className="mt-6 rounded-l border border-line bg-white p-4">
          <div className="text-[13px] font-semibold text-ink">Р‘С‹СЃС‚СЂС‹Рµ СЃРѕСЃС‚РѕСЏРЅРёСЏ</div>
          <DemoButtons compact />
        </div>
        <p className="mt-4 text-[12px] text-ink-3">Р’СЃРµ РґР°РЅРЅС‹Рµ С‚РµСЃС‚РѕРІС‹Рµ. Р РµР°Р»СЊРЅС‹С… РїР»Р°С‚РµР¶РµР№, СЃРґРµР»РѕРє Рё Р±Р°РЅРєРѕРІСЃРєРёС… API РЅРµС‚.</p>
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

