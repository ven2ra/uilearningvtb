import welcome from '../assets/lesson/welcome.webp';
import warning from '../assets/lesson/warning.webp';
import decor from '../assets/lesson/decor.webp';
import crystalRobot from '../assets/lesson/crystal-robot.webp';
import coin from '../assets/lesson/coin.webp';
import bulb from '../assets/lesson/bulb.webp';
import basketToday from '../assets/lesson/basket-today.webp';
import basketFuture from '../assets/lesson/basket-future.webp';
import coins from '../assets/lesson/coins.webp';
import chart from '../assets/lesson/chart.webp';
import pie from '../assets/lesson/pie.webp';
import growth from '../assets/lesson/compound-growth.webp';
import trophy from '../assets/lesson/quiz-trophy.webp';
import type { LessonVisual } from './lesson1';

export const lessonAssets = { welcome, warning, decor, crystalRobot, coin, bulb, basketToday, basketFuture, coins, chart, pie, growth, trophy };
const byVisual: Record<LessonVisual, string[]> = {
  intro: [welcome, decor, coin], crystal: [crystalRobot, decor, coin],
  inflation: [basketToday, basketFuture, bulb], instruments: [coins, chart, pie], risk: [warning, decor, coin],
  growth: [growth], example: [], compound: [], summary: [], 'quiz-intro': [trophy, coin],
};
// One small, bounded cache for this lesson; retain decoded images for Back/Next.
const decoded = new Map<string, { image: HTMLImageElement; ready: Promise<void> }>();
function loadImage(src: string, priority: 'high' | 'low'): Promise<void> {
  const existing = decoded.get(src);
  if (existing) { if (priority === 'high') existing.image.fetchPriority = priority; return existing.ready; }
  const image = new Image();
  image.fetchPriority = priority;
  image.decoding = 'async';
  image.src = src;
  const ready = image.decode().catch(() => { decoded.delete(src); });
  decoded.set(src, { image, ready });
  return ready;
}
export async function preloadLessonStep(visual: LessonVisual, priority: 'high' | 'low' = 'low') {
  await Promise.all([coin, ...byVisual[visual]].map(src => loadImage(src, priority)));
}
