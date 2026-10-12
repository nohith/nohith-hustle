import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
const port = Number(process.env.PORT || 8787);
app.disable("x-powered-by");
app.use(express.json({ limit: "30kb" }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: true, legacyHeaders: false }));

const cleanText = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
function decodeXml(value = "") {
  return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
}
function xmlTag(block, tag) {
  const match = block.match(new RegExp("<" + tag + "(?:\\s[^>]*)?>([\\s\\S]*?)</" + tag + ">", "i"));
  return match ? decodeXml(cleanText(match[1])) : "";
}
async function getText(url, headers = {}) {
  const response = await fetch(url, { headers: { "User-Agent": "HustleFeed/1.1 (trend discovery)", ...headers }, signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new Error("Upstream service returned " + response.status);
  return response.text();
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    services: {
      googleTrends: true,
      instagram: Boolean(process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_USER_ID),
      youtube: Boolean(process.env.YOUTUBE_API_KEY),
      ai: Boolean(process.env.ANTHROPIC_API_KEY)
    }
  });
});

app.get("/api/trends/google", async (req, res) => {
  const geo = String(req.query.geo || process.env.GOOGLE_TRENDS_GEO || "US").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2) || "US";
  try {
    const xml = await getText("https://trends.google.com/trending/rss?geo=" + encodeURIComponent(geo));
    const items = [...xml.matchAll(/<item(?:\\s[^>]*)?>([\\s\\S]*?)<\\/item>/gi)].map((match) => {
      const block = match[1];
      return {
        title: xmlTag(block, "title"),
        traffic: xmlTag(block, "ht:approx_traffic"),
        publishedAt: xmlTag(block, "pubDate"),
        url: xmlTag(block, "ht:news_item_url") || xmlTag(block, "link"),
        source: "Google Trends"
      };
    }).filter((item) => item.title).slice(0, 15);
    res.json({ source: "Google Trends trending RSS", geo, items, note: "Public trending-search feed; this is not a Google Trends API guarantee." });
  } catch (error) {
    res.status(502).json({ error: "Could not load Google Trends right now.", detail: error.message });
  }
});

app.get("/api/trends/instagram", async (req, res) => {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;
  const hashtag = String(req.query.hashtag || "sidehustle").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 50);
  if (!token || !userId) return res.status(503).json({
    error: "Instagram Graph API is not configured.",
    detail: "Add an Instagram professional-account access token and Instagram user ID to .env. The API does not provide a general public Reels-trending firehose."
  });
  try {
    const base = "https://graph.facebook.com/v21.0/";
    const searchUrl = new URL(base + "ig_hashtag_search");
    searchUrl.searchParams.set("user_id", userId);
    searchUrl.searchParams.set("q", hashtag);
    searchUrl.searchParams.set("access_token", token);
    const searchResponse = await fetch(searchUrl, { signal: AbortSignal.timeout(12_000) });
    const searchData = await searchResponse.json();
    if (!searchResponse.ok || !searchData.data?.[0]?.id) throw new Error(searchData.error?.message || "Hashtag lookup failed. Check token permissions.");
    const hashtagId = searchData.data[0].id;
    const mediaUrl = new URL(base + hashtagId + "/top_media");
    mediaUrl.searchParams.set("user_id", userId);
    mediaUrl.searchParams.set("fields", "id,caption,media_type,media_url,permalink,timestamp");
    mediaUrl.searchParams.set("access_token", token);
    const mediaResponse = await fetch(mediaUrl, { signal: AbortSignal.timeout(12_000) });
    const mediaData = await mediaResponse.json();
    if (!mediaResponse.ok) throw new Error(mediaData.error?.message || "Could not fetch hashtag media.");
    res.json({ source: "Instagram Graph API hashtag top media", hashtag, items: (mediaData.data || []).slice(0, 10).map((item) => ({
      title: (item.caption || "Instagram post").split("\n")[0].slice(0, 140),
      url: item.permalink,
      type: item.media_type,
      publishedAt: item.timestamp,
      source: "Instagram",
      thumbnail: item.media_url
    })) });
  } catch (error) {
    res.status(502).json({ error: "Could not load Instagram hashtag media.", detail: error.message });
  }
});

app.get("/api/videos", async (req, res) => {
  const key = process.env.YOUTUBE_API_KEY;
  const query = String(req.query.q || "side hustle ideas").trim().slice(0, 120);
  if (!key) return res.status(503).json({ error: "YouTube search is not configured.", detail: "Add YOUTUBE_API_KEY to .env to enable live YouTube results." });
  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "8");
    url.searchParams.set("order", "relevance");
    url.searchParams.set("q", query);
    url.searchParams.set("key", key);
    const response = await fetch(url, { signal: AbortSignal.timeout(12_000) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "YouTube API request failed.");
    res.json({ source: "YouTube Data API", items: (data.items || []).map((item) => ({
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      url: "https://www.youtube.com/watch?v=" + item.id.videoId
    })) });
  } catch (error) {
    res.status(502).json({ error: "Could not load YouTube videos.", detail: error.message });
  }
});

app.post("/api/ideas/generate", async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({
    error: "AI generation is not configured.",
    detail: "Add ANTHROPIC_API_KEY to .env. The key stays on the server and is never sent to the browser."
  });
  const category = String(req.body?.category || "any category").slice(0, 80);
  const interests = String(req.body?.interests || "beginner-friendly, low-cost ideas").slice(0, 300);
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: 1400,
      system: "You create realistic side-hustle ideas. Return only valid JSON: an array of 3 objects with keys title, category, emoji, demand, level, time, income, rate, description, first, steps, video. steps must be an array of exactly 4 concise strings. rate is an integer from 50 to 99. Do not guarantee earnings; use realistic, clearly approximate ranges. No markdown fences.",
      messages: [{ role: "user", content: "Create three distinct side-hustle ideas for category: " + category + ". User preferences: " + interests + ". Keep them actionable and honest." }]
    });
    const raw = response.content.filter((part) => part.type === "text").map((part) => part.text).join("\n");
    const ideas = JSON.parse(raw.slice(raw.indexOf("["), raw.lastIndexOf("]") + 1));
    if (!Array.isArray(ideas)) throw new Error("AI response was not an array.");
    res.json({ ideas: ideas.slice(0, 3).map((idea, index) => ({
      ...idea,
      id: Date.now() + index,
      category: categoriesSafe(idea.category),
      emoji: typeof idea.emoji === "string" ? idea.emoji.slice(0, 8) : "✨",
      rate: Math.max(50, Math.min(99, Number(idea.rate) || 70)),
      steps: Array.isArray(idea.steps) ? idea.steps.slice(0, 4).map((step) => String(step).slice(0, 180)) : []
    })) });
  } catch (error) {
    res.status(502).json({ error: "AI idea generation failed.", detail: error.message });
  }
});
function categoriesSafe(value) {
  const allowed = ["Creator economy", "Digital services", "AI & tech", "E-commerce"];
  return allowed.includes(value) ? value : "Digital services";
}

app.use(express.static("dist"));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile("index.html", { root: "dist" }, (error) => { if (error) next(); });
});
app.listen(port, () => console.log("Hustle Feed API listening on http://localhost:" + port));
