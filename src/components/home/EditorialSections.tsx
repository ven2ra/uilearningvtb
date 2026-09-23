import { useState } from "react";
import ReferenceIcon, { referenceImage } from "./ReferenceIcon";
import { SectionHeading } from "./MarketSections";
import type { Detail } from "./DetailSheet";
import sentimentChart from "../../assets/reference/icons/sentiment.svg";

const analysisTitle =
  "Индекс Мосбиржи вырос до 2300 на ожиданиях встречи Сергея Лаврова и Марко Рубио";
const analysisText =
  "Индекс Мосбиржи по итогам дня вырос на 0,88%, до отметки в 2300. Лучшими по динамике среди ценных бумаг, входящих в базу расчёта, стали акции «Северстали» (+4,6%), ММК (+4,5%), «ФосАгро» (+4,2%), «Озон» (+3,9%), «Алросы» (+3,6%). Это произошло на фоне роста курса CNY/RUB на 0,79% — до 12,59.";
const summary = [
  "Временные ограничения на приём и выпуск рейсов в аэропортах России",
  "Снижение остатков на корсчетах банков в ЦБ РФ и рост на депозитах",
  "Азиатские рынки акций демонстрируют рост",
  "Центральный банк Узбекистана улучшил прогноз роста ВВП в 2026 году до 7,5-8%",
  "Колебания среднего курса покупки и продажи наличного доллара и евро в банках Москвы",
];
const news = [
  [
    "ЦБ РФ в 2027г может рассмотреть расширение перечня признаков мошеннических операций при снятии наличных в банкоматах",
    "Сегодня 18:30 · Интерфакс",
  ],
  [
    "Суд прекратил производство по иску Аэрофлота на 2,4 млрд руб. к компании, не вернувшей из ремонта авиакомпоненты",
    "Сегодня 18:29 · Интерфакс · Транспорт",
  ],
  [
    "Нефтяные цены при сохранении ситуации в Ормузском проливе могут оказаться выше июльского прогноза ЦБ РФ",
    "Сегодня 18:26 · Интерфакс",
  ],
];

export default function EditorialSections({
  open,
}: {
  open: (detail: Detail) => void;
}) {
  const [period, setPeriod] = useState("Месяц");
  const [expanded, setExpanded] = useState(false);
  const article = () =>
    open({
      title: "Аналитика",
      body: (
        <>
          <img
            className="reference-article-image"
            src={referenceImage("asset-192.jpeg")}
            alt=""
          />
          <h3>{analysisTitle}</h3>
          <p>{analysisText}</p>
          <p className="reference-muted">
            Вчера 19:17 · Отдел аналитики · Материал из макета
          </p>
        </>
      ),
    });
  return (
    <>
      <section className="reference-section">
        <SectionHeading
          title="Индекс ВТБ"
          action="Подробнее"
          onClick={() =>
            open({
              title: "Индекс ВТБ",
              body: (
                <>
                  <p>Настроение инвесторов: соотношение покупок и продаж.</p>
                  <p>Покупают 44,25% · Продают 55,75%.</p>
                  <p className="reference-muted">
                    Доступен месячный снимок из HTML. Это демонстрационные
                    данные.
                  </p>
                </>
              ),
            })
          }
        />
        <div className="reference-card reference-sentiment">
          <div className="reference-sentiment-heading">
            <strong>
              Инвесторы <span className="reference-negative">негативны</span>
            </strong>
            <select
              aria-label="Период индекса"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option>Месяц</option>
              <option>Неделя</option>
            </select>
          </div>
          <p>
            Покупают <span className="reference-positive">44,25%</span> •
            Продают <span className="reference-negative">55,75%</span>
          </p>
          <div
            className={
              period === "Неделя"
                ? "reference-chart reference-chart-week"
                : "reference-chart"
            }
          >
            <img
              src={sentimentChart}
              alt="Динамика настроений инвесторов с 29 августа по 23 сентября"
            />
          </div>
          <div className="reference-chart-labels" aria-hidden="true">
            {(period === "Месяц"
              ? ["29.08", "03.09", "08.09", "13.09", "18.09", "23.09"]
              : ["18.09", "19.09", "20.09", "21.09", "22.09", "23.09"]
            ).map(date => <span key={date}>{date}</span>)}
          </div>
          {period === "Неделя" && (
            <small className="reference-muted">
              Последняя неделя месячного снимка
            </small>
          )}
        </div>
      </section>
      <section className="reference-section">
        <SectionHeading
          title="Аналитика"
          action="Подробнее"
          onClick={article}
        />
        <button className="reference-card reference-article" onClick={article}>
          <img src={referenceImage("asset-192.jpeg")} alt="" />
          <strong>{analysisTitle}</strong>
          <p>{analysisText}</p>
          <small>Вчера 19:17 · Отдел аналитики</small>
        </button>
      </section>
      <section className="reference-section">
        <SectionHeading
          title="Новости"
          action="Все новости"
          onClick={() =>
            open({
              title: "Все новости",
              body: (
                <>
                  {news.map(([title, meta]) => (
                    <article key={title}>
                      <h3>{title}</h3>
                      <p className="reference-muted">{meta}</p>
                    </article>
                  ))}
                </>
              ),
            })
          }
        />
        <div className="reference-summary reference-card">
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            <ReferenceIcon name="sparkle" size={16} />
            <strong>AI-саммари: картина дня</strong>
          </button>
          <ul>
            {summary.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          {expanded && (
            <p className="reference-muted">
              Обзор из предоставленного HTML-снимка. Новости не обновляются в
              реальном времени.
            </p>
          )}
        </div>
        <div className="reference-news reference-card">
          {news.map(([title, meta]) => (
            <button
              key={title}
              onClick={() =>
                open({
                  title: "Новость",
                  body: (
                    <>
                      <h3>{title}</h3>
                      <p>{meta}</p>
                      <p className="reference-muted">
                        В исходном макете доступен только заголовок этой
                        новости.
                      </p>
                    </>
                  ),
                })
              }
            >
              <strong>{title}</strong>
              <small>{meta}</small>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
