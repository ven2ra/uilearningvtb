import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppState';
import { freshQuiz, quizQuestions, submitQuizAnswer, type QuizProgress } from '../lib/quiz1';
import { preloadQuizArt, quizAssets } from '../lib/quizAssets';
import { LessonHeader, PrimaryButton } from '../components/lesson/LessonUI';
import { AnswerOption, CheckingIndicator, ExplanationCard, QuizReward, QuizRobot, ResultStats } from '../components/lesson/QuizUI';
import './QuizFlow.css';

export default function QuizFlow() {
  const app = useApp(); const quiz = app.course.quiz1!; const [busy, setBusy] = useState(false); const guard = useRef(false); const live = useRef(true); const content = useRef<HTMLDivElement>(null);
  const update = (fn: (previous: QuizProgress) => QuizProgress) => app.setCourse(course => course.quiz1 ? { ...course, quiz1: fn(course.quiz1) } : course);
  useEffect(() => { live.current = true; return () => { live.current = false; }; }, []);
  useEffect(() => { content.current?.scrollTo(0,0); }, [quiz.phase, quiz.currentQuestion, quiz.reviewIndex]);
  useEffect(() => {
    if (quiz.phase === 'question') { void preloadQuizArt(quizAssets.success, quizAssets.wrong); if (quiz.currentQuestion === 4) void preloadQuizArt(quizAssets.checking); }
    if (quiz.phase === 'checking') void preloadQuizArt(quizAssets.result);
    if (quiz.phase === 'feedback' && quiz.currentQuestion === 4) void preloadQuizArt(quizAssets.checking);
  }, [quiz.phase, quiz.currentQuestion]);
  useEffect(() => {
    if (!['question','feedback'].includes(quiz.phase)) return;
    const timer = setInterval(() => { if (!document.hidden) app.setCourse(course => course.quiz1?.active && ['question','feedback'].includes(course.quiz1.phase) ? { ...course, quiz1: { ...course.quiz1, seconds: course.quiz1.seconds + 1 } } : course); },1000);
    return () => clearInterval(timer);
  }, [quiz.phase, app.setCourse]);
  useEffect(() => {
    if (quiz.phase !== 'checking') return;
    const timer = setTimeout(() => app.setCourse(course => {
      const state = course.quiz1; if (!state || state.phase !== 'checking') return course;
      const score = state.correctAnswers.length / quizQuestions.length * 100;
      return { ...course, quiz1: { ...state, phase: 'result' }, completed: score >= 80 ? Math.max(1, course.completed) : course.completed,
        quizResults: { ...course.quizResults, 0: { score: Math.max(course.quizResults?.[0]?.score ?? 0, score), attempts: state.attempt, completedAt: Date.now() } } };
    }), Math.max(0, 1800 - (Date.now() - (quiz.checkingAt ?? Date.now()))));
    return () => clearTimeout(timer);
  }, [quiz.phase, quiz.checkingAt, app.setCourse]);
  const question = quizQuestions[quiz.currentQuestion]; const reviewQuestion = quizQuestions.find(q => q.id === quiz.wrongAnswers[quiz.reviewIndex]);
  const correct = quiz.answers[question.id] === question.correctAnswer; const answered = quiz.answers[question.id] !== undefined; const score = quiz.correctAnswers.length * 20;
  async function submit() {
    if (guard.current || quiz.selectedAnswer === null) return; guard.current = true; setBusy(true);
    await preloadQuizArt(quiz.selectedAnswer === question.correctAnswer ? quizAssets.success : quizAssets.wrong);
    if (live.current) { app.setCourse(course => { if (!course.quiz1) return course; const result = submitQuizAnswer(course.quiz1); return { ...course, quiz1: result.quiz, coins: course.coins + result.reward }; }); setBusy(false); }
    guard.current = false;
  }
  function back() {
    if (busy) return;
    if (quiz.phase === 'review') { update(q=>({...q,phase:'result'})); return; }
    if (quiz.phase === 'feedback') { update(q=>({...q,phase:'question'})); return; }
    if (quiz.phase === 'question' && quiz.currentQuestion > 0) { update(q=>{const index=q.currentQuestion-1;return {...q,currentQuestion:index,phase:'question',selectedAnswer:q.answers[quizQuestions[index].id]??null};}); return; }
    update(q=>({...q,active:false}));
  }
  function next() { update(q=> q.currentQuestion === quizQuestions.length-1 ? {...q,phase:'checking',checkingAt:Date.now()} : {...q,currentQuestion:q.currentQuestion+1,phase:'question',selectedAnswer:q.answers[quizQuestions[q.currentQuestion+1].id]??null}); }
  function continueLearning() { update(q=>({...q,active:false})); app.tab('learning-path'); }
  return <section className={`quiz-flow quiz-phase-${quiz.phase}`}>
    <LessonHeader back={back} progress={['result','review','checking'].includes(quiz.phase)?1:quiz.currentQuestion/5} balance={app.course.coins}/>
    <div className="quiz-content" ref={content}>
      {quiz.phase === 'question' && <><span className="quiz-badge">Вопрос {quiz.currentQuestion+1} из {quizQuestions.length}</span><h1>{question.question}</h1><div className="quiz-options" role="radiogroup" aria-label={question.question}>{question.answers.map((answer,index)=><AnswerOption key={answer} label={answer} selected={quiz.selectedAnswer===index} disabled={busy||answered} onClick={()=>update(q=>({...q,selectedAnswer:index}))}/>)}</div>{answered && <p className="quiz-note">Ответ сохранён</p>}</>}
      {quiz.phase === 'feedback' && <><QuizRobot pose={correct?'success':'wrong'}/><h1 className="quiz-centered">{correct?'Отлично!':'Почти!'}</h1><p className="quiz-subtitle">{correct?'Вы правильно ответили.':'Это неверный ответ.'}</p>{correct ? <><QuizReward amount={quiz.earnedIds.includes(question.id) ? question.reward : 0}/><p className="quiz-note">Награда за вопрос начисляется один раз.</p></> : <ExplanationCard question={question}/>}</>}
      {quiz.phase === 'checking' && <><QuizRobot pose="checking"/><h1 className="quiz-centered">Проверяем<br/>ваши ответы...</h1><p className="quiz-subtitle">Это займет несколько секунд</p><CheckingIndicator/></>}
      {quiz.phase === 'result' && <><QuizRobot pose="result"/><h1 className="quiz-centered">{score>=80?'Отлично!':'Продолжайте практиковаться'}</h1><p className="quiz-subtitle">Вы правильно ответили<br/>на {quiz.correctAnswers.length} из {quizQuestions.length} вопросов</p><ResultStats seconds={quiz.seconds} score={score} coins={quiz.coinsEarned}/>{score<80&&<p className="quiz-note">Для открытия следующего урока нужно 80%. Разберите ошибки и попробуйте ещё раз.</p>}</>}
      {quiz.phase === 'review' && reviewQuestion && <><span className="quiz-badge">Разбор ошибок · {quiz.reviewIndex+1} из {quiz.wrongAnswers.length}</span><h1>{reviewQuestion.question}</h1><p className="quiz-review-answer">Ваш ответ: {reviewQuestion.answers[quiz.answers[reviewQuestion.id]]}</p><ExplanationCard question={reviewQuestion}/></>}
    </div>
    <footer className="quiz-footer">
      {quiz.phase==='question'&&<PrimaryButton disabled={quiz.selectedAnswer===null||busy} onClick={()=>void submit()}>{busy?'Подготавливаем ответ…':'Далее'}</PrimaryButton>}
      {quiz.phase==='feedback'&&<PrimaryButton onClick={next}>Далее</PrimaryButton>}
      {quiz.phase==='result'&&<><PrimaryButton onClick={score>=80?continueLearning:()=>update(q=>freshQuiz(q))}>{score>=80?'Продолжить обучение':'Попробовать снова'}</PrimaryButton>{quiz.wrongAnswers.length>0&&<button className="quiz-secondary" onClick={()=>update(q=>({...q,phase:'review',reviewIndex:0}))}>Разобрать ошибки</button>}</>}
      {quiz.phase==='review'&&<PrimaryButton onClick={()=>update(q=>q.reviewIndex+1<q.wrongAnswers.length?{...q,reviewIndex:q.reviewIndex+1}:{...q,phase:'result'})}>{quiz.reviewIndex+1<quiz.wrongAnswers.length?'Далее':'К результату'}</PrimaryButton>}
    </footer>
  </section>;
}
