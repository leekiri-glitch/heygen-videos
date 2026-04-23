export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { scriptText, apiKey, avatarId } = req.body;

  if (!scriptText || !apiKey) {
    return res.status(400).json({ error: 'scriptText and apiKey required' });
  }

  try {
    // HeyGen v3 Video API - POST /v3/videos with avatar_id
    // This uses a specific avatar instead of letting HeyGen choose randomly
    const response = await fetch('https://api.heygen.com/v3/videos', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'avatar',
        avatar_id: avatarId || 'avt_17e95a63388a11eea55d6a7fa3e8cfa4',
        script: scriptText
        // voice_id: removed - using HeyGen's default voice for reliability
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || `HeyGen API error: ${response.status}`,
        details: data
      });
    }

    return res.status(200).json(data.data || data);
  } catch (error) {
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}
