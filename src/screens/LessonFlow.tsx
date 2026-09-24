import { useEffect, useRef } from 'react';
import { useApp } from '../state/AppState';
import { lesson1 } from '../lib/lesson1';
import { Checklist, IntroCard, LessonHeader, LessonIllustration, LessonInfoCard, PrimaryButton } from '../components/lesson/LessonUI';
import './LessonFlow.css';

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
  const screen = lesson1.screens[step];
  return <div className={`lesson-flow lf-step-${step}`}>
    <LessonHeader back={() => step ? setStep(step - 1) : app.back()} progress={step / (lesson1.screens.length - 1)} balance={app.course.coins}/>
    <div className="lf-content" ref={content}>
      <div className="lf-step-content" key={step}>
        <span className="lf-badge">{screen.badge}</span><h1>{screen.title}</h1><p className="lf-subtitle">{screen.text}</p>
        <LessonIllustration visual={screen.visual}/>
        {screen.visual === 'intro' && <IntroCard/>}
        {screen.visual === 'risk' && <LessonInfoCard warning>Инвестируйте осознанно<br/>и учитывайте свой<br/>уровень риска.</LessonInfoCard>}
        {'items' in screen && <><h2 className="lf-list-title">Инвестиции могут помочь вам:</h2><Checklist items={screen.items}/></>}
      </div>
    </div>
    <footer className="lf-footer"><PrimaryButton onClick={() => setStep(step + 1)} disabled={step === lesson1.screens.length - 1}>{step === 0 ? 'Начать урок' : 'Далее'}</PrimaryButton></footer>
  </div>;
}
