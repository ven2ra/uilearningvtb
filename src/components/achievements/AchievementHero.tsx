import MascotWinner from "./MascotWinner";
export default function AchievementHero({ celebrationKey }: { celebrationKey?: number }) {
  return <header className="achievement-hero"><div className="achievement-hero-copy"><h1>Достижения</h1><p>Проходите уроки, выполняйте задания<br/>и получайте награды.</p></div><MascotWinner celebrationKey={celebrationKey}/></header>;
}
