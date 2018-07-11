require('dotenv').config();
const stripe = require('stripe')(process.env.NODE_ENV === 'production' ? process.env.STRIPE_API_KEY_LIVE : process.env.STRIPE_API_KEY_TEST);
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const wallets = ['ch_1CmmfWHEqeQ8EqTjH9mHpqPg']; // not setting up a db for this.

app.use(bodyParser.json());

app.post('/stripe/wallet', (req, res) => {
  createWallet(req)
  .then((data) => {
    console.log(data)
    console.log('wallet created');
    res.status(200).send(data);
  })
  .catch((err) => {
    res.status(400).send(err.message);
  })
})

app.get('/stripe/wallet', (req, res) => {
  console.log(req.query)
  getWallet(req)
  .then((response) => {
    res.status(200).send(response);
    console.log('Wallet Loaded')
  })
  .catch((err) => {
    console.log(err)
    res.status(400).send(err.message);
  })
})

app.post('/wallet/card', (req, res) => {
  addCard(req)
  .then((data) => {
    res.status(200).send(data);
  })
  .catch((err) => {
    res.status(400).send(err.message);
  })
})

app.post('/stripe/charge', (req, res) => {
  charge(req)
  .then((data) => {
    res.status(200).send(data);
    console.log(data)
    console.log('Payment accepted')
  })
  .catch((err) => {
    console.log(err.message)
    res.status(400).send(err);
  })
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Stripe server Listening at port ${PORT}`));

function createWallet(req) {
  return stripe.customers.create({
    source: req.body.source
  })
  .then((data) => {
    wallets.push(data.id);
    return data;
  })
}

function getWallet(req) {
  return stripe.customers.retrieve(req.query.customer_id)
}

function addCard(req) {
  return stripe.customers.createSource(req.body.walletId, { source: req.body.source })
}

function charge(req) {
  const { source, amount, customer } = req.body;
  return stripe.charges.create({
    amount: parseInt(amount, 10),
    currency: 'usd',
    source: source,
    description: 'robot burger',
    customer,
    metadata: {},
  });
}
