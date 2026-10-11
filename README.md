# nohith-hustle
The app will curate trending side hustle ideas by pulling data and trends from Google and Instagram Reels, and then pair these ideas with relevant, educational YouTube video links so users can learn how to execute them

import { useState, useCallback } from "react";
 
const CATEGORIES = ["All", "Creator", "Freelance", "E-commerce", "Investing", "Local Services", "AI & Tech"];
 
const SEED_HUSTLES = [
  {
    id: 1, title: "Faceless YouTube channel", category: "Creator",
    desc: "Build a niche channel using AI voiceover + stock footage. Monetize with AdSense and sponsorships.",
    effort: "Medium", income: "$300–3k/mo", trend: "hot", score: 94,
    ytQuery: "how to start faceless youtube channel 2025",
    saved: false
  },
  {
    id: 2, title: "Digital products on Etsy", category: "E-commerce",
    desc: "Sell Notion templates, printables, or Canva packs. One-time creation, passive recurring sales.",
    effort: "Low", income: "$200–2k/mo", trend: "rising", score: 78,
    ytQuery: "how to sell digital products on etsy",
    saved: false
  },
  {
    id: 3, title: "UGC creator for brands", category: "Creator",
    desc: "Film product reviews for D2C brands. No following needed — brands pay per deliverable.",
    effort: "Low", income: "$500–5k/mo", trend: "hot", score: 91,
    ytQuery: "how to become ugc creator and get paid",
    saved: false
  },
  {
    id: 4, title: "AI automation consultant", category: "AI & Tech",
    desc: "Help local businesses automate workflows using Zapier, Make, and ChatGPT. High hourly rates.",
    effort: "High", income: "$1k–8k/mo", trend: "rising", score: 87,
    ytQuery: "how to start AI automation agency",
    saved: false
  },
  {
    id: 5, title: "Newsletter with sponsorships", category: "Creator",
    desc: "Build a niche email list and monetize via sponsors, affiliates, and paid tiers.",
    effort: "Medium", income: "$100–4k/mo", trend: "steady", score: 65,
    ytQuery: "how to start newsletter business and monetize",
    saved: false
  },
  {
    id: 6, title: "Freelance prompt engineer", category: "Freelance",
    desc: "Write and sell optimized AI prompts on PromptBase or directly to companies via Upwork.",
    effort: "Low", income: "$200–3k/mo", trend: "rising", score: 80,
    ytQuery: "how to make money as prompt engineer freelancer",
    saved: false
  },
];
 
const trendColors = {
  hot:    { bg: "#FAECE7", text: "#993C1D", icon: "ti-flame" },
  rising: { bg: "#EAF3DE", text: "#3B6D11", icon: "ti-trending-up" },
  steady: { bg: "#E6F1FB", text: "#185FA5", icon: "ti-minus" },
};
 
const effortColors = {
  Low:    { bg: "#E1F5EE", text: "#0F6E56" },
  Medium: { bg: "#FAEEDA", text: "#854F0B" },
  High:   { bg: "#FCEBEB", text: "#A32D2D" },
};
 
async function callClaude(messages, systemPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "";
}
 
