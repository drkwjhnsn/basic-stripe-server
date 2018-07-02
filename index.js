require('dotenv').config();
const stripe = require('stripe')(process.env.NODE_ENV === 'production' ? process.env.STRIPE_API_KEY_LIVE : process.env.STRIPE_API_KEY_TEST);
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

app.post('/payment', (req, res) => {
  charge(req)
  .then((data) => {
    res.status(200).send('Payment accepted');
    console.log('Payment accepted')
  })
  .catch((err) => {
    console.log(err)
    res.status(400).send('Payment failed');
  })
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Stripe server Listening at port ${PORT}`));

function charge(req) {
  const { tokenId, amount } = req.body;
  return stripe.charges.create({
    amount: parseInt(amount, 10),
    currency: 'usd',
    source: tokenId,
    description: 'robot burger',
    metadata: {},
  });
}
