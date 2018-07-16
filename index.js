require('dotenv').config();
const stripe = require('stripe')(process.env.NODE_ENV === 'production' ? process.env.STRIPE_API_KEY_LIVE : process.env.STRIPE_API_KEY_TEST);
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const router = express.Router()

app.use(bodyParser.json());
app.use('/stripe', router);
app.use(handleError);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Stripe server Listening at port ${PORT}`));

router.post('/wallet', (req, res) => {
  createWallet(req)
  .then((data) => {
    res.status(200).send(data);
    console.log('Wallet created');
  })
})

router.get('/wallet/:wallet_id', (req, res) => {
  getWallet(req)
  .then((response) => {
    res.status(200).send(response);
    console.log('Wallet Loaded')
  })
})

router.delete('/wallet/:wallet_id/card/:card_id', (req, res) => {
  deleteCard(req)
  .then((response) => {
    res.status(200).send(response);
    console.log('Card removed from wallet');
  })
})

router.post('/wallet/:wallet_id/card', (req, res) => {
  addCard(req)
  .then((data) => {
    res.status(200).send(data);
    console.log('Card added to wallet');
  })
})

router.post('/charge', (req, res) => {
  charge(req)
  .then((data) => {
    res.status(200).send(data);
    console.log('Payment accepted');
  })
});

function createWallet(req) {
  return stripe.customers.create({source: req.body.source});
}

function getWallet(req) {
  return stripe.customers.retrieve(req.params.wallet_id);
}

function addCard(req) {
  return stripe.customers.createSource(req.params.wallet_id, { source: req.body.token });
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

function handleError(err, req, res, next) {
  console.error(err.stack)
  res.status(500).send(err)
}
