import TrainingLogo from "./TrainingLogo";
import "./TrainingBanner.css";

export default function TrainingBanner({ onStart, onLater }: { onStart: () => void; onLater: () => void }) {
  return <div className="welcome-learning-banner">
    <div className="welcome-learning-copy">
      <h2>Добро пожаловать<br />в <span>ВТБ Мои Инвестиции!</span></h2>
      <p>Покажем, где что находится<br />и как пользоваться сервисом.</p>
      <div className="welcome-learning-actions"><button onClick={onStart}>Начать обучение <span aria-hidden="true">→</span></button><button onClick={onLater}>Позже</button></div>
    </div>
    <TrainingLogo className="welcome-learning-art" />
  </div>;
}
