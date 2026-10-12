import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight, ArrowRight, Bookmark, Check, ChevronDown, Clock3,
  Compass, Flame, Lightbulb, Menu, Play, Plus, Search, Sparkles,
  TrendingUp, Wallet, X, Zap
} from "lucide-react";

const categories = ["All ideas", "Creator economy", "Digital services", "AI & tech", "E-commerce"];

const initialIdeas = [
  { id: 1, title: "Short-form video editing", category: "Creator economy", emoji: "🎬", demand: "High demand", level: "Beginner", time: "4–6 hrs / week", income: "$300–$1,500/mo", rate: 92, description: "Turn raw clips into scroll-stopping Reels, Shorts, and TikToks for creators and small businesses.", first: "Create three sample edits in different styles and publish them as a mini portfolio.", steps: ["Choose a niche such as fitness, food, or real estate", "Build three before-and-after editing samples", "Pitch 10 creators or local businesses", "Offer a starter package with clear deliverables"], video: "Video editing for beginners" },
  { id: 2, title: "AI workflow setup", category: "AI & tech", emoji: "🤖", demand: "Rising fast", level: "Intermediate", time: "3–5 hrs / week", income: "$500–$2,500/mo", rate: 89, description: "Help small teams automate repetitive admin tasks using no-code tools and AI assistants.", first: "Map one repetitive task for a real business and build a tiny working demo.", steps: ["Learn one automation platform", "Pick a narrow workflow to solve", "Record a 2-minute demo", "Offer a fixed-price pilot to a small business"], video: "No-code automation tutorial" },
  { id: 3, title: "Notion templates", category: "Digital services", emoji: "🧩", demand: "Steady demand", level: "Beginner", time: "2–4 hrs / week", income: "$100–$900/mo", rate: 78, description: "Package a useful system for students, freelancers, or teams and sell it as a downloadable template.", first: "Build one template that solves a specific problem you know well.", steps: ["Choose a clear audience and use case", "Build and test a simple template", "Create screenshots and a walkthrough", "List it on a digital marketplace"], video: "How to sell digital templates" },
  { id: 4, title: "UGC for small brands", category: "Creator economy", emoji: "📱", demand: "High demand", level: "Beginner", time: "3–6 hrs / week", income: "$250–$2,000/mo", rate: 86, description: "Make authentic product demos and testimonials that brands can use in their own social ads.", first: "Film two sample product videos using items you already own.", steps: ["Pick two product categories", "Shoot a hook, demo, and call-to-action", "Create a simple portfolio page", "Contact brands with a specific creative idea"], video: "UGC creator starter guide" },
  { id: 5, title: "Local business websites", category: "Digital services", emoji: "💻", demand: "Steady demand", level: "Intermediate", time: "5–8 hrs / week", income: "$500–$3,000/project", rate: 83, description: "Build clean, mobile-friendly landing pages for service businesses that need more leads.", first: "Redesign one local business homepage as a concept project.", steps: ["Pick a business niche", "Create a reusable landing page layout", "Prepare a before-and-after mockup", "Reach out with a specific improvement"], video: "Landing page design walkthrough" },
  { id: 6, title: "Print-on-demand niche shop", category: "E-commerce", emoji: "👕", demand: "Competitive", level: "Intermediate", time: "4–7 hrs / week", income: "$50–$1,000/mo", rate: 70, description: "Create original designs for a specific community and sell products without holding inventory.", first: "Research a niche and validate three original design concepts before listing.", steps: ["Research a focused audience", "Create original, rights-safe designs", "Publish a small test collection", "Use customer feedback to improve listings"], video: "Print-on-demand business basics" },
  { id: 7, title: "Spreadsheet cleanup & dashboards", category: "Digital services", emoji: "📊", demand: "Steady demand", level: "Beginner", time: "2–5 hrs / week", income: "$150–$800/project", rate: 80, description: "Turn messy spreadsheets into clear trackers, reports, and lightweight dashboards for busy teams.", first: "Make a sample dashboard with fictional data and show the time-saving result.", steps: ["Choose a common reporting problem", "Build a polished sample workbook", "Document the process and outcome", "Offer a small cleanup package"], video: "Spreadsheet dashboard tutorial" },
  { id: 8, title: "Micro-SaaS validation", category: "AI & tech", emoji: "🛠️", demand: "Long-term upside", level: "Advanced", time: "6–10 hrs / week", income: "Variable; recurring potential", rate: 75, description: "Solve one narrow workflow problem with a small subscription software product.", first: "Interview five potential users before writing any code.", steps: ["Find a repeated, expensive pain point", "Talk to potential users", "Build the smallest useful prototype", "Test willingness to pay before scaling"], video: "Validate a SaaS idea before building" }
];

