require('dotenv').config();
const stripe = require('stripe')(process.env.NODE_ENV === 'production' ? process.env.STRIPE_API_KEY_LIVE : process.env.STRIPE_API_KEY_TEST);
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Stripe server Listening at port ${PORT}`));

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

app.get('/stripe/wallet/:wallet_id', (req, res) => {
  console.log(req.params)
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

app.delete('/stripe/wallet/:wallet_id/card/:card_id', (req, res) => {
  console.log(req.params)
  deleteCard(req)
  .then((response) => {
    res.status(200).send(response);
    console.log('Card removed from wallet')
  })
  .catch((err) => {
    console.log(err)
    res.status(400).send(err.message);
  })
})

app.post('/stripe/wallet/:wallet_id/card', (req, res) => {
  addCard(req)
  .then((data) => {
    res.status(200).send(data);
    console.log('Card added to wallet')
  })
  .catch((err) => {
    res.status(400).send(err);
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

function createWallet(req) {
  return stripe.customers.create({source: req.body.source})
}

function getWallet(req) {
  return stripe.customers.retrieve(req.params.wallet_id)
}

function addCard(req) {
  return stripe.customers.createSource(req.params.wallet_id, { source: req.body.token })
}

function deleteCard(req) {
  return stripe.customers.deleteCard(req.params.wallet_id, req.params.card_id);
}

function charge(req) {
  const { source, amount, customer } = req.body;
  return stripe.charges.create({
    amount: parseInt(amount, 10),
    currency: 'usd',
    description: 'robot burger',
    source,
    customer,
    metadata: {}, // store whatever information about purchase you'd like
  });
}
