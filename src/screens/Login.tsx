import { useState } from "react";
import vtbLogo from "../assets/vtb-logo.svg";

// Экран входа — точная копия макета vtb_login_ui_centered.html: разметка, классы
// и стили воспроизведены как есть, только «Войти» вместо alert() входит в приложение.
const STYLE = `
  .vtb-login, .vtb-login * { box-sizing: border-box; }
  .vtb-login {
    flex: 1;
    min-height: 0;
    display: flex;
    justify-content: center;
    background: #fff;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    color: #18191c;
    -webkit-font-smoothing: antialiased;
  }
  .vtb-login .app {
    width: 100%;
    max-width: 700px;
    min-height: 100%;
    padding: 24px 16px 32px;
    display: flex;
    flex-direction: column;
  }
  .vtb-login .brand-logo { width: 210px; height: auto; display: flex; align-items: center; }
  .vtb-login .brand-logo img { display: block; width: 100%; height: auto; }
  .vtb-login .brand { height: 68px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
  .vtb-login .form { width: 100%; display: flex; flex-direction: column; gap: 12px; }
  .vtb-login .field { min-height: 62px; border-radius: 12px; background: #f5f5f7; padding: 10px 16px 8px; }
  .vtb-login .field label { display: block; color: #75767f; font-size: 12px; line-height: 16px; margin-bottom: 3px; }
  .vtb-login .field input {
    width: 100%; height: 26px; border: 0; outline: 0; padding: 0; background: transparent; color: #18191c;
    font: 400 16px/20px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .vtb-login .field input::placeholder { color: #b2b2b7; }
  .vtb-login .password-row { display: flex; align-items: center; gap: 10px; min-height: 26px; position: relative; }
  .vtb-login .password-row input { flex: 1; }
  .vtb-login .eye {
    width: 28px; height: 28px; flex: 0 0 28px; align-self: center; border: 0; background: transparent;
    color: #75767f; cursor: pointer; padding: 2px; display: grid; place-items: center;
  }
  .vtb-login .link {
    appearance: none; border: 0; background: transparent; color: #007aff; padding: 0;
    font: 500 14px/18px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    text-align: left; cursor: pointer; align-self: flex-start; margin: 4px 0 12px;
  }
  .vtb-login .primary, .vtb-login .secondary {
    min-height: 48px; border-radius: 12px; font: 500 16px/20px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    cursor: pointer;
  }
  .vtb-login .primary { border: 0; background: #007aff; color: #fff; }
  .vtb-login .primary:active { transform: translateY(1px); }
  .vtb-login .secondary { margin-top: 8px; border: 0; background: #f1f1f8; color: #007aff; }
  .vtb-login .note { margin-top: auto; padding-top: 28px; color: #8d8e96; font-size: 11px; line-height: 15px; text-align: center; }
`;

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="vtb-login">
      <style>{STYLE}</style>
      <section className="app" aria-label="Экран входа">
        <header className="brand" aria-label="ВТБ Мои Инвестиции">
          <div className="brand-logo">
            <img src={vtbLogo} alt="ВТБ Мои Инвестиции" />
          </div>
        </header>

        <form
          className="form"
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            onLogin();
          }}
        >
          <div className="field">
            <label htmlFor="login">Телефон или логин</label>
            <input id="login" type="text" placeholder="+7 (___) ___-__-__" />
          </div>

          <div className="field">
            <label htmlFor="password">Пароль</label>
            <div className="password-row">
              <input id="password" type={visible ? "text" : "password"} />
              <button type="button" className="eye" onClick={() => setVisible((v) => !v)} aria-label={visible ? "Скрыть пароль" : "Показать пароль"}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="1.7" />
                  <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
                </svg>
              </button>
            </div>
          </div>

          <button type="button" className="link">
            Создать или изменить пароль
          </button>
          <button type="submit" className="primary">
            Войти
          </button>
          <button type="button" className="secondary">
            Открыть брокерский счет
          </button>
        </form>

        <div className="note">Демонстрационный UI-прототип. Данные никуда не отправляются.</div>
      </section>
    </div>
  );
}
