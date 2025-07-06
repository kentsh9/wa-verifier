// 接收消息并转发到多个目标
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    console.log('🔔 Incoming webhook:', JSON.stringify(body, null, 2));

    // 多目标转发
    const targetUrls = [
      process.env.FORWARD_URL,                          // Make Webhook
      'http://47.238.114.76:3002/api/webhook'           // Receevi 本地监听地址
    ];

    await Promise.allSettled(
      targetUrls.map(url =>
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
      )
    );

    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Error processing webhook:', err);
    res.sendStatus(500);
  }
});
