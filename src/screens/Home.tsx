import { useState } from "react";
import { useApp } from "../state/AppState";
import { INSTRUMENTS, INSTRUMENT_BY_ID } from "../lib/data";
import { STAGES, TASKS, statusFor, tasksUntilNextAchievement } from "../lib/training";
import { AchChip, FirstSteps, LearningCard } from "../components/learning/HomeLearning";
import { fmtMoney, plural } from "../lib/format";
import { series } from "../lib/chart";
import SourceHome from "./SourceHome";
import Icon, { type IconName } from "../ui/Icons";
import { Change, HelpButton, Monogram, ProgressBar, SectionTitle, Sparkline, VirtualTag, cx } from "../ui/kit";

export default function Home() {
  const app = useApp();
  return app.mode === "real" ? <SourceHome /> : <TrainingHome />;
}

function TrainingHome() {
  const app = useApp();
  const training = app.mode === "training";
  const pct = app.portfolioValue - app.dayChange ? (app.dayChange / (app.portfolioValue - app.dayChange)) * 100 : 0;
  const [hidden, setHidden] = useState(false);

  return (
    <div className="pb-6">
      {/* Шапка */}
      <header className="sticky top-0 z-[100] flex items-center gap-3 bg-page/95 px-4 py-2.5 backdrop-blur">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-subtle text-[14px] font-bold text-accent-text">АК</div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-[12px] text-ink-2">{training ? "Учебный счёт" : "ВТБ Мои Инвестиции"}</div>
          <div className="text-[16px] font-semibold">Анна К.</div>
        </div>
        <AchChip />
        <HelpButton />
      </header>

      <div className="px-4">
        {/* Баланс */}
        <section
          data-tour="balance"
          className={cx("mt-1 rounded-l border p-6 text-center", training ? "border-tr-border bg-tr-surface" : "border-line-subtle bg-surface")}
        >
          <span className="text-[13px] font-medium text-ink-2">{training ? "Виртуальный баланс" : "Стоимость портфеля"}</span>
          <div className="mt-1.5 flex items-center justify-center gap-2">
            <span className="num text-[36px] font-bold leading-none tracking-tight">{hidden ? "•••• ₽" : fmtMoney(app.portfolioValue)}</span>
            <button
              type="button"
              onClick={() => setHidden((h) => !h)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-3 cursor-pointer active:bg-muted"
              aria-label={hidden ? "Показать сумму" : "Скрыть сумму"}
            >
              <Icon name={hidden ? "eyeOff" : "eye"} size={20} />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-center gap-2 text-[13px]">
            <Change value={app.dayChange} pct={pct} />
            <span className="text-ink-3">за день</span>
          </div>
          <div className="mt-3">
            {training ? (
              <VirtualTag />
            ) : (
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-ink-2">Брокерский ···4821</span>
            )}
          </div>
          {training && <div className="mt-2 text-[12px] text-tr-text">Виртуальные средства. Реальные деньги не списываются.</div>}
        </section>

        {/* Быстрые действия */}
        <div className="mt-3 flex gap-2">
          <QuickAction tour="actions" icon="grid" label="Действия" primary onClick={app.openActions} />
          <QuickAction icon="search" label="Рынок" onClick={() => app.tab("market")} />
          <QuickAction icon="pie" label="Портфель" onClick={() => app.tab("portfolio")} />
        </div>

        <AccountsStrip />

        {/* Обучение */}
        {!training && <FirstSteps />}
        {training ? <TrainingProgressCard /> : <LearningCard />}

        {/* Активы */}
        <SectionTitle
          action={
            <button type="button" onClick={() => app.tab("portfolio")} className="text-[13px] font-semibold text-accent-text cursor-pointer">
              Все
            </button>
          }
        >
          Мои активы
        </SectionTitle>
        {app.account.positions.length === 0 ? (
          <div className="flex items-center gap-3 rounded-l border border-line-subtle bg-surface p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-m bg-muted text-ink-3">
              <Icon name="briefcase" size={22} />
            </span>
            <div className="flex-1 text-[13px] leading-5 text-ink-2">Пока нет активов. Они появятся после первой покупки.</div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {app.account.positions.slice(0, 3).map((p) => {
              const price = app.prices[p.id];
              const i = INSTRUMENT_BY_ID[p.id];
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => app.go("instrument", { id: p.id })}
                  className="flex w-full items-center justify-between gap-3 rounded-l border border-line-subtle bg-surface p-4 text-left cursor-pointer active:bg-surface-muted"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Monogram id={p.id} />
                    <div className="min-w-0">
                      <div className="num text-[17px] font-semibold leading-6">{fmtMoney(price * p.qty)}</div>
                      <div className="truncate text-[12px] text-ink-2">
                        {i.name} · {p.qty.toLocaleString("ru-RU")} шт.
                      </div>
                    </div>
                  </div>
                  <Change pct={((price - p.avg) / p.avg) * 100} />
                </button>
              );
            })}
          </div>
        )}

        {/* Популярное */}
        <SectionTitle>Популярное</SectionTitle>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {INSTRUMENTS.slice(0, 6).map((i) => {
            const price = app.prices[i.id];
            return (
              <button key={i.id} type="button" onClick={() => app.go("instrument", { id: i.id })} className="w-[150px] shrink-0 rounded-l border border-line-subtle bg-surface p-3 text-left cursor-pointer active:bg-surface-muted">
                <div className="flex items-center gap-2">
                  <Monogram id={i.id} size={28} />
                  <span className="truncate text-[13px] font-semibold">{i.ticker}</span>
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <div className="num text-[14px] font-semibold">{fmtMoney(price)}</div>
                    <Change pct={((price - i.open) / i.open) * 100} className="text-[12px]" />
                  </div>
                  <Sparkline data={series(i.id, "1Д", price, 20)} width={44} height={24} />
                </div>
              </button>
            );
          })}
        </div>

        <AiSummary />
        <NewsFeed />
        <WeeklyCollections />
        <FundsSection />
        <p className="mt-4 px-1 text-[11px] leading-4 text-ink-3">Котировки — тестовые данные прототипа и не являются инвестиционной рекомендацией.</p>
      </div>
    </div>
  );
}

