import StatIcon from "../components/learning/StatIcon";
import LessonNode from "../components/learning/LessonNode";
import { useEffect, useState } from "react";
import { useApp } from "../state/AppState";
import Icon, { type IconName } from "../ui/Icons";
import FincodeMascot from "../components/learning/FincodeMascot";
import DetailSheet from "../components/home/DetailSheet";
import "./LearningPath.css";
import { COURSE } from "../lib/course";
import LearningArt, { type LearningArtName } from "../components/learning/LearningArt";
const lessonArt: LearningArtName[] = ["bars", "coins", "cards", "umbrella", "pie", "trend", "file"];

const lessons: { title: string; text: string; minutes: number; icon: IconName }[] = [
  { title: "Зачем инвестировать?", text: "Узнайте, как работают деньги и почему важно инвестировать", minutes: 3, icon: "file" },
  { title: "Как работает процент?", text: "Разберём на примерах сложный процент", minutes: 4, icon: "wallet" },
  { title: "Основные инструменты", text: "Акции, облигации, фонды и другие инструменты", minutes: 5, icon: "market" },
  { title: "Риск и диверсификация", text: "Как снизить риски и собрать сбалансированный портфель", minutes: 5, icon: "pie" },
  { title: "Как собрать первый портфель", text: "Пошаговая инструкция с практикой", minutes: 6, icon: "shield" },
  { title: "Стратегии инвестирования", text: "Консервативная, умеренная, активная стратегии", minutes: 4, icon: "target" },
  { title: "Налоги и комиссии", text: "Что нужно знать инвестору", minutes: 5, icon: "cap" },
];

