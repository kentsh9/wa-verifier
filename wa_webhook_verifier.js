const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'cloudtest123';

// 👇 多个目标地址：Make 和 Receevi 本地监听
const TARGET_URLS = [
'http://47.238.114.76:3010/api/webhook'           // Receevi 本地服务监听
].filter(Boolean);  // ✅ 忽略空地址，防止 .env 中未定义

// ✅ Webhook 验证（GET）
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

// ✅ 接收 Webhook 并转发（POST）
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    console.log('📨 收到 Facebook 消息:', JSON.stringify(body, null, 2));

    const results = await Promise.allSettled(
      TARGET_URLS.map(async (url) => {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          console.log(`✅ 转发成功 → ${url}，状态码: ${response.status}`);
        } catch (err) {
          console.error(`❌ 转发失败 → ${url}`, err.message);
        }
      })
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
  console.log(`🚀 Webhook 转发服务运行中，监听端口 ${PORT}`);
});
console.log('🔍 VERIFY_TOKEN =', VERIFY_TOKEN);
console.log('🔍 FORWARD_URL =', process.env.FORWARD_URL);
