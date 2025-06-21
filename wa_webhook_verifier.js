
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  if (
    req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === 'wa_test_token_2025'
  ) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Webhook verification server running on port ${port}`));
