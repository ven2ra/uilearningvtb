import type { ReactNode } from 'react';
import coin from '../../assets/finkoin/crystal.png';
import crystalRobot from '../../assets/finkoin/mascot-coin.png';
import bulb from '../../assets/achievements/bulb.png';
import AchievementIcon from '../achievements/AchievementIcon';
import Icon from '../../ui/Icons';
import type { LessonVisual } from '../../lib/lesson1';

export function LessonHeader({ back, progress, balance }: { back: () => void; progress: number; balance: number }) {
  return <header className="lf-header"><button className="lf-back" onClick={back} aria-label="Назад"><Icon name="chevronLeft" size={24}/></button><div className="lf-progress" role="progressbar" aria-label="Прогресс урока" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}><span style={{ width: `${progress * 100}%` }}/>{[0,1,2,3,4].map(i => <i key={i} className={progress >= i / 4 ? 'filled' : ''}/>)}</div><span className="lf-balance"><img src={coin} alt="Финкоины"/>{balance}</span></header>;
}
export function PrimaryButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) { return <button className="lf-primary" onClick={onClick} disabled={disabled}>{children}<Icon name="chevronRight" size={24}/></button>; }
export function LessonInfoCard({ children, warning = false }: { children: ReactNode; warning?: boolean }) { return <aside className={`lf-info ${warning ? 'warning' : ''}`}>{warning ? <span className="lf-warning-icon">!</span> : <img src={bulb} alt=""/>}<p>{children}</p></aside>; }
export function Checklist({ items }: { items: readonly string[] }) { return <ul className="lf-checklist">{items.map(item => <li key={item}><span aria-hidden="true"><Icon name="check" size={20}/></span>{item}</li>)}</ul>; }
function BookIcon(){return <svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M3 6q6-5 12 0v24q-6-5-12 0zm14 0q6-5 12 0v24q-6-5-12 0z"/><path d="M7 10h4m-4 5h4m-4 5h4m10-10h4m-4 5h4m-4 5h4" stroke="white" strokeWidth="1.4"/></svg>}
function BarsIcon(){return <svg viewBox="0 0 32 32" aria-hidden="true"><rect fill="currentColor" x="2" y="18" width="8" height="13" rx="2"/><rect fill="currentColor" x="12" y="10" width="8" height="21" rx="2"/><rect fill="currentColor" x="22" y="2" width="8" height="29" rx="2"/></svg>}
export function IntroCard(){return <div className="lf-intro-card"><p><BookIcon/><span>Короткий урок<br/>3–5 минут</span></p><p><BarsIcon/><span>Простые примеры</span></p><p><Icon name="help" size={34}/><span>Небольшой тест<br/>в конце</span></p></div>}
export function LessonIllustration({ visual }: { visual: LessonVisual }) {
  if (visual === 'inflation') return <><div className="lf-baskets"><div><b>Сегодня</b><img src="/lesson-assets/basket-today.png" alt="Полная корзина продуктов"/><strong>100 000 ₽</strong></div><span aria-hidden="true">→</span><div><b>Через несколько лет</b><img src="/lesson-assets/basket-future.png" alt="Меньше продуктов в корзине"/><strong>100 000 ₽</strong></div></div><LessonInfoCard>Это влияние инфляции: со временем на одну и ту же сумму можно приобрести меньше товаров и услуг.</LessonInfoCard></>;
  if (visual === 'instruments') return <div className="lf-instruments">{(['coins', 'chart', 'pie'] as const).map((name, i) => <div key={name}><div><AchievementIcon name={name}/></div><b>{['Облигации', 'Акции', 'Фонды'][i]}</b></div>)}</div>;
  return <div className={`lf-scene lf-scene-${visual}`}><img className="lf-decor" src="/lesson-assets/decor.png" alt=""/><img className="lf-robot" src={visual === 'crystal' ? crystalRobot : `/lesson-assets/${visual === 'risk' ? 'warning' : 'welcome'}.png`} alt="Маскот ФинКод"/><img className="lf-spark one" src={coin} alt=""/><img className="lf-spark two" src={coin} alt=""/></div>;
}
