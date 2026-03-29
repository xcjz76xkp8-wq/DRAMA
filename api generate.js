import crypto from 'crypto';

export default async function handler(req, res) {
  const { prompt } = req.body;

  // ======================
  // 你的密钥（已全部填好）
  // ======================
  const deepseekKey = 'sk-ecadf3244d5445af88282f2defa5ed30';
  const ACCESS_KEY = 'AKLTMWWRiMzM3Y2Y4N2Q5NGFhYThiZTM4ODE4NWJiZTJkZmU';
  const SECRET_KEY = 'WW1aaVpEZ3paV1kyWIdNd05HWTFOamcxTkRJek1qaGINV1E1WkRBMk1ERQ==';

  try {
    // 1. 生成剧本
    const scriptResp = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6
      })
    });

    const scriptData = await scriptResp.json();
    const script = scriptData.choices?.[0]?.message.content || '无剧本';

    // 2. 即梦AI签名
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = Math.random().toString(36).slice(2, 10);

    const signStr = `AccessKey=${ACCESS_KEY}&Timestamp=${timestamp}&Nonce=${nonce}&SecretKey=${SECRET_KEY}`;
    const signature = crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();

    // 3. 调用即梦生成视频
    const videoResp = await fetch('https://api.aimj.tv/api/v1/video/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'AccessKey': ACCESS_KEY,
        'Timestamp': timestamp,
        'Nonce': nonce,
        'Signature': signature
      },
      body: JSON.stringify({
        "text": script,
        "ratio": "9:16",
        "duration": 50
      })
    });

    const videoResult = await videoResp.json();

    return res.status(200).json({
      script: script,
      video: videoResult
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}