function AccountsStrip() {
  const app = useApp();
  return (
    <section className="mt-5">
      <SectionTitle action={<button type="button" onClick={() => app.go("profile")} className="text-[13px] font-semibold text-accent-text">Все счета</button>}>Счета</SectionTitle>
      <button type="button" onClick={() => app.tab("portfolio")} className="flex w-full items-center gap-3 rounded-l border border-line-subtle bg-surface p-4 text-left active:bg-surface-muted">
        <span className="flex h-10 w-10 items-center justify-center rounded-m bg-accent-subtle text-accent-text"><Icon name="wallet" size={21} /></span>
        <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold">Брокерский счёт</span><span className="block text-[12px] text-ink-2">···4821 · доступно {fmtMoney(app.account.cash)}</span></span>
        <Icon name="chevronRight" size={19} className="text-ink-3" />
      </button>
    </section>
  );
}

function AiSummary() {
  const app = useApp();
  const points = ["Азиатские рынки акций демонстрируют рост", "Снижение остатков на корсчетах банков в ЦБ РФ", "Центральный банк Узбекистана улучшил прогноз роста ВВП"];
  return (
    <section className="source-ai mt-6 overflow-hidden rounded-l border border-[#d9d8ff] bg-white p-4 shadow-e1">
      <button type="button" onClick={() => app.toast({ kind: "info", title: "AI-саммари", text: "Обновление картины дня доступно в полном приложении" })} className="flex w-full items-center gap-2 text-left">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ecebff] text-[#5f5fff]"><Icon name="sparkle" size={16} /></span>
        <span className="text-[14px] font-semibold text-[#5f5fff]">AI-саммари: картина дня</span>
        <Icon name="chevronRight" size={17} className="ml-auto text-ink-3" />
      </button>
      <ul className="mt-3 space-y-2 text-[13px] leading-[18px] text-ink">
        {points.map((point) => <li key={point} className="flex gap-2"><span className="text-brand">•</span><span>{point}</span></li>)}
      </ul>
    </section>
  );
}

function NewsFeed() {
  const app = useApp();
  const news = [
    ["ЦБ РФ в 2027г может рассмотреть расширение перечня признаков мошеннических операций", "Сегодня 18:30 · Интерфакс"],
    ["Суд прекратил производство по иску Аэрофлота на 2,4 млрд руб.", "Сегодня 18:29 · Интерфакс · Транспорт"],
    ["Нефтяные цены могут оказаться выше июльского прогноза ЦБ РФ", "Сегодня 18:26 · Интерфакс"],
  ];
  return (
    <section className="mt-6">
      <SectionTitle action={<button type="button" onClick={() => app.toast({ kind: "info", title: "Новости", text: "Полная лента новостей доступна в приложении" })} className="text-[13px] font-semibold text-accent-text">Все новости</button>}>Новости</SectionTitle>
      <div className="overflow-hidden rounded-l border border-line-subtle bg-surface">
        {news.map(([title, meta]) => <button key={title} type="button" onClick={() => app.toast({ kind: "info", title: "Новость", text: title })} className="w-full border-b border-line-subtle px-4 py-3 text-left last:border-0 active:bg-surface-muted"><span className="block text-[14px] font-medium leading-5">{title}</span><span className="mt-1 block text-[12px] text-ink-2">{meta}</span></button>)}
      </div>
    </section>
  );
}

