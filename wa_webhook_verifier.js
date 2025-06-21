const express = require('express');
const fetch = require('node-fetch'); // 需要在 package.json 中安装 node-fetch@2
const app = express();

// 中间件：解析 JSON 请求体
app.use(express.json());

// 读取环境变量中的 VERIFY_TOKEN 和 FORWARD_URL
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const FORWARD_URL = process.env.FORWARD_URL;

// GET：Webhook 验证
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

// POST：接收消息并转发到 Make（可选）
app.post('/', async (req, res) => {
  console.log('📨 Received message:', JSON.stringify(req.body, null, 2));

  try {
    // 将消息转发到 Make Webhook（可选）
    if (FORWARD_URL) {
      await fetch(FORWARD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      console.log('➡️ Message forwarded to Make');
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Forwarding failed:', error);
    res.sendStatus(500);
  }
});

// 启动服务
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Webhook verification server running on port ${port}`);
});
