import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
export function passwordGate(password: string): Plugin {
  const sessions = new Map<string, number>();
  const html = (error = false) => `<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Вход в прототип</title><style>*{box-sizing:border-box}body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#f0f5fc;font:16px system-ui;color:#0b1d36;padding:24px}form{width:100%;max-width:380px;background:white;border-radius:24px;padding:32px;box-shadow:0 16px 60px #12345612}h1{font-size:26px}p{color:#6c7890}label{display:block;margin-top:24px}input,button{width:100%;font:inherit;border-radius:12px;padding:14px;margin-top:10px}input{border:1px solid #ccd7e6}button{border:0;background:#06f;color:white;cursor:pointer}.error{color:#b42318}</style><form method="post" action="/__preview_login"><h1>Вход в прототип</h1><p>Введите пароль для доступа.</p><label for="password">Пароль</label><input id="password" name="password" type="password" autocomplete="current-password" required autofocus maxlength="256">${error ? '<p class="error" role="alert">Неверный пароль. Попробуйте ещё раз.</p>' : ''}<button>Войти</button></form></html>`;
  const middleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!password) { res.writeHead(503); res.end('Set PREVIEW_PASSWORD in .env.local'); return; }
    const now = Date.now();
    for (const [key, expires] of sessions) if (expires <= now) sessions.delete(key);
    const token = req.headers.cookie?.split(';').map(v => v.trim()).find(v => v.startsWith('vtb_preview_session='))?.slice(20);
    if (token && sessions.has(token)) { next(); return; }
    res.setHeader('Cache-Control', 'no-store');
    const show = (error = false) => { res.writeHead(error ? 401 : 200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(html(error)); };
    if (req.url === '/__preview_login' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; if (body.length > 2048) req.destroy(); });
      req.on('end', () => {
        const supplied = Buffer.from(new URLSearchParams(body).get('password') || '');
        const expected = Buffer.from(password);
        if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) { show(true); return; }
        const session = randomBytes(32).toString('hex');
        sessions.set(session, now + 28800000);
        res.writeHead(303, { Location: '/', 'Set-Cookie': `vtb_preview_session=${session}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800` }); res.end();
      }); return;
    }
    show();
  };
  return { name: 'temporary-password-gate', configureServer(server) { server.middlewares.use(middleware); }, configurePreviewServer(server) { server.middlewares.use(middleware); } };
}
