# Hustle Feed

A responsive side-hustle discovery dashboard built with React and Vite. Browse practical business ideas, filter by category, search the feed, save favorites, and open a step-by-step starter plan for each idea.

## Features
- Responsive dark dashboard with lime accents
- Curated ideas across creator economy, digital services, AI & tech, and e-commerce
- Search, category filters, trending view, and saved ideas
- Idea detail modal with a first action and four-step roadmap
- Discover action to add another curated idea
- Accessible labels, keyboard focus states, and reduced-motion support

## Run locally
Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Vite prints a local URL, usually `http://localhost:5173`.

Build and preview for production:

```bash
npm run build
npm run preview
```

## Project structure
```text
.
├── index.html
├── package.json
└── src
    ├── App.jsx
    ├── main.jsx
    └── styles.css
```

## Notes
- The feed uses curated sample data in `src/App.jsx`; it does not currently fetch live Google Trends, Instagram Reels, or YouTube results.
- Earning ranges are illustrative estimates, not guarantees.
- No API key is required for this demo. If you add AI or third-party APIs later, keep secret keys on a server or serverless function, never in browser code or committed source.

## Roadmap
- Persist saved ideas across devices
- Connect approved trend-data APIs
- Add authenticated AI generation through a server-side endpoint
- Add tests and automated build checks
