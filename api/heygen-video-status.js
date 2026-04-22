export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoId, apiKey } = req.body;

  if (!videoId || !apiKey) {
    return res.status(400).json({ error: 'videoId and apiKey required' });
  }

  try {
    // HeyGen v3 Videos API - GET /v3/videos/{video_id}
    const response = await fetch(`https://api.heygen.com/v3/videos/${videoId}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || `HeyGen API error: ${response.status}`,
        details: data
      });
    }

    return res.status(200).json(data.data);
  } catch (error) {
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}
