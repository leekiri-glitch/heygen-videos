export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { scriptText, apiKey } = req.body;

  if (!scriptText || !apiKey) {
    return res.status(400).json({ error: 'scriptText and apiKey required' });
  }

  try {
    // HeyGen v3 Video Agent endpoint
    const response = await fetch('https://api.heygen.com/v3/video_agent/create', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        script: {
          text: scriptText,
          type: 'text'
        },
        config: {
          aspect_ratio: '9:16',
          style: 'professional'
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || `HeyGen API error: ${response.status}`,
        details: data
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}
