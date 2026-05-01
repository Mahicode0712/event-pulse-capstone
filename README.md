# EventPulse

EventPulse is a full-stack-ready React app for discovering events and concerts using the Ticketmaster Discovery API.

## Features

- Home page with hero search, featured events, categories, and trending cities
- Browse/search events with debounce, filters, sort, skeleton loading, and pagination
- Event detail page with buy/save/share actions and related events
- Protected saved page with local auth and saved-by-category chart (Recharts)
- Redux Toolkit slices for events, filters, auth, saved events, and theme
- Dark mode with localStorage persistence
- Toast notifications and graceful API error handling (including 429 rate limits)

## Tech Stack

- React + Vite (JavaScript)
- Redux Toolkit + React Redux
- React Router v6
- Axios
- Tailwind CSS
- Recharts
- React Hot Toast
- React Icons

## Setup

1. Install dependencies:
   - `npm install`
2. Add environment variable in `.env`:
   - `VITE_TICKETMASTER_API_KEY=your_api_key_here`
3. Start development server:
   - `npm run dev`
4. Create production build:
   - `npm run build`

## Deployment

This app is Vercel and Netlify compatible.

## API Attribution

Powered by [Ticketmaster Discovery API](https://developer.ticketmaster.com/).

## Live Link

Add your deployed URL here after publishing.
