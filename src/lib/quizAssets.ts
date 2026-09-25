import { lessonAssets } from './lessonAssets';
import wrong from '../assets/quiz/wrong.webp';
import checking from '../assets/quiz/checking.webp';
export const quizAssets = { success: lessonAssets.crystalRobot, wrong, checking, result: lessonAssets.trophy };
const images = new Map<string, Promise<void>>();
export function preloadQuizArt(...sources: string[]) {
  return Promise.all(sources.map(src => {
    if (!images.has(src)) {
      const image = new Image(); image.decoding = 'async'; image.fetchPriority = 'low'; image.src = src;
      images.set(src, image.decode().catch(() => { images.delete(src); }));
    }
    return images.get(src);
  }));
}