export default function LearningPath() {
  const app = useApp();
  useEffect(() => {
    const recordStudyDay = () => {
      const today = new Date().toLocaleDateString("en-CA");
      app.setCourse(previous => previous.days.includes(today) ? previous : { ...previous, days: [...previous.days, today] });
    };
    recordStudyDay();
    const onVisible = () => { if (document.visibilityState === "visible") recordStudyDay(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [app.setCourse]);
  const [selected, setSelected] = useState<number | null>(null);
  const [incorrect, setIncorrect] = useState(false);
  const completed = app.course.completed;
  const percent = Math.round(completed / lessons.length * 100);
  const lesson = selected === null ? null : COURSE[selected];
  const step = selected === null ? 0 : app.course.steps[selected] ?? 0;
  const answer = selected === null ? undefined : app.course.answers[selected];
  const openLesson = (i: number) => { if (i <= completed) { if (i === 0) { app.go('lesson-flow', { id: '1' }); return; } setIncorrect(false); setSelected(i); } };
  const setStep = (next: number) => { if (selected === null) return; setIncorrect(false); app.setCourse(c => ({ ...c, steps: { ...c.steps, [selected]: next } })); };
  const submit = () => {
    if (selected === null || !lesson) return;
    if (answer !== lesson.correct) {
      app.setCourse(c => ({ ...c, quizAttempts: { ...c.quizAttempts, [selected]: (c.quizAttempts?.[selected] ?? 0) + 1 } }));
      setIncorrect(true); return;
    }
    app.setCourse(c => {
      if (selected > c.completed || c.answers[selected] !== COURSE[selected].correct) return c;
      const first = selected === c.completed;
      const today = new Date().toLocaleDateString("en-CA");
      const attempts = (c.quizAttempts?.[selected] ?? 0) + 1;
      const result = { score: Math.round(100 / attempts), attempts, completedAt: Date.now() };
      const bestResult = c.quizResults?.[selected];
      return { ...c, completed: first ? c.completed + 1 : c.completed, coins: c.coins + (first ? 50 : 0), days: !c.days.includes(today) ? [...c.days, today] : c.days, steps: { ...c.steps, [selected]: 3 }, quizResults: { ...c.quizResults, [selected]: !bestResult || result.score > bestResult.score ? result : bestResult } };
    });
    setIncorrect(false);
  };
  let streak = 0;
  const date = new Date();
  if (!app.course.days.includes(date.toLocaleDateString("en-CA"))) date.setDate(date.getDate() - 1);
  while (app.course.days.includes(date.toLocaleDateString("en-CA"))) { streak++; date.setDate(date.getDate() - 1); }
  return <div className="learning-path">
    <button className="learning-path-back" aria-label="Назад" onClick={app.back}><Icon name="chevronLeft" /></button>
    <header className="learning-path-hero"><div className="learning-path-intro"><span>ВАШ ПУТЬ В ИНВЕСТИЦИЯХ</span><h1>Учитесь<br />и достигайте целей</h1><p>Короткие уроки, интерактивные задания<br />и награды за прогресс</p></div><FincodeMascot /></header>
    <div className="learning-path-stats">
      <section className="learning-path-progress"><p><strong>{completed} из {lessons.length}</strong> уроков пройдено</p><div><span role="progressbar" aria-label="Уроки пройдены" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${percent}%` }} /></span><small>{percent}%</small></div></section>
      <section><strong><StatIcon index={0} /> {streak}</strong><small>дней подряд</small></section>
      <button aria-label="Магазин финкоинов" onClick={() => app.go("finkoin-shop")}><strong><StatIcon index={1} /> {app.course.coins} <Icon name="chevronRight" size={14} /></strong><small>финкоинов</small></button>
      <button onClick={() => app.go("achievements")}><strong><StatIcon index={2} /> {Object.keys(app.course.achievementProgress ?? {}).length} <Icon name="chevronRight" size={14} /></strong><small>достижения</small></button>
    </div>
    <ol className="learning-path-lessons">{lessons.map((lesson, i) => <li key={lesson.title} className={i < completed ? "is-done" : i === completed ? "is-current" : "is-locked"}>
      <div className="learning-path-node"><button className="lesson-node-button" disabled={i > completed} aria-label={`Начать урок ${i + 1}`} onClick={() => openLesson(i)}><LessonNode index={i} status={i < completed ? "done" : i === completed ? "active" : "locked"} /></button></div>
      <button className="learning-path-card" disabled={i > completed} onClick={() => openLesson(i)} aria-label={`Урок ${i + 1}: ${lesson.title}`}><div className="learning-path-card-text"><span className="learning-lesson-meta">Урок {i + 1} · {lesson.minutes} мин</span><h2>{lesson.title}</h2><p>{lesson.text}</p></div><div className={`learning-lesson-art art-${i}`}><LearningArt name={lessonArt[i]} /></div><span className="learning-lesson-next"><Icon name="chevronRight" size={20} /></span>{i < completed && <span className="learning-lesson-done"><Icon name="check" size={12} /></span>}</button>
    </li>)}</ol>
    <DetailSheet detail={selected === null || !lesson ? null : { title: lessons[selected].title, body: <div className="course-lesson">
      <p className="course-step">{step < 2 ? `Шаг ${step + 1} из 3` : step === 2 ? "Шаг 3 из 3 · Тест" : "Урок завершён"}</p>
      {step < 2 ? <><p>{lesson.pages[step]}</p><div className="course-controls">{step > 0 && <button onClick={() => setStep(step - 1)}>Назад</button>}<button className="course-primary" onClick={() => setStep(step + 1)}>{step === 0 ? "Далее" : "Перейти к тесту"}</button></div></> : step === 2 ? <>
        <fieldset><legend>{lesson.question}</legend>{lesson.options.map((option, i) => <label key={option}><input type="radio" name="course-answer" checked={answer === i} onChange={() => { setIncorrect(false); app.setCourse(c => ({ ...c, answers: { ...c.answers, [selected]: i } })); }} />{option}</label>)}</fieldset>
        {incorrect && <p role="alert">Пока неверно. {lesson.explanation} Попробуйте ещё раз.</p>}
        <div className="course-controls"><button onClick={() => setStep(1)}>Назад</button><button className="course-primary" disabled={answer === undefined || answer < 0} onClick={submit}>Проверить ответ</button></div>
      </> : <><p>Тест пройден. {lesson.explanation}</p><p>Награда за этот урок: 50 финкоинов. При повторном прохождении она не начисляется.</p><div className="course-controls"><button onClick={() => { app.setCourse(c => ({ ...c, steps: { ...c.steps, [selected]: 0 }, quizAttempts: { ...c.quizAttempts, [selected]: 0 }, answers: { ...c.answers, [selected]: -1 } })); }}>Повторить урок</button><button className="course-primary" onClick={() => setSelected(null)}>К урокам</button></div></>}
    </div> }} onClose={() => { setSelected(null); setIncorrect(false); }} />
  </div>;
}
