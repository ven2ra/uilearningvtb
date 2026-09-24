import { useState } from "react";
import { useApp } from "../../state/AppState";
import { referenceImage } from "./ReferenceIcon";
import type { Detail } from "./DetailSheet";
import TrainingBanner from "./TrainingBanner";

const banners = [
  [
    "Добро пожаловать в ВТБ Мои Инвестиции!",
    "Что поддержать — решаете вы",
    "asset-056.jpeg",
  ],
  [
    "Переведите активы в ВТБ",
    "Получите шанс удвоить портфель",
    "asset-058.jpeg",
  ],
  [
    "Больше возможностей на ИИС",
    "Покупка структурных облигаций и паёв фондов недвижимости",
    "asset-060.jpeg",
  ],
  [
    "Попробуйте Советника ПРО",
    "Без дополнительных комиссий до конца года",
    "asset-062.jpeg",
  ],
  [
    "Что купить на этой неделе",
    "Подборка перспективных ценных бумаг от аналитиков",
    "asset-064.jpeg",
  ],
  ["Расклад в пользу рынка", "Бюджет, рубль и ставка", "asset-066.jpeg"],
  ["Инвестиции в структурные продукты", "До 26% годовых", "asset-068.jpeg"],
  [
    "Портфель на миллион",
    "Разыгрываем портфель ценных бумаг на 1 млн ₽",
    "asset-070.jpeg",
  ],
  ["Фонды, срочный рынок и IPO без комиссии брокера", "", "asset-072.jpeg"],
  [
    "Как инвестировать в отпуске",
    "Несколько рекомендаций для доступа из-за рубежа",
    "asset-074.jpeg",
  ],
];
const promos = [
  ["Розыгрыш миллиона рублей", "asset-076.png", "#a29aff"],
  ["Акция: кредит под активы", "asset-078.png", "#60aaff"],
  ["Открыть новый субсчет", "asset-080.png", "#fff"],
  ["Маржинальная торговля", "asset-082.png", "#fff"],
  ["ИИС", "asset-084.png", "#fff"],
  ["ФинКод: всё об инвестициях", "asset-086.png", "#fff"],
  ["Голосования акционеров", "asset-088.png", "#fff"],
  ["Индивидуальный подход с Advisory", "asset-090.png", "#fff"],
];

export default function Promotions({
  open,
}: {
  open: (detail: Detail) => void;
}) {
  const [index, setIndex] = useState(0);
  const app = useApp();
  const visibleBanners = app.training.finished ? banners.slice(1) : banners;
  const activeIndex = Math.min(index, visibleBanners.length - 1);
  const [title, subtitle, image] = visibleBanners[activeIndex];
  return (
    <>
      <section className="reference-banners" aria-label="Предложения">
        {!app.training.finished && activeIndex === 0 ? <TrainingBanner onStart={() => app.enterTraining()} onLater={() => setIndex(1)} /> : <button
          className="reference-banner"
          style={{ backgroundImage: `url(${referenceImage(image)})` }}
          onClick={() => open({ title, body: <p>{subtitle || title}</p> })}
        >
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </button>}
        <div className="reference-dots">
          {visibleBanners.map(([name], i) => (
            <button
              key={name}
              aria-label={`Баннер ${i + 1}: ${name}`}
              aria-pressed={i === activeIndex}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </section>
      <section className="reference-promos" aria-label="Сервисы">
        {promos.map(([name, asset, color], i) => (
          <button
            key={name}
            style={{
              backgroundColor: color,
              backgroundImage: `url(${referenceImage(asset)})`,
            }}
            onClick={() =>
              i === 5
                ? app.enterTraining()
                : open({
                    title: name,
                    body: (
                      <>
                        <p>{name}</p>
                        <p className="reference-muted">
                          Предложение из демонстрационного макета. Оформление
                          услуги в прототипе недоступно.
                        </p>
                      </>
                    ),
                  })
            }
          >
            <span>{name}</span>
          </button>
        ))}
      </section>
    </>
  );
}
