import { useApp } from "../state/AppState";
import { ACHIEVEMENTS, ACH_GROUPS } from "../lib/achievements";
import { AchBadge } from "../ui/chrome";
import { fmtTime } from "../lib/format";
import Icon, { type IconName } from "../ui/Icons";
import { ProgressBar, TopBar, cx } from "../ui/kit";

// ================= Ещё =================
export function More() {
  const app = useApp();

  return (
    <>
      <TopBar title="Ещё" />
      <div className="px-4 pb-8">
        <section className="mt-4 flex items-center gap-3 rounded-l border border-line-subtle bg-surface p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-subtle text-[16px] font-bold text-brand">АК</div>
          <div className="flex-1">
            <div className="text-[16px] font-semibold">Анна К.</div>
            <div className="text-[13px] text-ink-2">Брокерский счёт ···4821</div>
          </div>
        </section>

        <div data-tour="more-learning" className="mt-3 overflow-hidden rounded-l border border-line-subtle bg-surface">
          <MoreRow icon="cap" title="Обучение инвестициям" sub="Уроки и ваш прогресс" onClick={() => app.go("learning-path")} />
          <MoreRow
            icon="help"
            title="Подсказки по приложению"
            sub="Пройти онбординг заново"
            onClick={() => {
              app.tab("home");
              app.setOnboarding("running");
            }}
          />
        </div>

        <div className="mt-3 overflow-hidden rounded-l border border-line-subtle bg-surface">
          <MoreRow icon="trophy" title="Мои достижения" sub={`Открыто ${app.achievements.length} из ${ACHIEVEMENTS.length}`} onClick={() => app.go("achievements")} />
          <MoreRow icon="user" title="Профиль" sub="Данные и документы" onClick={() => app.go("profile")} />
          <MoreRow icon="shield" title="Безопасность" sub="Код входа, биометрия" />
          <MoreRow icon="settings" title="Настройки" sub="Уведомления, внешний вид" />
          <MoreRow icon="chat" title="Чат с поддержкой" sub="Ответим за пару минут" />
        </div>



      </div>
    </>
  );
}

function MoreRow({ icon, title, sub, onClick, tone = "accent" }: { icon: IconName; title: string; sub: string; onClick?: () => void; tone?: "accent" | "training" }) {
  const app = useApp();
  return (
    <button
      type="button"
      onClick={onClick ?? (() => app.toast({ kind: "info", title, text: "Раздел не входит в сценарий прототипа" }))}
      className="flex w-full items-center gap-3 border-b border-line-subtle px-4 py-3 text-left last:border-0 cursor-pointer active:bg-surface-muted"
    >
      <span className={cx("flex h-10 w-10 items-center justify-center rounded-m", tone === "training" ? "bg-tr-surface text-tr border border-tr-border" : "bg-brand-subtle text-brand")}>
        <Icon name={icon} size={22} />
      </span>
      <span className="flex-1">
        <span className="block text-[15px] font-medium">{title}</span>
        <span className="block text-[13px] text-ink-2">{sub}</span>
      </span>
      <Icon name="chevronRight" size={20} className="text-ink-3" />
    </button>
  );
}

// ================= Мои достижения =================
export function Achievements() {
  const app = useApp();
  const got = app.achievements.length;
  return (
    <>
      <TopBar back={app.stack.length > 1} title="Мои достижения" />
      <div className="px-4 pb-8">
        <section data-tour="ach-summary" className="mt-4 rounded-l border border-tr-border bg-tr-surface p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-l bg-warning text-white">
              <Icon name="trophy" size={26} />
            </span>
            <div className="flex-1">
              <div className="num text-[24px] font-bold leading-8">
                {got} <span className="text-[15px] font-medium text-ink-2">из {ACHIEVEMENTS.length}</span>
              </div>
              <div className="text-[13px] text-ink-2">Почти за каждое первое действие — достижение</div>
            </div>
          </div>
          <ProgressBar value={got} max={ACHIEVEMENTS.length} tone="training" className="mt-3" />
        </section>

        <div data-tour="ach-grid">
          {ACH_GROUPS.map((g) => {
            const list = ACHIEVEMENTS.filter((a) => a.group === g);
            const n = list.filter((a) => app.has(a.id)).length;
            return (
              <section key={g}>
                <div className="mb-2 mt-6 flex items-center justify-between px-1">
                  <h2 className="text-[18px] font-semibold">{g}</h2>
                  <span className="num text-[13px] font-semibold text-ink-2">
                    {n}/{list.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {list.map((a) => {
                    const rec = app.achievements.find((x) => x.id === a.id);
                    return (
                      <div key={a.id} className={cx("flex flex-col items-center rounded-l border p-3 text-center", rec ? "border-tr-border bg-tr-surface" : "border-line-subtle bg-surface")}>
                        <AchBadge def={a} locked={!rec} size={52} />
                        <div className={cx("mt-2 text-[14px] font-semibold leading-5", !rec && "text-ink-2")}>{a.title}</div>
                        <div className="mt-0.5 text-[12px] leading-4 text-ink-2">{a.desc}</div>
                        <div className={cx("mt-1.5 text-[11px] font-semibold", rec ? "text-tr-text" : "text-ink-3")}>
                          {rec ? `Получено ${fmtTime(rec.ts)}` : a.mode === "training" ? "На фейковых торгах" : a.mode === "real" ? "В приложении" : "В любом режиме"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
