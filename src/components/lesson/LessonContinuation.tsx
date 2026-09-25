import Icon, { type IconName } from '../../ui/Icons';
import { lessonAssets } from '../../lib/lessonAssets';

interface GrowthComparisonProps { startAmount: string; endAmount: string; startPeriod: string; endPeriod: string; growth: string }
export function GrowthComparison({startAmount,endAmount,startPeriod,endPeriod,growth}:GrowthComparisonProps) {
  return <div className="lf-growth-comparison" role="img" aria-label={`${startAmount}, рост ${growth}, ${endAmount}`}>
    <div className="lf-growth-bar first"><strong>{startAmount}</strong><div/><span>{startPeriod}</span></div>
    <div className="lf-growth-arrow"><b>{growth}</b><svg viewBox="0 0 85 65" aria-hidden="true"><path d="M4 55Q34 15 76 19M63 8l14 11-13 11" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
    <div className="lf-growth-bar last"><strong>{endAmount}</strong><div/><span>{endPeriod || '\u00a0'}</span></div>
  </div>;
}
const summary: {icon:IconName; text:string}[] = [
  {icon:'bulb',text:'Помогают защитить деньги\nот инфляции'},
  {icon:'market',text:'Позволяют создавать капитал\nв долгосрочной перспективе'},
  {icon:'briefcase',text:'Подходят для разных целей'},
  {icon:'shield',text:'Связаны с риском,\nно открывают больше\nвозможностей'},
];
export function LessonSummary(){return <ul className="lf-summary-card">{summary.map(item=><li key={item.icon}><span><Icon name={item.icon} size={29}/></span><p>{item.text}</p></li>)}</ul>}
export function QuizInfoCards(){return <div className="lf-quiz-info"><div><Icon name="file" size={34}/><p>5 вопросов</p></div><div><Icon name="clock" size={34}/><p>2–3 минуты</p></div><div><img src={lessonAssets.coin} width="38" height="38" alt=""/><p><strong>+50</strong><br/>финкоинов</p></div></div>}
