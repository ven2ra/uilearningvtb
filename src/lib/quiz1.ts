export const quizQuestions = [
  { id: 'inflation', question: 'Что происходит из-за инфляции?', answers: ['Деньги со временем теряют покупательную способность', 'Деньги становятся дороже', 'Можно купить больше товаров', 'Курс валюты всегда растет'], correctAnswer: 0, explanation: 'Инфляция означает рост цен: со временем на одну и ту же сумму можно купить меньше товаров и услуг.', reward: 10 },
  { id: 'compound', question: 'Как называется доход, который начинает приносить новый доход?', answers: ['Простой процент', 'Сложный процент', 'Фиксированный доход', 'Налоговый вычет'], correctAnswer: 1, explanation: 'Сложный процент — это доход, который начинает приносить новый доход. Со временем сумма растет быстрее, потому что проценты начисляются на уже увеличенную сумму.', reward: 10 },
  { id: 'goals', question: 'Для чего могут использоваться инвестиции?', answers: ['Только для торговли', 'Для потенциального сохранения и увеличения капитала', 'Для гарантированной прибыли', 'Только для покупки акций'], correctAnswer: 1, explanation: 'Инвестиции могут помочь сохранить и увеличить капитал, накопить на цель или создать дополнительный источник дохода. Прибыль не гарантирована.', reward: 10 },
  { id: 'risk', question: 'Что важно помнить об инвестициях?', answers: ['Доход всегда гарантирован', 'Стоимость активов никогда не снижается', 'Инвестиции связаны с риском', 'Риск существует только у акций'], correctAnswer: 2, explanation: 'Стоимость активов может как расти, так и снижаться. Инвестиции связаны с риском — важно учитывать свой уровень риска.', reward: 10 },
  { id: 'time', question: 'Почему время важно для инвестирования?', answers: ['Потенциальный доход может накапливаться', 'Через год инвестиции становятся безрисковыми', 'Рынок обязательно растет каждый год', 'Время гарантирует прибыль'], correctAnswer: 0, explanation: 'На длинном горизонте реинвестированный доход может приносить новый доход. Но время само по себе не гарантирует прибыль и не устраняет риск.', reward: 10 },
] as const;
export type QuizPhase = 'question' | 'feedback' | 'checking' | 'result' | 'review';
export interface QuizProgress {
  active: boolean; phase: QuizPhase; currentQuestion: number; selectedAnswer: number | null;
  answers: Record<string, number>; rewardedIds: string[]; correctAnswers: string[]; wrongAnswers: string[];
  coinsEarned: number; seconds: number; attempt: number; checkingAt?: number; reviewIndex: number; earnedIds: string[];
}
export function freshQuiz(previous?: QuizProgress): QuizProgress {
  return { active: true, phase: 'question', currentQuestion: 0, selectedAnswer: null, answers: {}, rewardedIds: previous?.rewardedIds ?? [], earnedIds: [], correctAnswers: [], wrongAnswers: [], coinsEarned: 0, seconds: 0, attempt: (previous?.attempt ?? 0) + 1, reviewIndex: 0 };
}
/** One transaction records the answer and the lifetime reward entitlement. */
export function submitQuizAnswer(quiz: QuizProgress): { quiz: QuizProgress; reward: number } {
  const question = quizQuestions[quiz.currentQuestion];
  if (quiz.phase !== 'question' || !question || quiz.selectedAnswer === null || quiz.selectedAnswer < 0 || quiz.selectedAnswer >= question.answers.length) return { quiz, reward: 0 };
  if (quiz.answers[question.id] !== undefined) return { quiz: { ...quiz, phase: 'feedback' }, reward: 0 };
  const correct = quiz.selectedAnswer === question.correctAnswer;
  const reward = correct && !quiz.rewardedIds.includes(question.id) ? question.reward : 0;
  return { quiz: { ...quiz, phase: 'feedback', answers: { ...quiz.answers, [question.id]: quiz.selectedAnswer },
    correctAnswers: correct ? [...quiz.correctAnswers, question.id] : quiz.correctAnswers,
    wrongAnswers: correct ? quiz.wrongAnswers : [...quiz.wrongAnswers, question.id],
    rewardedIds: reward ? [...quiz.rewardedIds, question.id] : quiz.rewardedIds, earnedIds: reward ? [...quiz.earnedIds, question.id] : quiz.earnedIds, coinsEarned: quiz.coinsEarned + reward }, reward };
}