export default function App() {
  const [hustles, setHustles] = useState(SEED_HUSTLES);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailText, setDetailText] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [tab, setTab] = useState("feed");
  const [genPrompt, setGenPrompt] = useState("");
 
  const filtered = hustles.filter(h => {
    const matchCat = category === "All" || h.category === category;
    const matchSearch = !search || h.title.toLowerCase().includes(search.toLowerCase()) || h.desc.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === "saved" ? h.saved : true;
    return matchCat && matchSearch && matchTab;
  });
 
  const toggleSave = (id) => {
    setHustles(prev => prev.map(h => h.id === id ? { ...h, saved: !h.saved } : h));
  };
 
  const openDetail = async (hustle) => {
    setDetail(hustle);
    setDetailText("");
    setDetailLoading(true);
    try {
      const text = await callClaude(
        [{ role: "user", content: `Give me a practical deep-dive on this side hustle: "${hustle.title}". Cover: 1) How to start in 7 days, 2) Exact tools/platforms needed (be specific), 3) How to get first paying customer or first $100, 4) Common mistakes to avoid, 5) Realistic 3-month income projection. Keep it actionable and concise.` }],
        "You are a side hustle expert coach. Be direct, practical, and specific. Use short paragraphs. No fluff."
      );
      setDetailText(text);
    } catch {
      setDetailText("Could not load details. Please try again.");
    }
    setDetailLoading(false);
  };
 
  const generateNew = useCallback(async () => {
    if (!genPrompt.trim()) return;
    setGenerating(true);
    try {
      const raw = await callClaude(
        [{ role: "user", content: `Generate 3 trending side hustle ideas related to: "${genPrompt}". Return ONLY a JSON array. Each object must have: title (string), category (one of: Creator, Freelance, E-commerce, Investing, Local Services, AI & Tech), desc (1 sentence, max 120 chars), effort (Low/Medium/High), income (e.g. "$200–2k/mo"), trend (hot/rising/steady), score (number 50-99), ytQuery (YouTube search string to find a tutorial). No markdown, no explanation, just the JSON array.` }],
        "You are a side hustle trend analyst. Return only valid JSON."
      );
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const newHustles = parsed.map((h, i) => ({
        ...h, id: Date.now() + i, saved: false,
      }));
      setHustles(prev => [...newHustles, ...prev]);
      setGenPrompt("");
    } catch {
      alert("Could not generate ideas. Try a different prompt.");
    }
    setGenerating(false);
  }, [genPrompt]);
 
  const ytUrl = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
 
  return (
    <div style={{ fontFamily: "var(--font-sans)", maxWidth: 420, margin: "0 auto", paddingBottom: 80, minHeight: "100vh", background: "var(--color-background-tertiary)" }}>
 
      {detail && (
        <div style={{ position: "absolute", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end" }} onClick={() => setDetail(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--color-background-primary)", borderRadius: "16px 16px 0 0", width: "100%", maxHeight: "82vh", overflowY: "auto", padding: "20px 20px 40px" }}>
            <div style={{ width: 36, height: 4, background: "var(--color-border-secondary)", borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, background: trendColors[detail.trend]?.bg, color: trendColors[detail.trend]?.text }}>
                <i className={`ti ${trendColors[detail.trend]?.icon}`} style={{ marginRight: 4, fontSize: 12 }} />
                {detail.trend}
              </span>
              <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, background: effortColors[detail.effort]?.bg, color: effortColors[detail.effort]?.text }}>{detail.effort} effort</span>
              <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, background: "#EEEDFE", color: "#3C3489" }}>{detail.income}</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 8px", color: "var(--color-text-primary)" }}>{detail.title}</h2>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 20, lineHeight: 1.6 }}>{detail.desc}</p>
 
            <a href={ytUrl(detail.ytQuery)} target="_blank" rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10, background: "#FAECE7", color: "#993C1D", fontWeight: 500, fontSize: 14, textDecoration: "none", marginBottom: 20, border: "none" }}>
              <i className="ti ti-player-play" style={{ fontSize: 16 }} aria-hidden="true" />
              Find tutorials on YouTube
              <i className="ti ti-external-link" style={{ fontSize: 14, marginLeft: "auto" }} aria-hidden="true" />
            </a>
 
            <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: "var(--color-text-primary)" }}>
                <i className="ti ti-robot" style={{ marginRight: 6, fontSize: 15 }} aria-hidden="true" />
                AI action plan
              </p>
              {detailLoading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-text-secondary)", fontSize: 14 }}>
                  <div style={{ width: 16, height: 16, border: "2px solid #534AB7", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Generating your plan...
                </div>
              ) : (
                <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>{detailText}</p>
              )}
            </div>
          </div>
        </div>
      )}
 
      <div style={{ padding: "20px 20px 0", background: "var(--color-background-primary)", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0, color: "var(--color-text-primary)" }}>Hustle Feed</h1>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "2px 0 0" }}>{hustles.length} ideas · AI-powered</p>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: "#3C3489" }}>YO</div>
        </div>
 
        <div style={{ display: "flex", gap: 8, marginBottom: 14, background: "var(--color-background-secondary)", borderRadius: 10, padding: "8px 12px", border: "0.5px solid var(--color-border-tertiary)", alignItems: "center" }}>
          <i className="ti ti-search" style={{ fontSize: 16, color: "var(--color-text-secondary)" }} aria-hidden="true" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ideas..." style={{ background: "none", border: "none", outline: "none", flex: 1, fontSize: 14, color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--color-text-secondary)" }}><i className="ti ti-x" style={{ fontSize: 16 }} /></button>}
        </div>
 
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 14, scrollbarWidth: "none" }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{ padding: "5px 14px", borderRadius: 20, fontSize: 13, border: "0.5px solid", borderColor: category === c ? "#534AB7" : "var(--color-border-secondary)", background: category === c ? "#534AB7" : "var(--color-background-primary)", color: category === c ? "#EEEDFE" : "var(--color-text-secondary)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
              {c}
            </button>
          ))}
        </div>
      </div>
 
      <div style={{ padding: "16px 16px 0", background: "var(--color-background-primary)", borderBottom: "0.5px solid var(--color-border-tertiary)", marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input value={genPrompt} onChange={e => setGenPrompt(e.target.value)} onKeyDown={e => e.key === "Enter" && generateNew()} placeholder='e.g. "photography" or "cooking"...' style={{ flex: 1, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "9px 14px", fontSize: 14, color: "var(--color-text-primary)", fontFamily: "var(--font-sans)", outline: "none" }} />
          <button onClick={generateNew} disabled={generating || !genPrompt.trim()} style={{ padding: "9px 16px", borderRadius: 10, background: generating ? "var(--color-background-secondary)" : "#534AB7", color: generating ? "var(--color-text-secondary)" : "#EEEDFE", border: "none", cursor: generating ? "default" : "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
            {generating ? <><div style={{ width: 14, height: 14, border: "2px solid #888", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Generating</> : <><i className="ti ti-sparkles" style={{ fontSize: 14 }} aria-hidden="true" /> Generate</>}
          </button>
        </div>
      </div>
 
      <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {tab === "saved" && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--color-text-secondary)" }}>
            <i className="ti ti-bookmark" style={{ fontSize: 32, display: "block", marginBottom: 12 }} aria-hidden="true" />
            <p style={{ margin: 0, fontSize: 14 }}>No saved hustles yet. Bookmark cards from the feed.</p>
          </div>
        )}
        {filtered.map(h => (
          <div key={h.id} onClick={() => openDetail(h)} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: 16, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 10 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 500, fontSize: 15, margin: "0 0 5px", color: "var(--color-text-primary)", lineHeight: 1.3 }}>{h.title}</p>
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>{h.desc}</p>
              </div>
              <span style={{ padding: "4px 9px", borderRadius: 20, fontSize: 12, background: trendColors[h.trend]?.bg, color: trendColors[h.trend]?.text, display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                <i className={`ti ${trendColors[h.trend]?.icon}`} style={{ fontSize: 12 }} aria-hidden="true" />
                {h.score}
              </span>
            </div>
 
            <div style={{ height: 3, background: "var(--color-background-secondary)", borderRadius: 2, marginBottom: 10, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${h.score}%`, background: "#7F77DD", borderRadius: 2 }} />
            </div>
 
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 12, background: effortColors[h.effort]?.bg, color: effortColors[h.effort]?.text }}>{h.effort}</span>
                <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 12, background: "#EEEDFE", color: "#3C3489" }}>{h.income}</span>
                <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 12, background: "var(--color-background-secondary)", color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-tertiary)" }}>{h.category}</span>
              </div>
              <button onClick={e => { e.stopPropagation(); toggleSave(h.id); }} style={{ width: 30, height: 30, borderRadius: 8, border: "0.5px solid", borderColor: h.saved ? "#534AB7" : "var(--color-border-tertiary)", background: h.saved ? "#EEEDFE" : "var(--color-background-primary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: h.saved ? "#534AB7" : "var(--color-text-secondary)" }}>
                <i className={`ti ${h.saved ? "ti-bookmark" : "ti-bookmark"}`} style={{ fontSize: 15, color: h.saved ? "#534AB7" : "var(--color-text-secondary)" }} aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
 
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 420, background: "var(--color-background-primary)", borderTop: "0.5px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-around", padding: "10px 0 18px", zIndex: 20 }}>
        {[
          { id: "feed", icon: "ti-home", label: "Feed" },
          { id: "saved", icon: "ti-bookmark", label: "Saved" },
          { id: "profile", icon: "ti-user", label: "Profile" },
        ].map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontSize: 11, color: tab === n.id ? "#534AB7" : "var(--color-text-secondary)", background: "none", border: "none", cursor: "pointer", padding: "4px 20px" }}>
            <i className={`ti ${n.icon}`} style={{ fontSize: 22 }} aria-hidden="true" />
            {n.label}
          </button>
        ))}
      </div>
 
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
 
