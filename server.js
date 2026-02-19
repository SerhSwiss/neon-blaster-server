const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' })); // В продакшне замените '*' на ваш домен

// ───────────────────────────────────────────
// POST /create-payment-intent
// Body: { amount: 149, currency: 'eur' }
// ───────────────────────────────────────────
app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency = 'eur' } = req.body;

  if (!amount || amount < 1) {
    return res.status(400).json({ error: 'Неверная сумма' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,        // в центах: 149 = €1.49
      currency,
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ───────────────────────────────────────────
// POST /webhook  (опционально — для подтверждения оплаты на сервере)
// Настройте Webhook в Stripe Dashboard → Developers → Webhooks
// ───────────────────────────────────────────
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    console.log(`✅ Оплата успешна: ${pi.id} — ${pi.amount / 100}€`);
    // TODO: выдать доступ игроку, записать в БД и т.д.
  }

  res.json({ received: true });
});

// ───────────────────────────────────────────
// Health check
// ───────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'NEON BLASTER Server running 🚀' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
