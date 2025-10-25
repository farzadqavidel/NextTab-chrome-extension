# Discord Bot / Site-Project

This repository contains a Discord bot and a small website API used to display server statistics and receive suggestions.

Quick start

1. Copy `.env.example` to `.env` and set `DISCORD_BOT_TOKEN`, `GUILD_ID`, etc.
2. Install dependencies:

```powershell
npm install
```

3. Run locally:

```powershell
node bot.js
# or
node api.js
```

Notes
- This project forwards console logs to Discord channels if configured via environment variables.
- Add your GitHub repo and CI as needed.
