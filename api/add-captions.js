export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { videoUrl } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: "videoUrl required" });
  }

  try {
    // For now, return the original video URL
    // Caption processing requires ffmpeg which is not available in Render's free tier
    // Captions will be added client-side instead using a different approach
    return res.status(200).json({ videoUrl });
  } catch (error) {
    console.error("Caption error:", error);
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}
