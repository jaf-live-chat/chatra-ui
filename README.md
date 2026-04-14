# JAF Chatra Client

Frontend application for the JAF Chatra dashboard and embedded live chat widget.

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS v4
- MUI + Radix UI components
- Socket.IO client

## Prerequisites

- Node.js 20+
- npm 10+

## Install

```bash
npm install
```

## Environment Variables

This project reads variables from `client/.env`.

Example:

```env
VITE_MODE=LOCAL

# Backend API URL
VITE_API_URL_LOCAL=http://localhost:8000/api/v1
VITE_API_DEVELOPMENT_URL=https://chatra-api.onrender.com/api/v1
VITE_API_PROD_URL=TBD
```

### Environment resolution

- `VITE_MODE` can be `LOCAL`, `DEVELOPMENT`, or `PRODUCTION`.
- API base URL resolves in this order:
  - `PRODUCTION` -> `VITE_API_PROD_URL` (fallback: `VITE_API_URL_LOCAL`)
  - `DEVELOPMENT` -> `VITE_API_DEVELOPMENT_URL` (fallback: `VITE_API_URL_LOCAL`)
  - `LOCAL` -> `VITE_API_URL_LOCAL`

## Scripts

- `npm run dev` - Start Vite dev server (default port `3001`)
- `npm run build` - Build frontend app
- `npm run build:widget` - Build embeddable widget bundle (`dist/widget.js`)

## Run Locally

```bash
# from /client
npm install
npm run dev
```

Open `http://localhost:3001`.

## Build

```bash
# app build
npm run build

# widget build
npm run build:widget
```

Widget output is generated at `client/dist/widget.js`.

## Project Highlights

- Main app entry: `src/main.tsx`
- API base URL logic: `src/constants/constants.ts`
- Widget entry build target: `src/widgets/embed/widgetEntry.tsx`

## Troubleshooting

- Blank data or API failures:
  - Verify backend is running and `VITE_API_URL_LOCAL` matches backend URL.
- CORS issues in local development:
  - Ensure backend is started and reachable at `http://localhost:8000`.
- Widget script not updating:
  - Re-run `npm run build:widget` and redeploy `dist/widget.js`.

## Related Workspace Commands

From the repository root, you can run client and server together:

```bash
npm run dev
```

This uses the root script with `concurrently`.
 
