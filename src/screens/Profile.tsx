import { useState } from "react";
import { useApp } from "../state/AppState";
import { ACHIEVEMENTS } from "../lib/achievements";
import Icon, { type IconName } from "../ui/Icons";
import { Button, Page, TopBar } from "../ui/kit";
import DetailSheet, { type Detail } from "../components/home/DetailSheet";
import { LearningCard } from "../components/learning/HomeLearning";

export default function Profile() {
  const app = useApp();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [notifications, setNotifications] = useState(true);
  return (
    <>
      <TopBar back title="Профиль" />
      <Page className="profile-page">
        <section className="reference-card profile-identity">
          <span>АК</span>
          <div>
            <h1>Анна К.</h1>
            <p>Брокерский счёт ···4821</p>
          </div>
        </section>
        <section className="mt-3 overflow-hidden rounded-l bg-surface">
          <ProfileRow
            icon="user"
            title="Личные данные"
            subtitle="Данные профиля"
            onClick={() =>
              setDetail({
                title: "Личные данные",
                body: (
                  <>
                    <h3>Анна К.</h3>
                    <p>Брокерский счёт ···4821</p>
                    <p className="reference-muted">
                      Тестовый профиль приложения.
                    </p>
                  </>
                ),
              })
            }
          />
          <ProfileRow
            icon="wallet"
            title="Мои счета"
            subtitle={
              app.mode === "training"
                ? "Учебный счёт · виртуальные средства"
                : "Брокерский счёт ···4821"
            }
            onClick={() => app.go("portfolio")}
          />
          <ProfileRow
            icon="file"
            title="Отчёты и справки"
            subtitle="Заказать и скачать документы"
            onClick={() => app.go("documents")}
          />
          <ProfileRow
            icon="shield"
            title="Безопасность"
            subtitle="Код входа и биометрия"
            onClick={() =>
              setDetail({
                title: "Безопасность",
                body: (
                  <p>
                    В этой версии прототипа код входа и биометрия не подключены.
                  </p>
                ),
              })
            }
          />
        </section>
        <section className="reference-card mt-3">
          <h2 className="text-[18px] font-medium">Настройки</h2>
          <label className="mt-4 flex items-center justify-between gap-3">
            <span>Уведомления приложения</span>
            <input
              type="checkbox"
              role="switch"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              aria-label="Уведомления приложения"
            />
          </label>
          <p className="reference-muted mt-2">
            Настройка действует в текущем сеансе.
          </p>
        </section>
        <section className="reference-card mt-3">
          <div className="flex items-center gap-3">
            <Icon name="trophy" size={28} />
            <div>
              <h2 className="text-[18px] font-medium">Ваш прогресс</h2>
              <p className="reference-muted">
                {app.achievements.length} из {ACHIEVEMENTS.length} достижений ·{" "}
                {app.doneStages} из 7 этапов
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => app.go("achievements")}
          >
            Смотреть достижения
          </Button>
        </section>
        {app.mode === "real" && <LearningCard />}
        <button
          className="reference-bond-row text-accent"
          onClick={() => {
            app.tab("home");
            app.setOnboarding("running");
          }}
        >
          Пройти знакомство с приложением заново
        </button>
      </Page>
      <DetailSheet detail={detail} onClose={() => setDetail(null)} />
    </>
  );
}
function ProfileRow({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-line-subtle px-4 py-4 text-left last:border-0"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-m bg-accent-subtle text-accent-text">
        <Icon name={icon} size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-medium">{title}</span>
        <span className="block text-[13px] text-ink-2">{subtitle}</span>
      </span>
      <Icon name="chevronRight" size={20} className="text-ink-3" />
    </button>
  );
}
