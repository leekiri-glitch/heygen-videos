import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { execSync } from "child_process";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { videoUrl, captions, captionSize, captionColor } = req.body;

  if (!videoUrl || !captions || !Array.isArray(captions)) {
    return res.status(400).json({ error: "videoUrl and captions array required" });
  }

  try {
    // Download video from HeyGen
    const videoRes = await fetch(videoUrl);
    const videoBuffer = await videoRes.buffer();
    const inputPath = `/tmp/input_${Date.now()}.mp4`;
    const outputPath = `/tmp/output_${Date.now()}.mp4`;
    const srtPath = `/tmp/captions_${Date.now()}.srt`;

    fs.writeFileSync(inputPath, videoBuffer);

    // Create SRT subtitle file
    let srtContent = "";
    let timePos = 0;
    captions.forEach((caption, idx) => {
      const duration = 3; // 3 seconds per caption
      const startTime = formatSRTTime(timePos);
      const endTime = formatSRTTime(timePos + duration);
      srtContent += `${idx + 1}\n${startTime} --> ${endTime}\n${caption}\n\n`;
      timePos += duration;
    });

    fs.writeFileSync(srtPath, srtContent);

    // Determine font size
    const fontSizeMap = { small: 14, normal: 20, large: 28 };
    const fontSize = fontSizeMap[captionSize] || 20;

    // Use ffmpeg to add captions
    const filterStr = `subtitles=${srtPath}:force_style='FontSize=${fontSize},PrimaryColour=&H${captionColor.slice(1).toUpperCase()}&'`;
    const cmd = `ffmpeg -i ${inputPath} -vf "${filterStr}" -c:a copy -y ${outputPath}`;

    execSync(cmd, { stdio: "pipe" });

    const outputBuffer = fs.readFileSync(outputPath);
    const base64 = outputBuffer.toString("base64");
    const dataUrl = `data:video/mp4;base64,${base64}`;

    // Cleanup
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
    fs.unlinkSync(srtPath);

    return res.status(200).json({ videoUrl: dataUrl });
  } catch (error) {
    console.error("Caption error:", error);
    return res.status(500).json({ error: `Failed to add captions: ${error.message}` });
  }
}

function formatSRTTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}
