export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { scriptText, apiKey } = req.body;

  if (!scriptText || !apiKey) {
    return res.status(400).json({ error: 'scriptText and apiKey required' });
  }

  try {
    // Use HeyGen CLI to generate video
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    // Export API key to environment
    process.env.HEYGEN_API_KEY = apiKey;

    // Create temporary script file
    const fs = require('fs');
    const scriptFile = `/tmp/script_${Date.now()}.txt`;
    fs.writeFileSync(scriptFile, scriptText);

    try {
      // Try to call HeyGen CLI
      const { stdout } = await execAsync(`heygen video-agent create --script-file "${scriptFile}" --aspect-ratio 9:16 --style professional --wait`, {
        timeout: 300000 // 5 minutes
      });

      // Parse output and return video info
      const videoData = JSON.parse(stdout);

      // Clean up
      fs.unlinkSync(scriptFile);

      return res.status(200).json(videoData);
    } catch (cliError) {
      // CLI not available, fallback error
      throw new Error(`HeyGen CLI failed: ${cliError.message}`);
    }

  } catch (error) {
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}
