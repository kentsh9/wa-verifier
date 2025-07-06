const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'cloudtest123';
const TARGET_URLS = [
  process.env.FORWARD_URL,                          // Make Webhook
  'http://47.238.114.76:3002/api/webhook'           // Receevi 本地监听
];

// ✅ GET 验证接口
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook 验证成功');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook 验证失败');
    res.sendStatus(403);
  }
});

// ✅ POST 接收 webhook 并转发
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    console.log('📨 收到 Facebook 消息:', JSON.stringify(body, null, 2));

    await Promise.allSettled(
      TARGET_URLS.map(url =>
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
      )
    );

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ 处理 webhook 时出错:', error);
    res.sendStatus(500);
  }
});

// ✅ 启动服务
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Webhook 服务已启动，监听端口: ${PORT}`);
});
