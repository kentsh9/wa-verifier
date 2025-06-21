
const express = require('express');
const app = express();

// 读取环境变量中的 VERIFY_TOKEN
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

app.get('/', (req, res) => {
  if (
    req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === VERIFY_TOKEN
  ) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Webhook verification server running on port ${port}`));

