import { useState } from "react";
import { useApp } from "../state/AppState";
import { DIFFICULTY_LABEL, FINCODE_BY_ID, FINCODE_COVERS, FINCODE_DISCOUNTS, FINCODE_TOPICS } from "../lib/fincode";
import { plural } from "../lib/format";
import Icon from "../ui/Icons";
import { Badge, Button, Page, ProgressBar, SectionTitle, Segmented, TopBar, cx } from "../ui/kit";

// ================= Главная «Финкода» =================
export function FinCodeHome() {
  const app = useApp();
  const fc = app.finCode;
  const offered = app.finCodeToday?.offered ?? FINCODE_TOPICS.filter((t) => t.id !== "final").map((t) => t.id);
  const completedToday = app.finCodeToday?.completedId;

  return (
    <>
      <TopBar back={app.stack.length > 1} title="Финкод" subtitle="Обучение поручениям и бирже" />
      <Page>
        <section className="mt-4 rounded-l border border-line-subtle bg-surface p-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-1 items-center gap-2.5">
              <span className={cx("flex h-11 w-11 items-center justify-center rounded-l", app.finCodeStreak > 0 ? "bg-warning-surface text-[#B45309]" : "bg-muted text-ink-3")}>
                <Icon name="flame" size={24} />
              </span>
              <div>
                <div className="num text-[22px] font-bold leading-7">{app.finCodeStreak}</div>
                <div className="text-[12px] text-ink-2">{plural(app.finCodeStreak, "день", "дня", "дней")} подряд</div>
              </div>
            </div>
            <button type="button" onClick={() => app.go("fincode-shop")} className="flex h-11 items-center gap-1.5 rounded-l bg-[#EEF2FF] px-3 text-[#4F46E5] cursor-pointer active:brightness-95">
              <Icon name="coin" size={20} />
              <span className="num text-[16px] font-bold">{fc.coins}</span>
            </button>
          </div>
          {!completedToday && (
            <div className="mt-3 flex items-center gap-2 rounded-m bg-warning-surface px-3 py-2 text-[12px] font-medium text-[#92400E]">
              <Icon name="flame" size={16} />
              Выполните любое из заданий на сегодня, чтобы продлить стрик
            </div>
          )}
        </section>

        <SectionTitle>Задания на сегодня</SectionTitle>
        <div className="flex flex-col gap-2">
          {offered.map((id) => {
            const topic = FINCODE_BY_ID[id];
            if (!topic) return null;
            const done = completedToday === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => app.go("fincode-topic", { id })}
                className="flex w-full items-center gap-3 rounded-l border border-line-subtle bg-surface p-3 text-left cursor-pointer active:bg-surface-muted"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-m bg-accent-subtle text-accent-text">
                  <Icon name={topic.icon} size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-semibold leading-5">{topic.title}</div>
                  <div className="truncate text-[12px] text-ink-2">{topic.short}</div>
                </div>
                {done ? <Badge tone="success">Выполнено</Badge> : <Icon name="chevronRight" size={20} className="text-ink-3" />}
              </button>
            );
          })}
        </div>

        <SectionTitle>Темы</SectionTitle>
        <div className="overflow-hidden rounded-l border border-line-subtle bg-surface">
          {FINCODE_TOPICS.map((t) => {
            const prog = fc.progress[t.id];
            const locked = !!t.requires && !t.requires.every((r) => fc.progress[r]?.done);
            return (
              <button
                key={t.id}
                type="button"
                disabled={locked}
                onClick={() => app.go("fincode-topic", { id: t.id })}
                className="flex w-full items-center gap-3 border-b border-line-subtle px-4 py-3 text-left last:border-0 cursor-pointer active:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-m", prog?.done ? "bg-success-surface text-success" : "bg-muted text-ink-2")}>
                  <Icon name={locked ? "lock" : prog?.done ? "check" : t.icon} size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-medium leading-5">{t.title}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-2">
                    <Badge tone={t.difficulty === "hard" ? "warning" : "neutral"}>{DIFFICULTY_LABEL[t.difficulty]}</Badge>
                    {locked ? "Сначала пройдите предыдущие темы" : t.short}
                  </div>
                </div>
                {!locked && <Icon name="chevronRight" size={20} className="text-ink-3" />}
              </button>
            );
          })}
        </div>

        <p className="mt-4 px-1 text-[11px] leading-4 text-ink-3">Финкоины начисляются за первое прохождение темы и за ежедневные задания. Учебная валюта прототипа.</p>
      </Page>
    </>
  );
}

