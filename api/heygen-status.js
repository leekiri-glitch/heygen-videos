export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoId, apiKey } = req.body;

  if (!apiKey || !videoId) {
    return res.status(400).json({ error: 'API key and video ID required' });
  }

  try {
    const url = `https://api.heygen.com/v1/video/${videoId}`;

    const response = await fetch(url, {
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
