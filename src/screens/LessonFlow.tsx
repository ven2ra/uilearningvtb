import { useEffect, useRef } from 'react';
import { useApp } from '../state/AppState';
import { lesson1 } from '../lib/lesson1';
import { Checklist, IntroCard, LessonHeader, LessonIllustration, LessonInfoCard, PrimaryButton } from '../components/lesson/LessonUI';
import './LessonFlow.css';
import { lessonAssets, preloadLessonStep } from '../lib/lessonAssets';
import { GrowthComparison, LessonSummary, QuizInfoCards } from '../components/lesson/LessonContinuation';
import QuizFlow from './QuizFlow';
import { freshQuiz } from '../lib/quiz1';

export default function LessonFlow() {
  const app = useApp();
  const step = Math.max(0, Math.min(lesson1.screens.length - 1, app.course.lessonScreenSteps?.[1] ?? 0));
  const content = useRef<HTMLDivElement>(null);
  const setStep = (value: number) => app.setCourse(c => ({ ...c, lessonScreenSteps: { ...c.lessonScreenSteps, 1: value } }));
  useEffect(() => {
    history.replaceState(null, '', '/learning/1');
    return () => { history.replaceState(null, '', '/'); };
  }, []);
  useEffect(() => {
    content.current?.scrollTo(0, 0);
    content.current?.closest('main')?.scrollTo(0, 0);
  }, [step]);
  useEffect(() => {
    let active = true;
    // Let the current artwork finish decoding before competing for bandwidth.
    void preloadLessonStep(lesson1.screens[step].visual, 'high').then(() => {
      const next = lesson1.screens[step + 1];
      if (active && next) void preloadLessonStep(next.visual);
    });
    return () => { active = false; };
  }, [step]);
  const screen = lesson1.screens[step];
  if (app.course.quiz1?.active) return <QuizFlow/>;
  return <div className={`lesson-flow lf-step-${step}`}>
    <LessonHeader back={() => step ? setStep(step - 1) : app.back()} progress={step / (lesson1.screens.length - 1)} balance={app.course.coins}/>
    <div className="lf-content" ref={content}>
      <div className="lf-step-content" key={step}>
        {screen.visual === 'quiz-intro' && <div className="lf-continuation-art lf-trophy-art"><img src={lessonAssets.trophy} alt="ФинКод с синим кубком" fetchPriority="high" decoding="async"/></div>}
        {'growth' in screen ? <div className="lf-example-card"><h1>{screen.title}</h1><p className="lf-subtitle">{screen.text}</p><GrowthComparison {...screen.growth}/></div> : <>
          {screen.badge && <span className="lf-badge">{screen.badge}</span>}<h1>{screen.title}</h1>{screen.text && <p className="lf-subtitle">{screen.text}</p>}
          {step < 5 && <LessonIllustration visual={screen.visual}/>}
        </>}
        {screen.visual === 'growth' && <div className="lf-continuation-art"><img src={lessonAssets.growth} alt="Растущие стопки монет с голубым ростком" fetchPriority="high" decoding="async"/></div>}
        {screen.visual === 'summary' && <LessonSummary/>}
        {screen.visual === 'quiz-intro' && <QuizInfoCards/>}
        {screen.visual === 'intro' && <IntroCard/>}
        {screen.visual === 'risk' && <LessonInfoCard warning>Инвестируйте осознанно<br/>и учитывайте свой<br/>уровень риска.</LessonInfoCard>}
        {'items' in screen && <><h2 className="lf-list-title">Инвестиции могут помочь вам:</h2><Checklist items={screen.items}/></>}
      </div>
    </div>
    <footer className="lf-footer"><PrimaryButton onClick={() => step === 9 ? app.setCourse(course => ({ ...course, quiz1: course.quiz1 ? { ...course.quiz1, active: true } : freshQuiz() })) : setStep(step + 1)}>{step === 0 ? 'Начать урок' : step === 9 ? 'Начать тест' : 'Далее'}</PrimaryButton></footer>
  </div>;
}
