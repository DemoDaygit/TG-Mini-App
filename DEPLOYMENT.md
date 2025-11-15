# 📦 Deployment Guide

## Production Deployment для AI Agent Learning Platform

---

## 🎯 Overview

Эта платформа состоит из:
- **Frontend**: React + Vite (Telegram Mini App)
- **Backend**: Express + Prisma + PostgreSQL
- **Database**: PostgreSQL + Redis

---

## 🚀 Рекомендуемый стек для deployment

| Компонент | Сервис | Причина |
|-----------|--------|---------|
| Frontend | Vercel | Автоматический deploy, Edge network, бесплатный tier |
| Backend | Railway | PostgreSQL included, простой deploy, хороший free tier |
| Database | Railway PostgreSQL | Managed, автоматические бэкапы |
| Monitoring | Sentry | Error tracking для production |
| Analytics | PostHog | User analytics, бесплатный self-hosted |

---

## 📱 Frontend Deployment (Vercel)

### 1. Подготовка

```bash
cd apps/frontend

# Убедитесь что build работает
npm run build
npm run preview
```

### 2. Создайте vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "@api_url",
    "VITE_TELEGRAM_BOT_ID": "@telegram_bot_id"
  },
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### 3. Deploy через CLI

```bash
# Установите Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deploy
vercel --prod
```

### 4. Настройте Environment Variables в Vercel Dashboard

```
VITE_API_URL=https://your-backend.railway.app/api
VITE_TELEGRAM_BOT_ID=your_bot_id
```

### 5. Настройте Custom Domain (опционально)

```
1. В Vercel Dashboard -> Settings -> Domains
2. Добавьте домен
3. Следуйте инструкциям DNS
```

---

## 🖥️ Backend Deployment (Railway)

### 1. Подготовка

Создайте `apps/backend/railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. Railway CLI Setup

```bash
# Установите Railway CLI
npm i -g @railway/cli

# Login
railway login

# Создайте новый проект
railway init

# Link к проекту
railway link
```

### 3. Добавьте PostgreSQL

```bash
# В Railway Dashboard или через CLI
railway add postgresql

# Автоматически создастся DATABASE_URL
```

### 4. Настройте Environment Variables

Через Railway Dashboard или CLI:

```bash
railway variables set PORT=3000
railway variables set NODE_ENV=production
railway variables set FRONTEND_URL=https://your-app.vercel.app
railway variables set TELEGRAM_BOT_TOKEN=your_token

# DATABASE_URL уже есть автоматически
```

### 5. Deploy

```bash
# Deploy из CLI
railway up

# Или через GitHub integration (рекомендуется)
# 1. Подключите GitHub repo в Railway Dashboard
# 2. Railway автоматически деплоит при push
```

### 6. Настройте Custom Domain

```
1. Railway Dashboard -> Settings -> Domains
2. Добавьте домен
3. Обновите DNS записи
```

---

## 🗄️ Database Setup (Production)

### 1. Миграции

```bash
# Railway автоматически запустит при deploy:
npx prisma migrate deploy
```

### 2. Seed данных

Создайте отдельный скрипт для production seed:

```bash
# В Railway Dashboard -> Settings -> Deploy Triggers
# Добавьте команду после deploy:
npx tsx prisma/seed.ts
```

### 3. Backup стратегия

```bash
# Railway автоматически делает daily backups PostgreSQL

# Manual backup:
railway run pg_dump \$DATABASE_URL > backup-$(date +%Y%m%d).sql
```

---

## 🔒 Безопасность

### 1. Environment Variables

**Никогда не коммитьте:**
- `.env`
- Tokens
- API keys
- Database credentials

### 2. Настройте .gitignore

```gitignore
# Environment
.env
.env.local
.env.production

# Secrets
*.pem
secrets/
```

### 3. HTTPS Only

```typescript
// apps/backend/src/index.ts
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 4. Rate Limiting

Уже настроено в `middleware/auth.ts`:
- 100 requests/minute per user
- IP-based fallback

### 5. Security Headers

Helmet уже настроен в `index.ts`

---

## 📊 Monitoring & Logging

### 1. Sentry Setup

```bash
npm install @sentry/react @sentry/node
```

**Frontend (apps/frontend/src/main.tsx):**

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

**Backend (apps/backend/src/index.ts):**

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### 2. Logging

Используйте Winston для backend:

```bash
npm install winston
```

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

---

## 🤖 Telegram Bot Configuration

### 1. Production Bot Setup

```
1. Создайте production бота через @BotFather
2. Получите токен
3. Настройте Menu Button:
   /mybots -> Your Bot -> Bot Settings -> Menu Button
   URL: https://your-app.vercel.app
```

### 2. Webhook (опционально)

```typescript
// Если нужны уведомления от Telegram
const TELEGRAM_WEBHOOK_URL = `${process.env.BACKEND_URL}/webhook/telegram`;

await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: TELEGRAM_WEBHOOK_URL })
});
```

---

## 📈 Performance Optimization

### 1. Frontend

**vite.config.ts:**

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui': ['framer-motion', 'lucide-react'],
        },
      },
    },
  },
});
```

### 2. Backend

**Prisma Connection Pool:**

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Connection pooling для production
  connection_limit = 10
}
```

### 3. CDN для статики

Vercel автоматически использует Edge Network

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main, claude/ai-recommendation-system-*]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd apps/frontend && npm ci
      - run: cd apps/frontend && npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 🧪 Pre-deployment Checklist

- [ ] Все environment variables настроены
- [ ] Database миграции готовы
- [ ] Seed данные загружены
- [ ] CORS настроен правильно
- [ ] Telegram bot токен обновлен
- [ ] Sentry DSN добавлен
- [ ] SSL/HTTPS работает
- [ ] Rate limiting настроен
- [ ] Error boundaries добавлены
- [ ] Logs настроены
- [ ] Backup стратегия определена

---

## 🆘 Troubleshooting Production

### Backend не отвечает

```bash
# Проверьте логи в Railway
railway logs

# Проверьте статус
railway status

# Рестарт
railway restart
```

### Database connection issues

```bash
# Проверьте connection string
railway variables

# Проверьте Prisma
railway run npx prisma studio
```

### Frontend не подключается к API

1. Проверьте CORS в backend
2. Проверьте VITE_API_URL
3. Проверьте Network tab в DevTools
4. Проверьте Telegram Web App domain whitelist

---

## 📊 Monitoring Dashboard

Настройте дашборд с метриками:

1. **Railway**: CPU, Memory, Network
2. **Vercel**: Requests, Performance, Errors
3. **Sentry**: Error rate, User impact
4. **Custom**: User analytics через PostHog

---

## 🎉 Post-Deployment

### 1. Тестирование

```
✓ Откройте бота в Telegram
✓ Проверьте регистрацию
✓ Загрузите модуль
✓ Проверьте рекомендации
✓ Завершите модуль
✓ Проверьте XP и достижения
```

### 2. Мониторинг первые 24 часа

- Следите за error rate в Sentry
- Проверяйте логи в Railway
- Мониторьте performance в Vercel

### 3. Обратная связь

- Создайте канал для feedback
- Добавьте analytics events
- Отслеживайте user retention

---

**Готово к production! 🚀**
