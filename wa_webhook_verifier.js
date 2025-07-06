const express = require('express');
const fetch = require('node-fetch');
const app = express();
require('dotenv').config();

app.use(express.json());

// 验证 webhook
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully!');
    res.status(200).send(challenge);
  } else {
    console.log('Webhook verification failed.');
    res.sendStatus(403);
  }
});

// 接收消息并转发
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    console.log('🔔 Incoming webhook:', JSON.stringify(body, null, 2));

    // 你可以根据 body.entry 做过滤处理，比如判断 message 类型等

    // 转发给 Make（或任意其他目标）
    const forwardURL = process.env.FORWARD_URL;
    if (forwardURL) {
      await fetch(forwardURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    }

    // （可选）如果你有 Receevi 监听服务，也可以加入额外转发

    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Error processing webhook:', err);
    res.sendStatus(500);
  }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Webhook server is running on port ${PORT}`);
});
