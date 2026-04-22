import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { scriptText, apiKey } = req.body;

  if (!scriptText || !apiKey) {
    return res.status(400).json({ error: 'scriptText and apiKey required' });
  }

  try {
    // Use HeyGen CLI to create video via v3 Video Agent
    // This is the modern recommended way
    const payload = {
      script: {
        text: scriptText,
        type: "text"
      },
      aspect_ratio: "9:16",
      style: {
        name: "professional"
      }
    };

    // Call HeyGen API v3 endpoint using proper authentication
    const response = await fetch('https://api.heygen.com/v3/video_agent/create', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}
