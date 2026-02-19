# NEON BLASTER — Сервер оплаты

Backend для обработки платежей через Stripe + Google Pay.

---

## 🚀 Деплой на Railway (бесплатно, 5 минут)

### Шаг 1 — Загрузите код на GitHub
1. Создайте аккаунт на github.com (если нет)
2. Создайте новый репозиторий: **New repository** → назовите `neon-blaster-server`
3. Загрузите все файлы из этой папки в репозиторий

### Шаг 2 — Задеплойте на Railway
1. Зайдите на railway.app → **Start a New Project**
2. Выберите **Deploy from GitHub repo**
3. Выберите репозиторий `neon-blaster-server`
4. Railway автоматически запустит сервер

### Шаг 3 — Добавьте переменные окружения
В Railway: откройте проект → **Variables** → добавьте:

| Переменная | Значение |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` (из dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (из dashboard.stripe.com/webhooks) |

### Шаг 4 — Получите URL сервера
Railway выдаст URL вида: `https://neon-blaster-server-production.up.railway.app`

### Шаг 5 — Подключите к игре
В файле `arcade-game.html` найдите строку:
```
// const res = await fetch('/create-payment-intent',
```
Замените на:
```js
const res = await fetch('https://ВАШ-URL.railway.app/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: amountCents, currency: 'eur' })
});
const { clientSecret } = await res.json();
const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: ev.paymentMethod.id
}, { handleActions: false });
if (error) { ev.complete('fail'); showError(error.message); return; }
ev.complete('success');
showSuccess();
```

---

## 🔐 Безопасность

- **НИКОГДА** не добавляйте `.env` в Git
- `STRIPE_SECRET_KEY` (`sk_live_...`) — только на сервере, никогда во фронтенде
- `STRIPE_PUBLISHABLE_KEY` (`pk_live_...`) — можно во фронтенде (уже вставлен в игру)

---

## 🧪 Локальный запуск для теста

```bash
# 1. Установите зависимости
npm install

# 2. Создайте файл .env
cp .env.example .env
# Отредактируйте .env — вставьте ваши ключи Stripe

# 3. Запустите сервер
npm start
# Сервер запустится на http://localhost:3000
```

---

## 📡 API эндпоинты

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/create-payment-intent` | Создать платёж |
| `POST` | `/webhook` | Webhook от Stripe |
