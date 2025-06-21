const express = require('express');
const fetch = require('node-fetch'); // 使用 node-fetch v2
const app = express();

app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const FORWARD_URL = process.env.FORWARD_URL;

app.get('/', (req, res) => {
  if (
    req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === VERIFY_TOKEN
  ) {
    console.log('✅ Webhook verified');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.warn('❌ Webhook verification failed');
    res.sendStatus(403);
  }
});

app.post('/', async (req, res) => {
  console.log('📨 Received message:', JSON.stringify(req.body, null, 2));

  try {
    if (FORWARD_URL) {
      await fetch(FORWARD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      console.log('➡️ Message forwarded to Make');
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Forwarding failed:', error);
    res.sendStatus(500);
  }
});

// ❗必须使用 Render 提供的 PORT 环境变量
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`🚀 Webhook verification server running on port ${port}`);
});
       
