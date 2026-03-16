# EchoType

EchoType is a lightweight browser-based typing practice app.

## What it includes

- Clean single-page typing interface
- Real-time typing stats (speed, accuracy, progress)
- Theme support and modern UI styling
- Performance charting with Chart.js

## Run locally

1. Open `echotype.html` in your browser.
2. Start typing in the test area.

No build step or installation is required.

## Deploy on Vercel

This project is configured for Vercel using [vercel.json](vercel.json), which maps `/` to [echotype.html](echotype.html).

### Option 1: Deploy from GitHub (recommended)

1. Push this repository to GitHub.
2. In Vercel, click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Keep the default settings and click **Deploy**.

### Option 2: Deploy with Vercel CLI

1. Install the CLI:
	`npm i -g vercel`
2. In this project folder, run:
	`vercel`
3. For production deploys, run:
	`vercel --prod`