// ================= Тема: уроки + тест =================
export function FinCodeTopicScreen({ id }: { id: string }) {
  const app = useApp();
  const topic = FINCODE_BY_ID[id];
  const [phase, setPhase] = useState<"lesson" | "quiz" | "result">("lesson");
  const [cardIdx, setCardIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [result, setResult] = useState<{ passed: boolean; coinsEarned: number } | null>(null);

  if (!topic) return null;
  const locked = !!topic.requires && !topic.requires.every((r) => app.finCode.progress[r]?.done);

  if (locked) {
    return (
      <>
        <TopBar back title={topic.title} />
        <Page className="flex flex-col items-center pt-10 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-ink-3">
            <Icon name="lock" size={30} />
          </span>
          <h2 className="mt-4 text-[20px] font-semibold">Тема пока закрыта</h2>
          <p className="mt-1 text-[14px] leading-5 text-ink-2">Сначала пройдите: {topic.requires!.map((r) => FINCODE_BY_ID[r]?.title).join(", ")}</p>
          <Button full className="mt-6" variant="tertiary" onClick={app.back}>
            Назад
          </Button>
        </Page>
      </>
    );
  }

  if (phase === "result" && result) {
    return (
      <>
        <TopBar title={topic.title} />
        <Page className="flex flex-col items-center pt-8 text-center">
          <span className={cx("flex h-20 w-20 items-center justify-center rounded-full anim-pop", result.passed ? "bg-success-surface text-success" : "bg-error-surface text-error")}>
            <Icon name={result.passed ? "checkCircle" : "alert"} size={40} />
          </span>
          <h2 className="mt-4 text-[24px] font-bold leading-8">{result.passed ? "Тема пройдена" : "Пока не хватает баллов"}</h2>
          <p className="mt-1 text-[15px] text-ink-2">
            Правильных ответов: {correctCount} из {topic.quiz.length}
          </p>
          {result.passed && result.coinsEarned > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-m bg-[#EEF2FF] px-3 py-2 text-[13px] font-semibold text-[#4F46E5]">
              <Icon name="coin" size={18} />+{result.coinsEarned} финкоинов
            </div>
          )}
          {!result.passed && <p className="mt-2 text-[13px] text-ink-3">Нужно верно ответить хотя бы на {Math.ceil(topic.quiz.length * topic.passRatio)} из {topic.quiz.length} вопросов</p>}
          <div className="mt-8 flex w-full flex-col gap-2">
            {!result.passed && (
              <Button
                full
                onClick={() => {
                  setPhase("quiz");
                  setQIdx(0);
                  setSelected(null);
                  setRevealed(false);
                  setCorrectCount(0);
                  setResult(null);
                }}
              >
                Пройти тест ещё раз
              </Button>
            )}
            <Button full variant={result.passed ? "primary" : "tertiary"} onClick={() => app.tab("fincode")}>
              К списку тем
            </Button>
          </div>
        </Page>
      </>
    );
  }

  if (phase === "quiz") {
    const q = topic.quiz[qIdx];
    const isLast = qIdx + 1 >= topic.quiz.length;
    const answer = () => {
      if (selected === null) return;
      if (!revealed) {
        setRevealed(true);
        if (selected === q.correct) setCorrectCount((c) => c + 1);
        return;
      }
      if (isLast) {
        const r = app.completeFinCodeQuiz(topic.id, correctCount, topic.quiz.length);
        setResult(r);
        setPhase("result");
      } else {
        setQIdx((i) => i + 1);
        setSelected(null);
        setRevealed(false);
      }
    };
    return (
      <>
        <TopBar back title={topic.title} subtitle={`Вопрос ${qIdx + 1} из ${topic.quiz.length}`} />
        <Page>
          <ProgressBar value={qIdx + (revealed ? 1 : 0)} max={topic.quiz.length} className="mt-4" />
          <h2 className="mt-4 text-[19px] font-semibold leading-6">{q.q}</h2>
          <div className="mt-4 flex flex-col gap-2">
            {q.options.map((opt, i) => {
              const isCorrect = revealed && i === q.correct;
              const isWrong = revealed && i === selected && i !== q.correct;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={revealed}
                  onClick={() => setSelected(i)}
                  className={cx(
                    "flex w-full items-center gap-3 rounded-l border p-3 text-left text-[14px] font-medium cursor-pointer disabled:cursor-not-allowed",
                    isCorrect && "border-success bg-success-surface text-success",
                    isWrong && "border-error bg-error-surface text-error",
                    !revealed && selected === i && "border-accent bg-accent-subtle text-accent-text",
                    !revealed && selected !== i && "border-line-subtle bg-surface",
                    revealed && !isCorrect && !isWrong && "border-line-subtle bg-surface text-ink-3",
                  )}
                >
                  <span className={cx("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold", isCorrect ? "border-success" : isWrong ? "border-error" : "border-line-strong")}>
                    {isCorrect ? <Icon name="check" size={14} /> : isWrong ? <Icon name="x" size={14} /> : String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
          <Button full className="mt-5" disabled={selected === null} onClick={answer}>
            {!revealed ? "Ответить" : isLast ? "Завершить тест" : "Далее"}
          </Button>
        </Page>
      </>
    );
  }

  // phase === "lesson"
  const card = topic.cards[cardIdx];
  const isLastCard = cardIdx + 1 >= topic.cards.length;
  return (
    <>
      <TopBar back title={topic.title} subtitle={`Урок ${cardIdx + 1} из ${topic.cards.length}`} />
      <Page>
        <div className="mt-2 flex gap-1.5" aria-hidden="true">
          {topic.cards.map((_, i) => (
            <span key={i} className={cx("h-1.5 flex-1 rounded-full", i <= cardIdx ? "bg-accent" : "bg-muted")} />
          ))}
        </div>
        <section className="mt-4 rounded-l border border-line-subtle bg-surface p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-l bg-accent-subtle text-accent-text">
            <Icon name={topic.icon} size={22} />
          </span>
          <h2 className="mt-3 text-[20px] font-semibold leading-7">{card.title}</h2>
          <p className="mt-2 text-[15px] leading-[22px] text-ink-2">{card.text}</p>
        </section>
        <div className="mt-4 flex gap-2">
          {cardIdx > 0 && (
            <Button variant="tertiary" onClick={() => setCardIdx((i) => i - 1)}>
              Назад
            </Button>
          )}
          <Button full onClick={() => (isLastCard ? setPhase("quiz") : setCardIdx((i) => i + 1))}>
            {isLastCard ? "Начать тест" : "Далее"}
          </Button>
        </div>
      </Page>
    </>
  );
}

// ================= Магазин финкоинов =================
export function FinCodeShop() {
  const app = useApp();
  const fc = app.finCode;
  const [tab, setTab] = useState<"Обложки" | "Скидки">("Обложки");
  const activeUntilH = app.activeDiscount ? Math.max(0, Math.round((app.activeDiscount.until - Date.now()) / 3600000)) : 0;

  return (
    <>
      <TopBar back title="Магазин Финкода" />
      <Page>
        <section className="mt-4 flex items-center gap-3 rounded-l border border-line-subtle bg-[#EEF2FF] p-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-l bg-white text-[#4F46E5]">
            <Icon name="coin" size={24} />
          </span>
          <div>
            <div className="num text-[22px] font-bold leading-7 text-[#4F46E5]">{fc.coins}</div>
            <div className="text-[12px] text-[#4F46E5]/80">финкоинов</div>
          </div>
        </section>

        {app.activeDiscount && (
          <div className="mt-3 flex items-center gap-2 rounded-m bg-success-surface px-3 py-2 text-[13px] font-semibold text-success">
            <Icon name="percent" size={16} />
            Скидка {app.activeDiscount.pct}% на комиссию действует ещё ~{activeUntilH} ч
          </div>
        )}

        <div className="mt-4">
          <Segmented options={["Обложки", "Скидки"] as const} value={tab} onChange={setTab} />
        </div>

        {tab === "Обложки" ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {FINCODE_COVERS.map((c) => {
              const owned = fc.ownedCovers.includes(c.id);
              const equipped = fc.equippedCover === c.id;
              return (
                <div key={c.id} className="overflow-hidden rounded-l border border-line-subtle bg-surface">
                  <div className="h-20" style={{ background: c.gradient }} />
                  <div className="p-3">
                    <div className="text-[14px] font-semibold leading-5">{c.title}</div>
                    <button
                      type="button"
                      onClick={() => {
                        const err = app.buyCover(c.id);
                        if (err) app.toast({ kind: "error", title: err });
                      }}
                      disabled={equipped}
                      className={cx(
                        "mt-2 h-8 w-full rounded-m text-[12px] font-semibold cursor-pointer disabled:cursor-not-allowed",
                        equipped ? "bg-success-surface text-success" : owned ? "bg-accent-subtle text-accent-text" : "bg-muted text-ink",
                      )}
                    >
                      {equipped ? "Надето" : owned ? "Надеть" : `${c.price} · Купить`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {FINCODE_DISCOUNTS.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-l border border-line-subtle bg-surface p-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-l bg-success-surface text-success">
                  <Icon name="percent" size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold leading-5">{d.title}</div>
                  <div className="text-[12px] text-ink-2">Действует {d.hours} ч</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const err = app.buyDiscount(d.id);
                    if (err) app.toast({ kind: "error", title: err });
                  }}
                  className="flex h-9 shrink-0 items-center gap-1 rounded-m bg-muted px-2.5 text-[12px] font-semibold cursor-pointer"
                >
                  <Icon name="coin" size={14} />
                  {d.price}
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 px-1 text-[11px] leading-4 text-ink-3">Обложки и скидки — учебная механика прототипа, финкоины не являются реальными деньгами.</p>
      </Page>
    </>
  );
}
