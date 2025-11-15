# 🚀 Quick Start Guide

## Установка и запуск проекта

### Предварительные требования

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis (опционально, для production)
- npm >= 9.0.0

---

## 📦 Установка

### 1. Клонируйте репозиторий

```bash
git clone https://github.com/DemoDaygit/TG-Mini-App.git
cd TG-Mini-App
```

### 2. Переключитесь на рабочую ветку

```bash
git checkout claude/ai-recommendation-system-01BuKXuYgzvbbpC1JBn7hWc9
```

### 3. Установите зависимости

```bash
npm install
```

---

## ⚙️ Конфигурация

### Backend (.env)

Создайте файл `apps/backend/.env`:

```bash
# Server
PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_learning

# Redis (опционально)
REDIS_URL=redis://localhost:6379

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather

# Optional: для будущих фич
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
```

### Frontend (.env)

Создайте файл `apps/frontend/.env`:

```bash
VITE_API_URL=http://localhost:3000/api
VITE_TELEGRAM_BOT_ID=your_bot_id
```

---

## 🗄️ База данных

### 1. Создайте базу данных PostgreSQL

```bash
# Войдите в PostgreSQL
psql -U postgres

# Создайте базу
CREATE DATABASE ai_learning;

# Выйдите
\q
```

### 2. Настройте Prisma

```bash
cd apps/backend

# Сгенерируйте Prisma Client
npx prisma generate

# Создайте таблицы
npx prisma db push

# (Опционально) Откройте Prisma Studio для просмотра БД
npx prisma studio
```

### 3. Загрузите обучающие модули (seed)

Создайте файл `apps/backend/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function main() {
  // Загружаем модули из JSON файлов
  const modulesDir = join(__dirname, '../../..', 'packages/learning-content/modules');

  const modules = [
    'foundation-01-what-are-ai-agents.json',
    'architecture-01-agent-components.json',
    'development-01-langchain-agents.json'
  ];

  for (const moduleFile of modules) {
    const moduleData = JSON.parse(
      readFileSync(join(modulesDir, moduleFile), 'utf-8')
    );

    await prisma.learningModule.upsert({
      where: { moduleId: moduleData.id },
      update: moduleData,
      create: {
        moduleId: moduleData.id,
        title: moduleData.title,
        description: moduleData.description,
        category: moduleData.category,
        difficulty: moduleData.difficulty,
        estimatedMinutes: moduleData.estimatedMinutes,
        prerequisites: moduleData.prerequisites,
        skills: moduleData.skills,
        tags: moduleData.tags,
        content: moduleData.content,
        completionCount: moduleData.completionCount,
        averageRating: moduleData.averageRating,
        averageCompletionTime: moduleData.averageCompletionTime
      }
    });

    console.log(`✅ Loaded: ${moduleData.title}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Запустите seed:

```bash
npx tsx prisma/seed.ts
```

---

## 🏃 Запуск проекта

### Development режим

**Терминал 1: Backend**
```bash
cd apps/backend
npm run dev
```

**Терминал 2: Frontend**
```bash
cd apps/frontend
npm run dev
```

Откройте: `http://localhost:5173`

### Production build

```bash
# Backend
cd apps/backend
npm run build
npm start

# Frontend
cd apps/frontend
npm run build
npm run preview
```

---

## 🔧 Создание Telegram бота

### 1. Создайте бота через BotFather

```
1. Найдите @BotFather в Telegram
2. Отправьте /newbot
3. Следуйте инструкциям
4. Сохраните токен бота
```

### 2. Настройте Mini App

```
1. Отправьте /newapp в BotFather
2. Выберите вашего бота
3. Введите название и описание
4. Загрузите изображение
5. URL: https://your-app-url.vercel.app
6. Опубликуйте
```

### 3. Настройте Web App URL

```bash
# В BotFather отправьте:
/mybots
# Выберите бота -> Bot Settings -> Menu Button -> Edit Menu Button URL
# Введите: https://your-app-url.vercel.app
```

---

## 📱 Тестирование в Telegram

### Local Development (ngrok)

```bash
# Установите ngrok
npm install -g ngrok

# Запустите туннель для backend
ngrok http 3000

# Используйте ngrok URL в frontend .env
VITE_API_URL=https://your-ngrok-url.ngrok.io/api

# Запустите туннель для frontend
ngrok http 5173

# Используйте этот URL в BotFather
```

---

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd apps/frontend

# Установите Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Backend (Railway)

```bash
cd apps/backend

# 1. Создайте аккаунт на railway.app
# 2. Установите Railway CLI
npm i -g @railway/cli

# 3. Login
railway login

# 4. Создайте проект
railway init

# 5. Добавьте PostgreSQL
railway add

# 6. Deploy
railway up
```

---

## 📊 Полезные команды

### Prisma

```bash
# Сгенерировать клиент
npx prisma generate

# Создать миграцию
npx prisma migrate dev --name init

# Применить миграции
npx prisma migrate deploy

# Открыть студию
npx prisma studio

# Сбросить БД
npx prisma migrate reset
```

### Database

```bash
# Backup
pg_dump -U postgres ai_learning > backup.sql

# Restore
psql -U postgres ai_learning < backup.sql
```

---

## 🐛 Troubleshooting

### Backend не запускается

```bash
# Проверьте PostgreSQL
psql -U postgres -c "SELECT version();"

# Проверьте порты
lsof -i :3000

# Проверьте логи
npm run dev 2>&1 | tee debug.log
```

### Frontend не подключается к API

```bash
# Проверьте CORS в backend
# Проверьте .env файл
# Откройте DevTools -> Network
```

### Prisma ошибки

```bash
# Пересоздайте клиент
rm -rf node_modules/.prisma
npx prisma generate
```

---

## 📚 Структура проекта

```
TG-Mini-App/
├── apps/
│   ├── backend/          # Express API
│   │   ├── prisma/       # Database schema
│   │   └── src/          # Source code
│   └── frontend/         # React app
│       └── src/          # Components, pages, etc
├── packages/
│   ├── types/            # TypeScript types
│   ├── shared/           # Shared code
│   └── learning-content/ # Учебные модули (JSON)
└── docs/
    ├── ARCHITECTURE.md   # Архитектура
    └── QUICKSTART.md     # Этот файл
```

---

## 🎯 Что дальше?

1. **Добавьте тесты**: Vitest + Testing Library
2. **Настройте monitoring**: Sentry
3. **Оптимизируйте**: Bundle analysis, code splitting
4. **Добавьте фич**: Code playground, quiz система, certificates

---

## 💡 Tips

- Используйте `npx prisma studio` для просмотра данных
- Проверяйте Network tab в DevTools для отладки API
- Используйте Telegram Web для быстрого тестирования
- Логи backend помогут найти ошибки аутентификации

---

## 🆘 Помощь

- GitHub Issues: https://github.com/DemoDaygit/TG-Mini-App/issues
- Telegram: @your_support_channel
- Документация: См. ARCHITECTURE.md

---

**Готово! 🎉 Теперь можно начинать разработку!**
