# Правила для агентов (Agent Rules)

Единый источник правил проекта для всех агентов (Claude Code, Gemini CLI и др.). Другие файлы инструкций только ссылаются сюда — правила добавляем и меняем только здесь.

DrawGa — многопользовательская онлайн-доска для рисования. Рабочая ветка — `to-vue` (фронт переписан на Vue).

- `frontend/old_src/` устарел — не читаем, не ищем по нему и не правим. Рабочий фронтенд — `frontend/src/`.
- Бэкенд (`backend/`, `Drawga.Tests/`) можно читать, но менять — только с явного разрешения пользователя.
- Поиск по коду — `rg`, не `grep`/`find`.

## Стиль работы («ponytail»)
Режим ленивого сеньора — до написания кода спроси себя: нужно ли это вообще (YAGNI)? Есть ли это в стандартной библиотеке? В платформе? Можно ли в одну строку? Делаем минимум, который работает. Без абстракций, которых не просили, без лишних зависимостей и бойлерплейта. Осознанные упрощения помечаем комментарием `ponytail:`.

## Бэкенд (ASP.NET, C#, `net6.0`)
1. **Миграции и Entity**: получив разрешение на правку бэкенда, агент может менять и создавать сущности (`backend/Models`) и `DataContext`. Но **категорически запрещено** самому создавать или запускать миграции (`dotnet ef migrations add`, `dotnet ef database update` и т.п.) и вручную править файлы миграций. Это делает только пользователь. Если сущности изменились — явно скажи в конце ответа, что нужна миграция.
2. **Использование using**: директивы `using` в начале файла, а не полные пути к типам в коде.
3. БД — SQLite (`backend/data.db`), сохранения досок — `backend/saves/` (не в git).

## Фронтенд (`frontend/`)

### Команды (менеджер пакетов — **pnpm**, yarn/npm не используем)
```bash
pnpm install
pnpm dev             # vite, порт 5173
pnpm build           # type-check + vite build
pnpm build-only      # только vite build (так собирает Dockerfile)
pnpm type-check      # vue-tsc --noEmit
pnpm vitest run      # тесты (pnpm test — watch-режим)
pnpm coverage
pnpm lint            # eslint --fix
pnpm format          # prettier
```

### Стек
- Vue 3 (`<script setup>`), TypeScript, Pinia (`src/stores/`), VueUse, Vite. Алиас `@/` → `frontend/src`.
- Рисование: roughjs (фигуры), perfect-freehand (кисть). Уведомления — toastify-js (`src/services/toastify.ts`).
- Реалтайм — WebSocket `/draw/ws?id=<board>` (`src/services/webSocketService.ts`).
- Тесты — Vitest + @vue/test-utils + jsdom, лежат рядом с кодом (`*.test.ts`), порог покрытия 80%.

## Проверки и тесты
1. **Тесты сначала**: для фич и багфиксов сначала пишем тест, запускаем и убеждаемся, что он падает по правильной причине, потом реализуем. Тесты под реализацию не подгоняем; если тест кажется неверным — обсуждаем с пользователем.
2. **После изменений**: `pnpm type-check` (ноль ошибок, без `any`/`@ts-ignore`/кастов ради тишины), `pnpm vitest run`, `pnpm build`; при изменениях бэка — `dotnet build` и `dotnet test Drawga.Tests`. Ошибки, которые были до изменений, отмечаем как уже существовавшие.

## Локальный запуск
```bash
cd frontend && pnpm dev
mkdir -p backend/dist   # Program.cs требует папку dist (в git её нет)
cd backend && DOTNET_ROLL_FORWARD=Major ASPNETCORE_ENVIRONMENT=Development \
  ASPNETCORE_URLS=http://localhost:5240 dotnet run --no-launch-profile
```
Открыть http://localhost:5240/draw?id=1 — бэк в Development проксирует фронт на vite (5173).
`DOTNET_ROLL_FORWARD=Major` — проект на net6.0, а локально стоит рантайм 9. `ASPNETCORE_URLS` — только HTTP, потому что launch profile требует dev-сертификат для HTTPS.

## Git и GitHub
- GitHub (`gh`/API) — только на чтение: Actions, логи, PR. Никаких rerun/cancel, создания/мержа/комментов PR и issues, правок secrets и настроек.
- Commit и push — только по явной просьбе. Исключение: новую рабочую ветку сразу пушим (`git push -u origin <branch>`). В `main`, `to-vue` и деплойные ветки без явной просьбы не пушим.
- Деплой (`.github/workflows/deploy.yml`): push в `test-server` → Docker-образ в Docker Hub → SSH на сервер и `docker run`. После пуша следим за run до конца (`gh run watch`) и сообщаем результат.

## Поведение агентов
1. Для чтения, записи и правки файлов используем встроенные инструменты агента, а не консольные утилиты.