const filters = [
  { label: "All ideas", icon: Compass },
  { label: "Trending now", icon: Flame },
  { label: "Saved", icon: Bookmark }
];

function App() {
  const [ideas, setIdeas] = useState(initialIdeas);
  const [activeFilter, setActiveFilter] = useState("All ideas");
  const [activeCategory, setActiveCategory] = useState("All ideas");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState([2, 5]);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [trendItems, setTrendItems] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendError, setTrendError] = useState("");
  const [trendGeo, setTrendGeo] = useState("US");
  const [instagramItems, setInstagramItems] = useState([]);
  const [instagramError, setInstagramError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [apiHealth, setApiHealth] = useState(null);
  const [videoResults, setVideoResults] = useState([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState("");

  const visibleIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      const matchesFilter =
        activeFilter === "Saved" ? saved.includes(idea.id) :
        activeFilter === "Trending now" ? idea.rate >= 83 : true;
      const matchesCategory = activeCategory === "All ideas" || idea.category === activeCategory;
      const term = search.trim().toLowerCase();
      const matchesSearch = !term || [idea.title, idea.category, idea.description].some((value) => value.toLowerCase().includes(term));
      return matchesFilter && matchesCategory && matchesSearch;
    });
  }, [ideas, activeFilter, activeCategory, search, saved]);

  const toggleSaved = (id) => {
    setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const discoverIdea = () => {
    const pool = initialIdeas.filter((idea) => !ideas.some((existing) => existing.id === idea.id));
    if (!pool.length) {
      setToast("You're all caught up — explore a category or search the feed.");
      window.setTimeout(() => setToast(""), 2800);
      return;
    }
    const next = pool[Math.floor(Math.random() * pool.length)];
    setIdeas((current) => [next, ...current]);
    setActiveFilter("All ideas");
    setActiveCategory("All ideas");
    setToast("A fresh idea has been added to your feed.");
    window.setTimeout(() => setToast(""), 2800);
  };

  useEffect(() => {
    fetch("/api/health").then((response) => response.json()).then(setApiHealth).catch(() => setApiHealth(null));
  }, []);

  const fetchLiveTrends = async () => {
    setTrendLoading(true);
    setTrendError("");
    setInstagramError("");
    try {
      const googleResponse = await fetch("/api/trends/google?geo=" + encodeURIComponent(trendGeo));
      const googleData = await googleResponse.json();
      if (!googleResponse.ok) throw new Error(googleData.detail || googleData.error || "Google Trends request failed.");
      setTrendItems(googleData.items || []);
    } catch (error) {
      setTrendError(error.message || "Could not load live trends.");
    }
    try {
      const instagramResponse = await fetch("/api/trends/instagram?hashtag=sidehustle");
      const instagramData = await instagramResponse.json();
      if (!instagramResponse.ok) throw new Error(instagramData.detail || instagramData.error || "Instagram request failed.");
      setInstagramItems(instagramData.items || []);
    } catch (error) {
      setInstagramItems([]);
      setInstagramError(error.message || "Instagram data is unavailable.");
    }
    setTrendLoading(false);
  };

  const generateAIideas = async () => {
    setAiLoading(true);
    setAiError("");
    try {
      const response = await fetch("/api/ideas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: activeCategory === "All ideas" ? "any category" : activeCategory, interests: "practical, realistic, actionable side hustles" })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.error || "AI generation failed.");
      if (!Array.isArray(data.ideas) || !data.ideas.length) throw new Error("The AI returned no ideas.");
      setIdeas((current) => [...data.ideas, ...current]);
      setActiveFilter("All ideas");
      setActiveCategory("All ideas");
      setToast("Added " + data.ideas.length + " AI-generated ideas to your feed.");
      window.setTimeout(() => setToast(""), 3200);
    } catch (error) {
      setAiError(error.message || "Could not generate ideas.");
    } finally {
      setAiLoading(false);
    }
  };

  const fetchVideos = async () => {
    if (!activeIdea) return;
    setVideoLoading(true);
    setVideoError("");
    setVideoResults([]);
    try {
      const response = await fetch("/api/videos?q=" + encodeURIComponent(activeIdea.video || activeIdea.title));
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.error || "YouTube search failed.");
      setVideoResults(data.items || []);
      if (!data.items?.length) setVideoError("No matching videos were returned.");
    } catch (error) {
      setVideoError(error.message || "Could not load videos.");
    } finally {
      setVideoLoading(false);
    }
  };

  const activeIdea = selected ? ideas.find((idea) => idea.id === selected) : null;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <a className="brand" href="#" aria-label="Hustle Feed home">
          <span className="brand-mark"><Zap size={19} fill="currentColor" /></span>
          <span>hustle<span className="brand-light">feed</span><i>.</i></span>
        </a>
        <div className="sidebar-label">DISCOVER</div>
        <nav className="side-nav" aria-label="Feed filters">
          {filters.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${activeFilter === label ? "nav-active" : ""}`} onClick={() => { setActiveFilter(label); setMenuOpen(false); }}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {label === "Saved" && <span className="nav-count">{saved.length}</span>}
              {label === "Trending now" && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-label category-label">CATEGORIES</div>
        <nav className="category-nav" aria-label="Idea categories">
          {categories.map((category) => (
            <button key={category} className={`category-item ${activeCategory === category ? "category-active" : ""}`} onClick={() => { setActiveCategory(category); setActiveFilter("All ideas"); setMenuOpen(false); }}>
              <span className="category-bullet" />{category}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon"><Sparkles size={18} /></div>
            <strong>Your next chapter starts here.</strong>
            <p>Small steps. Real momentum.</p>
            <button onClick={discoverIdea}>Find an idea <ArrowRight size={14} /></button>
          </div>
          <div className="sidebar-foot"><span className="status-dot" /> Built for the doers <span>v1.0</span></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu icon-button" aria-label="Open menu" onClick={() => setMenuOpen((open) => !open)}><Menu size={21} /></button>
          <div className="breadcrumb">Workspace <span>/</span> <strong>{activeFilter === "All ideas" ? activeCategory : activeFilter}</strong></div>
          <div className="topbar-right">
            <span className="today-label"><span className="status-dot" /> Your next move awaits</span>
            <div className="avatar">N</div>
          </div>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> THE OPPORTUNITY FEED</div>
            <h1>Make your next move<br /><span>your best one.</span></h1>
            <p>Side-hustle ideas worth your time, with a clear first step to get you moving.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={discoverIdea}><Sparkles size={16} /> Discover an idea <ArrowRight size={16} /></button>
              <button className="secondary-button" onClick={generateAIideas} disabled={aiLoading}><Sparkles size={15} /> {aiLoading ? "Generating..." : "Generate with AI"}</button>
              <div className="hero-proof"><span className="proof-avatars"><i>N</i><i>↗</i><i>✦</i></span><span>Built for curious minds</span></div>
            </div>
          </div>
          <div className="hero-art" aria-label="Illustration of growth and progress">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="art-spark spark-one">✳</div><div className="art-spark spark-two">✦</div>
            <div className="art-panel">
              <div className="art-panel-top"><span>WEEKLY MOMENTUM</span><TrendingUp size={15} /></div>
              <div className="art-chart"><div style={{height:"30%"}} /><div style={{height:"43%"}} /><div style={{height:"38%"}} /><div style={{height:"58%"}} /><div style={{height:"50%"}} /><div style={{height:"76%"}} /><div style={{height:"94%"}} /></div>
              <div className="art-panel-bottom"><strong>Start small.</strong><span>Keep going ↗</span></div>
            </div>
            <div className="floating-note"><span className="note-icon"><Lightbulb size={17} /></span><span><strong>One idea.</strong><small>One step today.</small></span></div>
            <div className="art-orb"><ArrowDownRight size={26} /></div>
          </div>
          <div className="hero-index">01 <span>—</span> FIND YOUR EDGE</div>
        </section>

        <section className="stats-row" aria-label="Feed statistics">
          <div className="stat-item"><span className="stat-icon"><Compass size={17} /></span><div><strong>{ideas.length.toString().padStart(2, "0")}</strong><small>Curated ideas</small></div></div>
          <div className="stat-item"><span className="stat-icon stat-orange"><Flame size={17} /></span><div><strong>{ideas.filter((idea) => idea.rate >= 83).length.toString().padStart(2, "0")}</strong><small>Trending picks</small></div></div>
          <div className="stat-item"><span className="stat-icon stat-purple"><Bookmark size={17} /></span><div><strong>{saved.length.toString().padStart(2, "0")}</strong><small>Saved for later</small></div></div>
          <div className="stat-note"><span className="live-pulse" /> Fresh perspective, every day</div>
        </section>

        <section className="live-section">
          <div className="live-heading">
            <div><div className="eyebrow section-eyebrow">LIVE SIGNALS</div><h2>What people are searching<span>.</span></h2><p>Pull current public trend signals and turn them into your next experiment.</p></div>
            <div className="live-actions">
              <select value={trendGeo} onChange={(event) => setTrendGeo(event.target.value)} aria-label="Google Trends region">
                <option value="US">United States</option><option value="IN">India</option><option value="GB">United Kingdom</option><option value="CA">Canada</option><option value="AU">Australia</option>
              </select>
              <button className="secondary-button" onClick={fetchLiveTrends} disabled={trendLoading}><TrendingUp size={15} /> {trendLoading ? "Refreshing..." : "Refresh trends"}</button>
            </div>
          </div>
          {trendError && <p className="api-error">{trendError}</p>}
          {trendItems.length > 0 ? <div className="trend-list">
            {trendItems.slice(0, 8).map((item, index) => <a className="trend-row" key={item.title + index} href={item.url || "#"} target="_blank" rel="noreferrer"><span className="trend-rank">{String(index + 1).padStart(2, "0")}</span><span className="trend-title">{item.title}<small>{item.source || "Google Trends"}</small></span><span className="trend-traffic">{item.traffic || "Trending"}</span><ArrowRight size={15} /></a>)}
          </div> : <div className="trend-placeholder"><TrendingUp size={19} /><span>{trendLoading ? "Loading public Google Trends feed..." : "Refresh trends to load current Google searches."}</span></div>}
          <div className="instagram-line"><div><strong>Instagram hashtag signals</strong><p>{instagramItems.length ? "Showing top media for #sidehustle." : instagramError || "Optional: connect a professional account in .env to query hashtag media."}</p></div>{instagramItems.length > 0 && <span className="instagram-count">{instagramItems.length} posts</span>}</div>
          {instagramItems.length > 0 && <div className="instagram-grid">{instagramItems.slice(0, 4).map((item, index) => <a key={item.url || index} href={item.url} target="_blank" rel="noreferrer" className="instagram-card">{item.thumbnail && <img src={item.thumbnail} alt="" loading="lazy" />}<span>{item.title || "Instagram post"}</span></a>)}</div>}
          <div className="live-footnote">Google Trends uses its public trending RSS feed. Instagram results require an eligible Meta Graph API setup; this does not scrape arbitrary Reels.</div>
          {apiHealth && <div className="service-status"><span className={apiHealth.services?.ai ? "service-on" : ""} /> AI {apiHealth.services?.ai ? "connected" : "needs API key"} <span className={apiHealth.services?.youtube ? "service-on" : ""} /> YouTube {apiHealth.services?.youtube ? "connected" : "needs API key"} <span className={apiHealth.services?.instagram ? "service-on" : ""} /> Instagram {apiHealth.services?.instagram ? "connected" : "optional setup"}</div>}
          {aiError && <p className="api-error">{aiError}</p>}
        </section>

        <section className="feed-section">
          <div className="section-heading">
            <div><div className="eyebrow section-eyebrow">YOUR STARTING POINT</div><h2>{activeFilter === "Saved" ? "Ideas you saved" : activeFilter === "Trending now" ? "Making moves right now" : "Explore the feed"}<span>.</span></h2><p>Find a fit. Take the first step. Build from there.</p></div>
            <div className="feed-tools">
              <label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ideas..." aria-label="Search ideas" /><kbd>⌘ K</kbd></label>
              <button className="sort-button" onClick={() => { setActiveCategory("All ideas"); setActiveFilter("Trending now"); }}>Trending <ChevronDown size={15} /></button>
            </div>
          </div>
          <div className="category-pills">
            {categories.map((category) => <button key={category} className={`pill ${activeCategory === category ? "pill-active" : ""}`} onClick={() => { setActiveCategory(category); setActiveFilter("All ideas"); }}>{category}</button>)}
          </div>

          {visibleIdeas.length ? <div className="idea-grid">
            {visibleIdeas.map((idea, index) => (
              <article className="idea-card" key={idea.id}>
                <div className="card-topline"><span className={`trend-tag ${idea.rate >= 85 ? "trend-hot" : ""}`}>{idea.rate >= 85 ? <Flame size={12} fill="currentColor" /> : <TrendingUp size={12} />}{idea.demand}</span><button className={`save-button ${saved.includes(idea.id) ? "is-saved" : ""}`} aria-label={saved.includes(idea.id) ? "Remove saved idea" : "Save idea"} onClick={() => toggleSaved(idea.id)}><Bookmark size={17} fill={saved.includes(idea.id) ? "currentColor" : "none"} /></button></div>
                <div className="idea-visual"><div className={`emoji-tile tile-${index % 4}`}>{idea.emoji}</div><div className="visual-lines"><span /><span /><span /></div><span className="visual-number">0{index + 1}</span></div>
                <div className="idea-content"><div className="card-category">{idea.category}</div><h3>{idea.title}</h3><p>{idea.description}</p>
                  <div className="idea-meta"><span><Clock3 size={14} />{idea.time}</span><span className="level-dot" />{idea.level}</div>
                  <div className="card-footer"><div className="income"><small>EST. POTENTIAL</small><strong>{idea.income}</strong></div><button className="card-arrow" aria-label={`View ${idea.title}`} onClick={() => setSelected(idea.id)}><ArrowRight size={18} /></button></div>
                  <button className="view-details" onClick={() => setSelected(idea.id)}>Explore this idea <ArrowRight size={14} /></button>
                </div>
              </article>
            ))}
          </div> : <div className="empty-state"><div className="empty-icon"><Search size={22} /></div><h3>No ideas found</h3><p>Try another search or category to uncover your next move.</p><button className="primary-button" onClick={() => { setSearch(""); setActiveCategory("All ideas"); setActiveFilter("All ideas"); }}>Reset feed <ArrowRight size={15} /></button></div>}

          <div className="bottom-cta"><div className="cta-icon"><Wallet size={20} /></div><div><strong>The best side hustle starts with a first step.</strong><p>Pick one idea, give it a week, and see what you learn.</p></div><button onClick={discoverIdea}>Surprise me <Plus size={16} /></button></div>
        </section>
        <footer className="footer"><a className="footer-brand" href="#">hustlefeed<i>.</i></a><span>Less scrolling. More building.</span><span>© 2026 Hustle Feed</span></footer>
      </main>

      {activeIdea && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
        <section className="idea-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <button className="modal-close icon-button" aria-label="Close details" onClick={() => setSelected(null)}><X size={20} /></button>
          <div className="modal-kicker"><span>{activeIdea.emoji}</span> YOUR NEXT OPPORTUNITY</div>
          <div className="modal-category">{activeIdea.category} · {activeIdea.level}</div>
          <h2 id="modal-title">{activeIdea.title}</h2>
          <p className="modal-description">{activeIdea.description}</p>
          <div className="modal-stats"><div><small>Potential</small><strong>{activeIdea.income}</strong></div><div><small>Time to start</small><strong>{activeIdea.time}</strong></div></div>
          <div className="first-step"><span className="first-step-icon"><Zap size={17} /></span><div><small>YOUR FIRST MOVE</small><p>{activeIdea.first}</p></div></div>
          <h3 className="roadmap-title">A simple action plan</h3>
          <ol className="roadmap">{activeIdea.steps.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p><Check size={15} /></li>)}</ol>
          <div className="learn-box"><Play size={17} /><div><strong>Keep learning</strong><p>Find practical walkthroughs for this idea on YouTube.</p></div><button className="video-search-button" onClick={fetchVideos} disabled={videoLoading}>{videoLoading ? "Searching..." : "Find videos"} <ArrowRight size={14} /></button></div>
          {videoError && <p className="api-error video-error">{videoError}</p>}
          {videoResults.length > 0 && <div className="video-results">{videoResults.map((video) => <a key={video.url} className="video-result" href={video.url} target="_blank" rel="noreferrer">{video.thumbnail && <img src={video.thumbnail} alt="" loading="lazy" />}<span><strong>{video.title}</strong><small>{video.channel}</small></span><Play size={15} /></a>)}</div>}
          <div className="modal-actions"><button className="primary-button" onClick={() => { toggleSaved(activeIdea.id); setToast(saved.includes(activeIdea.id) ? "Removed from saved ideas." : "Saved for your next session."); window.setTimeout(() => setToast(""), 2600); }}>{saved.includes(activeIdea.id) ? <Check size={16} /> : <Bookmark size={16} />}{saved.includes(activeIdea.id) ? "Saved for later" : "Save this idea"}</button><button className="text-button" onClick={() => setSelected(null)}>Back to feed</button></div>
          <p className="disclaimer">Earning ranges are illustrative estimates, not guarantees. Results depend on skills, market, effort, and execution.</p>
        </section>
      </div>}
      {toast && <div className="toast"><Check size={16} />{toast}</div>}
    </div>
  );
}

export default App;