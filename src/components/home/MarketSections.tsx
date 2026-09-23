import { useState } from "react";
import { useApp } from "../../state/AppState";
import { INSTRUMENT_BY_ID, INSTRUMENTS } from "../../lib/data";
import ReferenceIcon, { referenceImage } from "./ReferenceIcon";
import type { Detail } from "./DetailSheet";
import { placements, ideas, placementLogos, ideaLogos } from "./referenceData";

type Open = (detail: Detail) => void;
export function SectionHeading({
  title,
  action,
  onClick,
}: {
  title: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="reference-section-heading">
      <h2>{title}</h2>
      {onClick && (
        <button onClick={onClick}>
          {action || <ReferenceIcon name="info" size={16} />}
        </button>
      )}
    </div>
  );
}

export function Placements({ open }: { open: Open }) {
  return (
    <section className="reference-section">
      <SectionHeading
        title="Новые размещения"
        onClick={() =>
          open({
            title: "Новые размещения",
            body: (
              <p>
                Предложения первичного рынка из HTML-макета. Условия приведены
                для демонстрации.
              </p>
            ),
          })
        }
      />
      <div className="reference-carousel">
        {placements.map((p, i) => (
          <button
            className="reference-placement"
            key={p.title}
            onClick={() =>
              open({
                title: p.title,
                body: (
                  <>
                    <p>{p.type}</p>
                    <p>{p.term}</p>
                    <p>{p.value}</p>
                  </>
                ),
              })
            }
          >
            <img src={referenceImage(placementLogos[i])} alt="" />
            <strong>{p.title}</strong>
            <span>{p.type}</span>
            <div className="reference-placement-bottom">
              <b>{p.term}</b>
              <span>{p.value}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

const stocks = [
  ["ММК", "MAGN", "22 ₽", "-0,3 ₽ • -1,2%", "asset-162.png"],
  ["Лукойл", "LKOH", "5 399 ₽", "162 ₽ • 3,1%", "asset-164.png"],
  ["ДОМ.РФ", "DOMRF", "2 099,9 ₽", "-33,9 ₽ • -1,6%", "asset-166.png"],
  ["Сургутнефтегаз-п", "SNGSP", "40,4 ₽", "-0,2 ₽ • -0,4%", "asset-022.png"],
  ["Мать и Дитя", "MDMG", "1 297,9 ₽", "-7,1 ₽ • -0,5%", "asset-168.png"],
  ["Новатэк", "NVTK", "1 074 ₽", "6,8 ₽ • 0,6%", "asset-024.png"],
  ["Совкомфлот", "FLOT", "82,3 ₽", "0,5 ₽ • 0,6%", "asset-170.png"],
  ["Газпром", "GAZP", "101,5 ₽", "0,8 ₽ • 0,8%", "asset-026.png"],
  ["Сбербанк", "SBER", "279 ₽", "-1,8 ₽ • -0,6%", "asset-018.png"],
  ["Яндекс", "YDEX", "3 760 ₽", "-0,5 ₽ • -0%", "asset-028.png"],
];

export function AnalystPicks({ open }: { open: Open }) {
  const app = useApp();
  const [tab, setTab] = useState("Акции");
  const tabs = ["Акции", "Облигации • RUB", "Облигации • CNY"];
  return (
    <section className="reference-section">
      <SectionHeading
        title="Топ от аналитиков"
        action="Подобрать"
        onClick={() => app.tab("market")}
      />
      <div
        className="reference-tabs"
        role="tablist"
        aria-label="Тип инструментов"
      >
        {tabs.map((t) => (
          <button
            role="tab"
            aria-selected={t === tab}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Акции" ? (
        <div className="reference-analyst-grid">
          {[stocks.slice(0, 5), stocks.slice(5)].map((list, column) => (
            <div className="reference-card" key={column}>
              {column === 0 && (
                <div className="reference-list-heading">
                  Топ-10 акций{" "}
                  <button
                    aria-label="О подборке"
                    onClick={() =>
                      open({
                        title: "Топ-10 акций",
                        body: (
                          <p>
                            Демонстрационная подборка из исходного макета.
                            Котировки на рынке прототипа рассчитываются
                            отдельно.
                          </p>
                        ),
                      })
                    }
                  >
                    <ReferenceIcon name="info" size={16} />
                  </button>
                </div>
              )}
              {list.map(([name, ticker, price, change, image]) => (
                <button
                  className="reference-stock"
                  key={ticker}
                  onClick={() =>
                    INSTRUMENT_BY_ID[ticker]
                      ? app.go("instrument", { id: ticker })
                      : open({
                          title: name,
                          body: (
                            <>
                              <p>{ticker}</p>
                              <p>
                                {price} · {change}
                              </p>
                              <p className="reference-muted">
                                Инструмент из макета. Учебные сделки доступны в
                                разделе «Рынок».
                              </p>
                            </>
                          ),
                        })
                  }
                >
                  <img src={referenceImage(image)} alt="" />
                  <span className="reference-stock-name">
                    <strong>{name}</strong>
                    <small>{ticker}</small>
                  </span>
                  <span className="reference-stock-price">
                    <strong>{price}</strong>
                    <small
                      className={
                        change.startsWith("-")
                          ? "reference-negative"
                          : "reference-positive"
                      }
                    >
                      {change}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="reference-card">
          {placements
            .filter(
              (p) =>
                p.type === "Облигации" &&
                (tab.includes("CNY")
                  ? /CNY/.test(p.title)
                  : !/CNY/.test(p.title)),
            )
            .slice(0, 6)
            .map((p) => (
              <button
                className="reference-bond-row"
                key={p.title}
                onClick={() =>
                  open({
                    title: p.title,
                    body: (
                      <p>
                        {p.term} · {p.value}
                      </p>
                    ),
                  })
                }
              >
                <strong>{p.title}</strong>
                <span>{p.value}</span>
              </button>
            ))}
        </div>
      )}
    </section>
  );
}

export function InvestmentIdeas({ open }: { open: Open }) {
  const [all, setAll] = useState(false);
  return (
    <section className="reference-section">
      <SectionHeading
        title="Инвестиционные идеи"
        action={all ? "Свернуть" : "Все идеи"}
        onClick={() => setAll((v) => !v)}
      />
      <div className={all ? "reference-ideas-grid" : "reference-carousel"}>
        {ideas.map((idea, i) => (
          <button
            key={idea.title}
            className="reference-idea reference-card"
            onClick={() =>
              open({
                title: idea.title,
                body: (
                  <>
                    <p>
                      {idea.type} · {idea.action}
                    </p>
                    <p>
                      Потенциал {idea.potential}, прогноз цены {idea.price}.
                    </p>
                    <p>{idea.date}</p>
                    <p className="reference-muted">
                      Данные исходного демонстрационного макета.
                    </p>
                  </>
                ),
              })
            }
          >
            <div className="reference-idea-title">
              <img src={referenceImage(ideaLogos[i])} alt="" />
              <span>
                <strong>{idea.title}</strong>
                <small>{idea.type}</small>
              </span>
            </div>
            <span className="reference-buy">{idea.action}</span>
            <div className="reference-idea-values">
              <span>
                <b className="reference-positive">{idea.potential}</b>
                <small>потенциал</small>
              </span>
              <span>
                <b>{idea.price}</b>
                <small>прогноз цены</small>
              </span>
              <span>
                <b>{idea.remaining}</b>
                <small>осталось</small>
              </span>
            </div>
            <small>{idea.date}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

export function CollectionsAndFunds({ open }: { open: Open }) {
  const app = useApp();
  return (
    <>
      <section className="reference-section">
        <SectionHeading title="Подборки недели" />
        <div className="reference-collections">
          {["Дивидендные лидеры", "Фавориты стратегии"].map((title, i) => (
            <button
              key={title}
              onClick={() =>
                open({
                  title,
                  body: (
                    <div>
                      {INSTRUMENTS.filter((x) => x.type === "Акции").map(
                        (x) => (
                          <button
                            className="reference-bond-row"
                            key={x.id}
                            onClick={() => {
                              app.go("instrument", { id: x.id });
                            }}
                          >
                            {x.name}
                          </button>
                        ),
                      )}
                    </div>
                  ),
                })
              }
            >
              <div className="reference-logo-stack">
                {(i
                  ? [
                      "asset-032.png",
                      "asset-034.png",
                      "asset-018.png",
                      "asset-038.png",
                      "asset-026.png",
                    ]
                  : [
                      "asset-036.png",
                      "asset-196.png",
                      "asset-034.png",
                      "asset-040.png",
                      "asset-018.png",
                    ]
                ).map((f) => (
                  <img key={f} src={referenceImage(f)} alt="" />
                ))}
                <span>+{i ? 7 : 11}</span>
              </div>
              <strong>{title}</strong>
            </button>
          ))}
        </div>
      </section>
      <section className="reference-section">
        <SectionHeading title="Фонды" />
        <div className="reference-carousel">
          {[
            ["ВИМ - Корпоративные облигации (OBLG)", "20%"],
            ["ВИМ-Накопительный резерв", "25%"],
            ["Ликвидность (LQDT)", "14,2%"],
            ["Инвестидея: купить паи ПИФа «Золото. Биржевой»", "15%"],
          ].map(([title, value], i) => (
            <button
              key={title}
              className="reference-fund reference-card"
              onClick={() =>
                i === 2
                  ? app.go("instrument", { id: "LQDT" })
                  : open({
                      title,
                      body: (
                        <>
                          <p>Фонд</p>
                          <p>{value} за 12 месяцев — данные макета.</p>
                        </>
                      ),
                    })
              }
            >
              <img src={referenceImage("asset-201.png")} alt="" />
              <strong>{title}</strong>
              <span>Фонд</span>
              <b>{value}</b>
              <span>за 12 месяцев</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