function WeeklyCollections() {
  const app = useApp();
  const collections = [
    ["Дивидендные лидеры", "20%", "#bce9e5"],
    ["Фавориты стратегии", "25%", "#d9d9ff"],
    ["Золотой баланс", "15%", "#ffe5a8"],
  ];
  return (
    <section className="mt-6">
      <SectionTitle>Подборки недели</SectionTitle>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {collections.map(([title, value, color]) => <button key={title} type="button" onClick={() => app.tab("market")} className="relative h-[150px] w-[164px] shrink-0 overflow-hidden rounded-l border border-line-subtle p-3 text-left" style={{ background: `radial-gradient(circle at 10% 8%, #fff 0, ${color} 72%)` }}><span className="absolute right-3 top-3 rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-ink-2">+7</span><span className="absolute bottom-10 left-3 right-3 text-[16px] font-semibold leading-5">{title}</span><span className="absolute bottom-3 left-3 text-[13px] text-ink-2">до {value} за 12 месяцев</span></button>)}
      </div>
    </section>
  );
}

function FundsSection() {
  const app = useApp();
  const funds = [["ВИМ - Корпоративные облигации", "20%"], ["ВИМ-Накопительный резерв", "25%"], ["Ликвидность (LQDT)", "14,2%"], ["Инвестидея: купить паи ПИФа «Золото. Биржевой»", "15%"]];
  return (
    <section className="mt-6">
      <SectionTitle action={<button type="button" onClick={() => app.tab("market")} className="text-[13px] font-semibold text-accent-text">Все фонды</button>}>Фонды</SectionTitle>
      <div className="overflow-hidden rounded-l border border-line-subtle bg-surface">
        {funds.map(([name, value]) => <button key={name} type="button" onClick={() => app.tab("market")} className="flex w-full items-center gap-3 border-b border-line-subtle px-4 py-3 text-left last:border-0 active:bg-surface-muted"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#9bd5db] to-[#706dff] text-[12px] font-bold text-white">Ф</span><span className="min-w-0 flex-1"><span className="block text-[14px] font-medium leading-5">{name}</span><span className="block text-[12px] text-ink-2">Фонд · за 12 месяцев</span></span><span className="num text-[15px] font-semibold text-success">{value}</span></button>)}
      </div>
    </section>
  );
}

function QuickAction({ icon, label, onClick, primary, tour }: { icon: IconName; label: string; onClick: () => void; primary?: boolean; tour?: string }) {
  return (
    <button
      type="button"
      data-tour={tour}
      onClick={onClick}
      className={cx(
        "flex h-12 flex-1 items-center justify-center gap-2 rounded-full border text-[13px] font-semibold cursor-pointer active:scale-[0.98] transition-transform",
        primary ? "border-transparent bg-accent text-white" : "border-line-subtle bg-surface text-ink",
      )}
    >
      <Icon name={icon} size={20} />
      {label}
    </button>
  );
}

/** В тренировке: мини-сводка прогресса и ссылка на задания */
function TrainingProgressCard() {
  const app = useApp();
  const t = app.training;
  const until = tasksUntilNextAchievement(t.done);
  return (
    <button type="button" onClick={() => app.tab("hub")} className="mt-3 w-full rounded-l border border-tr-border bg-surface p-4 text-left cursor-pointer">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-ink-2">Ваш прогресс</span>
        <span className="rounded-s bg-tr-surface px-2 py-0.5 text-[11px] font-semibold text-tr-text">{statusFor(app.doneStages)}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="num text-[24px] font-bold">{app.doneStages}</span>
        <span className="text-[15px] text-ink-2">из {STAGES.length} этапов</span>
      </div>
      <ProgressBar value={t.done} max={TASKS.length} tone="training" className="mt-2" />
      <div className="mt-2 flex items-center justify-between text-[12px] text-ink-2">
        <span>
          {until && until.left > 0 ? `До «${until.achievement.title}» — ${until.left} ${plural(until.left, "задание", "задания", "заданий")}` : "Все достижения открыты"}
        </span>
        <span className="flex items-center font-semibold text-tr-text">
          Все этапы <Icon name="chevronRight" size={16} />
        </span>
      </div>
    </button>
  );
}
