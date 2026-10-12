# Hustle Feed

A responsive side-hustle discovery dashboard built with React, Vite, and a small Express API. Explore curated ideas, load current Google search-trend signals, generate ideas with Anthropic, and find learning videos on YouTube.

## Features

- Responsive dark dashboard with lime accents
- Curated side-hustle ideas, category filters, search, trending view, and saved ideas
- Step-by-step starter plans for each idea
- Google Trends public trending RSS feed, with region selection
- Optional Instagram Graph API hashtag media for an eligible connected professional account
- AI-generated ideas through a server-side Anthropic API route
- YouTube Data API search for learning videos
- Server-side secret handling, request rate limiting, and service status indicators

## Requirements

- Node.js 18 or newer
- API credentials only for the optional integrations you want to use

## Local setup

```bash
git clone https://github.com/nohith/nohith-hustle.git
cd nohith-hustle
npm install
cp .env.example .env
```

Open `.env` and add the keys for the services you want to enable. Never commit `.env`; it is ignored by Git.

Start the frontend and API together:

```bash
npm run dev:all
```

Vite prints the frontend URL (usually `http://localhost:5173`). The API runs on `http://localhost:8787`.

Alternatively, run each process in a separate terminal:

```bash
npm run server
npm run dev
```

## Configure integrations

### Google Trends

The app reads the public Google Trends trending RSS feed. No API key is needed. The UI offers region choices such as US, India, UK, Canada, and Australia.

This is a public RSS feed, not an official, guaranteed Google Trends API. Availability and feed structure can change.

### Anthropic AI idea generation

Create an API key in the [Anthropic Console](https://console.anthropic.com/) and set it in `.env`:

```dotenv
ANTHROPIC_API_KEY=your_key_here
ANTHROPIC_MODEL=claude-haiku-4-5-20251001
```

The key is read by Express on the server and is never embedded in frontend JavaScript. The Generate with AI button adds generated ideas to the feed.

### YouTube learning videos

Enable the YouTube Data API in [Google Cloud Console](https://console.cloud.google.com/) and set:

```dotenv
YOUTUBE_API_KEY=your_key_here
```

Open any idea and select **Find videos** to retrieve relevant YouTube results. Protect and restrict the API key in Google Cloud.

### Instagram hashtag media (optional)

This requires an eligible Instagram professional account and Meta Graph API permissions. Set the access token and account user ID in `.env`:

```dotenv
INSTAGRAM_ACCESS_TOKEN=your_token_here
INSTAGRAM_USER_ID=your_instagram_user_id
```

The app requests top media for the `sidehustle` hashtag. Instagram's API does **not** provide a general public Reels-trending firehose; permissions, eligible accounts, and Meta API rules apply. If the integration is not configured, the dashboard explains what is missing.

## Build and production

```bash
npm run build
npm start
```

The Express server serves the built frontend from `dist` and handles `/api/*` routes. Set `PORT` if your hosting provider requires a specific port. Deploy this as a Node.js web service; a static-only host cannot run the server-side integrations.

## Project structure

```text
.
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── server
│   └── index.js
└── src
    ├── App.jsx
    ├── main.jsx
    └── styles.css
```

## Notes

- Earnings displayed in the sample feed are illustrative, not guaranteed outcomes.
- Live trends and video search require network access to the upstream providers.
- Keep all API keys in server environment variables. Never use `VITE_*` prefixes for secrets.
- AI-generated ideas should be validated against real customer demand, costs, and local rules before investing money.
