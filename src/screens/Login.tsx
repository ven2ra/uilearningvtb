import { useState, type InputHTMLAttributes, type KeyboardEvent } from "react";
import Icon from "../ui/Icons";
import { Button, cx } from "../ui/kit";

function Field({ label, ...rest }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="rounded-m bg-muted px-4 pb-2 pt-2.5">
      <label className="block text-[12px] leading-4 text-ink-3">{label}</label>
      <input {...rest} className="mt-0.5 h-6 w-full bg-transparent text-[16px] leading-5 text-ink outline-none placeholder:text-ink-4" />
    </div>
  );
}

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const onEnter = (e: KeyboardEvent) => e.key === "Enter" && onLogin();

  return (
    <div className="flex flex-1 flex-col px-5 pb-6 pt-12">
      <div className="mb-10 text-center text-[22px] font-extrabold tracking-tight text-ink">ВТБ Мои Инвестиции</div>

      <div className="flex flex-col gap-3">
        <Field label="Телефон или логин" type="text" placeholder="+7 (___) ___-__-__" value={login} onChange={(e) => setLogin(e.target.value)} onKeyDown={onEnter} autoComplete="username" />

        <div className="rounded-m bg-muted px-4 pb-2 pt-2.5">
          <label className="block text-[12px] leading-4 text-ink-3">Пароль</label>
          <div className="mt-0.5 flex items-center gap-2">
            <input
              type={visible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={onEnter}
              autoComplete="current-password"
              className="h-6 min-w-0 flex-1 bg-transparent text-[16px] leading-5 text-ink outline-none"
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="flex h-6 w-6 shrink-0 items-center justify-center text-ink-3 cursor-pointer"
              aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
            >
              <Icon name={visible ? "eyeOff" : "eye"} size={20} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setHint("Восстановление пароля не входит в сценарий прототипа")}
          className="self-start py-1 text-[14px] font-medium text-accent-text cursor-pointer"
        >
          Создать или изменить пароль
        </button>

        <div className={cx("flex flex-col gap-2", !hint && "mt-1")}>
          {hint && <div className="mb-1 text-[12px] leading-4 text-ink-3">{hint}</div>}
          <Button full onClick={onLogin}>
            Войти
          </Button>
          <Button full variant="secondary" onClick={() => setHint("Открытие брокерского счёта не входит в сценарий прототипа")}>
            Открыть брокерский счёт
          </Button>
        </div>
      </div>

      <p className="mt-auto pt-8 text-center text-[11px] leading-4 text-ink-3">Демонстрационный UI-прототип. Данные никуда не отправляются.</p>
    </div>
  );
}
