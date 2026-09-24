export interface FinkoinReward { title: string; description: string; cost: number; icon: "book" | "percent" | "strategy" | "theme" | "gift" | "course"; image: FinkoinReward["icon"]; category: string; locked?: boolean }
export const finkoinRewards: FinkoinReward[] = [
  { title: "Премиум-урок", description: "Углубленный урок от экспертов", cost: 150, icon: "book", image: "book", category: "Обучение" },
  { title: "Скидка на комиссию", description: "-50% на 1 месяц", cost: 500, icon: "percent", image: "percent", category: "Бонусы" },
  { title: "Стратегии от экспертов", description: "Подборка готовых портфельных стратегий", cost: 800, icon: "strategy", image: "strategy", category: "Обучение", locked: true },
  { title: "Премиум-тема Crystal", description: "Новая тема оформления приложения", cost: 100, icon: "theme", image: "theme", category: "Дизайн" },
  { title: "Сюрприз", description: "Случайный полезный подарок", cost: 200, icon: "gift", image: "gift", category: "Бонусы" },
  { title: "Доступ к курсу", description: "Расширенный курс по инвестициям", cost: 600, icon: "course", image: "course", category: "Обучение" },
];
export const dayRewards = [10, 10, 15, 15, 20];
