import { useState } from "react";
import { useApp } from "../state/AppState";
import { INSTRUMENT_BY_ID } from "../lib/data";
import { fmtMoney } from "../lib/format";
import Icon from "../ui/Icons";
import {
  AchChip,
  FirstSteps,
  LearningCard,
} from "../components/learning/HomeLearning";
import ReferenceIcon, {
  referenceImage,
} from "../components/home/ReferenceIcon";
import DetailSheet, { type Detail } from "../components/home/DetailSheet";
import Promotions from "../components/home/Promotions";
import {
  AnalystPicks,
  CollectionsAndFunds,
  InvestmentIdeas,
  Placements,
} from "../components/home/MarketSections";
import EditorialSections from "../components/home/EditorialSections";

const accounts = [
  {
    value: 0,
    title: "Брокерский счет • 11MD3A • Основной",
    change: "0 ₽ • 0%",
  },
  { value: 0, title: "ИИС • 144IMP • Основной", change: "0 ₽ • 0%" },
  {
    value: 0,
    title: "Инвесткопилка • 11MD3A/1CY8P • Основной",
    change: "0 ₽ • 0%",
  },
  { value: 0, title: "Фонды ВИМ • Портфель УК", change: "0 ₽ • 0%" },
];

export default function SourceHome() {
  const app = useApp();
  const [tab, setTab] = useState("Счета");
  const [hidden, setHidden] = useState(false);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [settings, setSettings] = useState(false);
  const [compact, setCompact] = useState(false);
  const [showPromos, setShowPromos] = useState(true);
  const [stories, setStories] = useState(false);
  const modified =
    app.account.positions.length > 0 ||
    app.account.cash > 0;
  const moved = !!app.account.moneyBalances;
  const moneyDelta = Math.round((app.moneyBalances.main + app.moneyBalances.otc) * 100) / 100;
  const shownAccounts = accounts.map((account, i) => i === 0 ? { ...account, value: app.moneyBalances.main } : account);
  if (app.moneyBalances.otc > 0) shownAccounts.splice(1, 0, { value: app.moneyBalances.otc, title: "Брокерский счет • 11MD3A • Внебиржевой", change: "0 ₽ • 0%" });

  return (
    <div className="reference-home">
      <header className="reference-header">
        <button
          className="reference-stories"
          aria-label="Истории"
          aria-expanded={stories}
          onClick={() => setStories((v) => !v)}
        >
          <ReferenceIcon name="stories" size={74} />
          {["asset-016.jpeg", "asset-002.jpeg", "asset-014.jpeg"].map(
            (f, i) => (
              <img
                key={f}
                src={referenceImage(f)}
                alt=""
                style={{ left: 4 + i * 17 }}
              />
            ),
          )}
        </button>
        <div>
          <button className="reference-header-help" data-help-trigger data-tour="help-btn" aria-label="Помощь">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" /><path d="M7.2 7a2.8 2.8 0 0 1 5.6 0c0 2-2.8 2-2.8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="10" cy="14.5" r="1" fill="currentColor" /></svg>
            Помощь
          </button>
          <button aria-label="Профиль" onClick={() => app.go("profile")}>
            <ReferenceIcon name="profile" />
          </button>
          <button
            aria-label="Уведомления"
            onClick={() =>
              setDetail({
                title: "Уведомления",
                body: <p>Новых уведомлений нет.</p>,
              })
            }
          >
            <ReferenceIcon name="notifications" />
          </button>
        </div>
      </header>
      <div className="reference-body">
        {stories && (
          <div className="reference-story-list">
            {[
              "Как регулярно инвестировать",
              "Топ-10 акций",
              "Попробуйте Советника ПРО",
            ].map((title, i) => (
              <button
                key={title}
                onClick={() =>
                  setDetail({
                    title,
                    body: (
                      <p>
                        Материал из подборки историй. Для практики откройте
                        обучение на виртуальном счёте.
                      </p>
                    ),
                  })
                }
              >
                <img
                  src={referenceImage(
                    ["asset-016.jpeg", "asset-002.jpeg", "asset-014.jpeg"][i],
                  )}
                  alt=""
                />
                {title}
              </button>
            ))}
          </div>
        )}
        <section className="reference-balance" data-tour="balance">
          <div>
            <span>
              {hidden
                ? "••• ₽"
                : moved
                  ? fmtMoney(moneyDelta + (modified ? app.portfolioValue : 0))
                  : modified
                  ? fmtMoney(app.portfolioValue)
                  : moved ? fmtMoney(moneyDelta) : "0 ₽"}
            </span>
            <button
              aria-label={hidden ? "Показать сумму" : "Скрыть сумму"}
              onClick={() => setHidden((v) => !v)}
            >
              {hidden ? (
                <Icon name="eye" size={24} />
              ) : (
                <ReferenceIcon name="eye-off" />
              )}
            </button>
          </div>
          <p>
            <span className="reference-change">
              <ReferenceIcon name="trend" size={16} />
              {hidden
                ? "•••"
                : modified
                  ? fmtMoney(app.dayChange, { sign: true })
                  : "0 ₽ • 0%"}
            </span>
            <span>за все время</span>
          </p>
        </section>
        <div className="reference-actions">
          <button data-tour="actions" onClick={app.openActions}>
            <ReferenceIcon name="actions" />
            Действия
          </button>
          <button onClick={() => app.tab("history")}>
            <ReferenceIcon name="history" />
            История
          </button>
          <button onClick={() => app.tab("portfolio")}>
            <ReferenceIcon name="analysis" />
            Анализ
          </button>
        </div>
        <div
          className="reference-account-tabs"
          role="tablist"
          aria-label="Счета и избранное"
        >
          {["Счета", "Избранное"].map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "Счета" ? (
          <div
            className={
              compact ? "reference-accounts is-compact" : "reference-accounts"
            }
          >
            {(moved ? [...shownAccounts, ...(modified ? [{ value: app.portfolioValue, title: "Учебный портфель • ···4821", change: fmtMoney(app.dayChange, { sign: true }) }] : [])] : modified
              ? [
                  {
                    value: app.portfolioValue,
                    title: "Брокерский счёт • ···4821 • Основной",
                    change: fmtMoney(app.dayChange, { sign: true }),
                  },
                ]
              : shownAccounts
            ).map((account, i) => (
              <button
                className="reference-account"
                key={account.title}
                onClick={() =>
                  modified
                    ? app.tab("portfolio")
                    : setDetail({
                        title: account.title.split(" • ")[0],
                        body: (
                          <>
                            <p>{account.title}</p>
                            <h3>
                              {hidden
                                ? "••• ₽"
                                : fmtMoney(account.value, { whole: !modified && !moved })}
                            </h3>
                            <p>{account.change}</p>
                            <p className="reference-muted">
                              Счёт из HTML-макета. Учебные операции выполняются
                              на тестовом счёте ···4821.
                            </p>
                            <button
                              className="reference-primary"
                              onClick={() => app.tab("portfolio")}
                            >
                              Открыть учебный портфель
                            </button>
                          </>
                        ),
                      })
                }
              >
                <strong>
                  {hidden
                    ? "••• ₽"
                    : fmtMoney(account.value, { whole: !modified && !moved })}
                </strong>
                <span className="reference-account-label">{account.title}</span>
                <span
                  className={
                    i < 2 ? "reference-change" : "reference-change neutral"
                  }
                >
                  {hidden ? "•••" : account.change}
                </span>
              </button>
            ))}
          </div>
        ) : app.favorites.length ? (
          <div className="reference-card">
            {app.favorites
              .filter((id) => INSTRUMENT_BY_ID[id])
              .map((id) => (
                <button
                  key={id}
                  className="reference-bond-row"
                  onClick={() => app.go("instrument", { id })}
                >
                  <strong>{INSTRUMENT_BY_ID[id].name}</strong>
                  <span>
                    {id} · {hidden ? "••• ₽" : fmtMoney(app.prices[id])}
                  </span>
                </button>
              ))}
          </div>
        ) : (
          <div className="reference-card reference-empty">
            <Icon name="star" />
            <p>Добавьте инструменты в избранное</p>
            <button
              className="reference-primary"
              onClick={() => app.tab("market")}
            >
              Открыть рынок
            </button>
          </div>
        )}
        <div className="reference-customize">
          <button
            onClick={() => setSettings((v) => !v)}
            aria-expanded={settings}
          >
            <ReferenceIcon name="settings" size={16} />
            Настроить вид экрана
          </button>
        </div>
        {settings && (
          <div className="reference-card reference-settings">
            <label>
              <input
                type="checkbox"
                checked={compact}
                onChange={(e) => setCompact(e.target.checked)}
              />
              Компактные счета
            </label>
            <label>
              <input
                type="checkbox"
                checked={showPromos}
                onChange={(e) => setShowPromos(e.target.checked)}
              />
              Показывать предложения
            </label>
          </div>
        )}
        {showPromos && <Promotions open={setDetail} />}
        <Placements open={setDetail} />
        <AnalystPicks open={setDetail} />
        <InvestmentIdeas open={setDetail} />
        <EditorialSections open={setDetail} />
        <CollectionsAndFunds open={setDetail} />
        <section className="reference-learning">
          <div className="reference-learning-tools">
            <AchChip />
          </div>
          <FirstSteps />
          <LearningCard />
        </section>
      </div>
      <DetailSheet detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
