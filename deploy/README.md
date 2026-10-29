# Деплой

Один VPS: Docker, `app` (бэк + собранный фронт) и Caddy спереди (HTTPS через Let's Encrypt, вебсокеты из коробки).
Push в `test-server` → GitHub Actions: тесты → образ в GHCR → scp compose-файлов → `docker compose pull && up -d`.

## Первичная настройка сервера (один раз)

```bash
ssh root@<IP>
curl -fsSL https://get.docker.com | sh
adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy
mkdir -p /home/deploy/.ssh /home/deploy/drawga/data /home/deploy/drawga/saves
# сюда публичный ключ для CI (см. ниже)
nano /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy
chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys
```

Ключ для CI — отдельный, без пароля, на своей машине:
```bash
ssh-keygen -t ed25519 -f ~/.ssh/drawga_ci -N ""
cat ~/.ssh/drawga_ci.pub   # → в authorized_keys на сервере
cat ~/.ssh/drawga_ci       # → в секрет SSH_PRIVATE_KEY
```

## GitHub → Settings → Secrets and variables → Actions

Secrets:
- `SERVER_HOST` — IP сервера
- `SERVER_USER` — `deploy`
- `SSH_PRIVATE_KEY` — приватный ключ целиком

Variables:
- `DOMAIN` — домен, A-запись которого смотрит на IP. Без домена: `<IP>.sslip.io` (например `1.2.3.4.sslip.io`).

Старые секреты `DOCKER_HUB_*` и `SERVER_PASSWORD` больше не нужны.

## Данные

`~/drawga/data/data.db` — пользователи (SQLite, схема создаётся сама на пустой базе), `~/drawga/saves/` — доски. Бэкап — просто скопировать эти две папки.
