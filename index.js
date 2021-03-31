require('dotenv').config();

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const path = require('path');
const util = require('util');

const plaid = require('plaid');

const plaidClient = new plaid.Client({
  clientID: process.env.CLIENT_ID,
  secret: process.env.SECRET,
  env: plaid.environments.sandbox,
});

app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/create-link-token', async (req, res) => {
  const {link_token: linkToken } = await plaidClient.createLinkToken({
    user: {
      client_user_id: "1234",
    },
    country_codes: ['US'],
    language: 'en',
    client_name: "Sabio",
    products: ['transactions', 'auth'],
  });

  console.log(linkToken);
  res.json(linkToken);

});

app.post('/exchange-token', async (req, res) => {
  const {access_token: accessToken} = await plaidClient.exchangePublicToken(req.body.publicToken);
  console.log(accessToken);

  //In real life, create separate endpoints for these calls, don't do them in /exchange-token
  const authData = await plaidClient.getAuth(accessToken);
  console.log(util.inspect(authData, false, null, true));

  // In real life, listen for a webhook rather than using a sleep statement
  await new Promise(resolve => setTimeout(resolve, 5000));

  const transactionsData = await plaidClient.getTransactions(accessToken, "2021-03-01", "2021-03-10");
  console.log(util.inspect(transactionsData, false, null, true));



});

app.listen(3000, () => {
    console.log('Listening on port', 3000);
});
