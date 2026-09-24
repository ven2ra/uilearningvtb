import { useState } from "react";
import { AppProvider, useApp } from "./state/AppState";
import { TourProvider } from "./tour/Tour";
import { AchievementModal, ActionsSheet, BottomNav, HelpSheet, Toasts } from "./ui/chrome";
import Home from "./screens/Home";
import SourceHome from "./screens/SourceHome";
import { History, Instrument, Market, Portfolio, Trade } from "./screens/Invest";
import { DocOrder, DocReady, Documents, MoveMoney } from "./screens/Service";
import { Achievements, More } from "./screens/Learning";
import Profile from "./screens/Profile";
import LearningPath from "./screens/LearningPath";
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
    case "learning-path":
      return <LearningPath />;
    case "hub":
      return <LearningPath />;
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
      return <SourceHome />;
    case "training-finish":
      return <SourceHome />;
  }
}

function Shell() {
  const app = useApp();
  const fullScreen = ["topup", "transfer", "withdraw", "profile", "profile-learning", "learning-path"].includes(app.current.name);
  return <div className="source-desktop-host">
    <div ref={app.frameRef} className="source-design mode-real relative flex h-dvh w-full flex-col overflow-hidden bg-page">
      <main key={app.current.name} className="no-scrollbar relative flex-1 overflow-y-auto anim-fade"><CurrentScreen /></main>
      {!fullScreen && <BottomNav />}
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

