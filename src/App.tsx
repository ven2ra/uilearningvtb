import { useState } from "react";
import { AppProvider, useApp } from "./state/AppState";
import { TourProvider } from "./tour/Tour";
import { AchievementModal, ActionsSheet, BottomNav, HelpSheet, Toasts } from "./ui/chrome";
import Home from "./screens/Home";
import SourceHome from "./screens/SourceHome";
import SourceExchange from "./screens/SourceExchange";
import ExchangeInstrument from "./screens/ExchangeInstrument";
import Intelligence from "./screens/Intelligence";
import SupportChat from "./screens/SupportChat";
import { ExchangeOrder, TradeConfirmation } from "./screens/ExchangeOrder";
import { Reports, BrokerReport } from "./screens/Reports";
import { History, Instrument, Market, Portfolio, Trade } from "./screens/Invest";
import { DocOrder, DocReady, Documents, MoveMoney } from "./screens/Service";
import { More } from "./screens/Learning";
import Achievements from "./screens/Achievements";
import Profile from "./screens/Profile";
import LearningPath from "./screens/LearningPath";
import LessonFlow from "./screens/LessonFlow";
import FinkoinShop from "./screens/FinkoinShop";
import { SourceProfile, ProfileLearning } from "./screens/SourceProfile";
import MoneyOperations from "./screens/MoneyOperations";


import Splash from "./ui/Splash";

function CurrentScreen() {
  const { current, mode } = useApp();
  const p = current.params ?? {};
  switch (current.name) {
    case "home":
      return mode === "real" ? <SourceHome /> : <Home />;
    case "portfolio":
      return mode === "real" ? <SourceExchange /> : <Portfolio />;
    case "market":
      return <Market />;
    case "intelligence":
      return <Intelligence />;
    case "support-chat":
      return <SupportChat />;
    case "trade-confirmation":
      return <TradeConfirmation />;
    case "history":
      return <History />;
    case "more":
      return <More />;
    case "profile":
      return mode === "real" ? <SourceProfile /> : <Profile />;
    case "profile-learning":
      return <ProfileLearning />;
    case "finkoin-shop":
      return <FinkoinShop />;
      case "learning-path":
        return <LearningPath />;
      case "lesson-flow":
        return <LessonFlow />;
    case "hub":
      return <LearningPath />;
    case "achievements":
      return <Achievements />;
    case "instrument":
      return p.source === "exchange" ? <ExchangeInstrument id={p.id!} /> : <Instrument id={p.id!} />;
    case "trade":
      return p.source === "exchange" ? <ExchangeOrder /> : <Trade id={p.id!} side={p.side ?? "buy"} />;
    case "topup":
      return mode === "real" ? <MoneyOperations kind="topup" /> : <MoveMoney key="topup" kind="topup" />;
    case "transfer":
      return <MoneyOperations kind="transfer" />;
    case "withdraw":
      return mode === "real" ? <MoneyOperations kind="withdraw" /> : <MoveMoney key="withdraw" kind="withdraw" />;
    case "documents":
      return mode === "real" ? <Reports /> : <Documents />;
    case "doc-order":
      return mode === "real" ? <BrokerReport /> : <DocOrder />;
    case "doc-ready":
      return mode === "real" ? <Reports ready /> : <DocReady />;
    case "training-intro":
      return <SourceHome />;
    case "training-finish":
      return <SourceHome />;
  }
}

function Shell() {
  const app = useApp();
  const fullScreen = ["documents", "doc-order", "doc-ready", "support-chat", "trade-confirmation", "topup", "transfer", "withdraw", "profile", "profile-learning", "learning-path", "lesson-flow", "finkoin-shop", "achievements"].includes(app.current.name) || (app.current.name === "trade" && app.current.params?.source === "exchange");
  return <div className="source-desktop-host">
    <div ref={app.frameRef} className="source-design mode-real relative flex h-dvh w-full flex-col overflow-hidden bg-page">
      <main key={app.current.name} className="no-scrollbar relative flex-1 overflow-y-auto anim-fade"><CurrentScreen /></main>
      {!fullScreen && !(app.current.name === "instrument" && app.current.params?.source === "exchange") && <BottomNav />}
      <ActionsSheet /><HelpSheet /><AchievementModal /><Toasts />
    </div>
  </div>;
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

