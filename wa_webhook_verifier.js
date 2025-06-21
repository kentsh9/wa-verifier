
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json()); // 必须添加！用于解析 JSON 请求体

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const FORWARD_URL = process.env.FORWARD_URL;

// Webhook 验证（GET 请求）
app.get('/', (req, res) => {
  if (
    req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === VERIFY_TOKEN
  ) {
    console.log('Webhook verified.');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

// 接收消息（POST 请求）
app.post('/', async (req, res) => {
  console.log('📨 Received POST:', JSON.stringify(req.body));

  if (FORWARD_URL) {
    try {
      const response = await fetch(FORWARD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      console.log(`✅ Forwarded to ${FORWARD_URL} - status: ${response.status}`);
    } catch (error) {
      console.error('❌ Forwarding failed:', error.message);
    }
  }

  res.sendStatus(200);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Webhook verification server running on port ${port}`));

