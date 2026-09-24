import Icon from "../../ui/Icons";
import FinkoinIcon from "../finkoin/FinkoinIcon";
export default function AchievementStats({ completed, total, coins }: { completed: number; total: number; coins: number }) {
  return <section className="achievement-stats" aria-label="Статистика достижений" data-tour="ach-summary">
    <div><span><Icon name="trophy" size={18}/><strong>{completed}</strong></span><small>Получено достижений</small></div>
    <div><span><Icon name="lock" size={18}/><strong>{total - completed}</strong></span><small>Ещё можно получить</small></div>
    <div><span><FinkoinIcon/><strong>{coins}</strong></span><small>Всего финкоинов</small></div>
  </section>;
}
