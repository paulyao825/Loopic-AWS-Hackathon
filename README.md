# Precious Frame - AI visual storytelling assistant

Precious Frame finds the best real photographs hidden inside videos. Upload a
video and the app extracts candidate frames, asks Qwen-VL to identify the
strongest and most varied moments, then improves each selected frame through a
visible critique-and-refine loop.

**Don't miss any frames.**

**We don't like AI-generated pics. We use AI to attract real-world clip photos.**

Precious Frame does not generate replacement scenes. Every result starts as a
real frame from the uploaded video.

## Current prototype

- extracts frames from uploaded videos with FFmpeg
- scores composition, authentic moments, action, and visual storytelling with Qwen3-VL Plus
- combines vision judgment with local sharpness, exposure, color, and activity measurements
- removes near-duplicates to return a varied photo set
- improves crop, exposure, contrast, saturation, temperature, and sharpness with Sharp
- streams every selection and edit round to the React interface
- falls back to local image analysis if the vision API is unavailable
- supports light and dark modes and links directly to the source repository

## Simple stack

| Part | Tool | Why it is here |
| --- | --- | --- |
| Web interface | React + Vite | Uploads, progress, comparisons, and final gallery |
| API | Express | Video upload, run orchestration, and SSE progress stream |
| Language | TypeScript | One typed codebase from UI to processing pipeline |
| Video processing | FFmpeg | Reliable extraction of actual video frames |
| Image processing | Sharp | Fast local crop, color, exposure, and detail edits |
| Vision model | Qwen3-VL Plus | Selects meaningful frames and judges edit quality |

Qwen-VL is the only external processing service. There are no wallet tools, paid
enhancement brokers, or extra cloud SDKs in the application.

## Required setup

Qwen-VL uses Alibaba Cloud Model Studio and requires a region-matched DashScope
API key.

1. Activate Alibaba Cloud Model Studio in the US (Virginia) region and create a DashScope API key.
2. Copy `.env.example` to `.env`.
3. Put the new key after `DASHSCOPE_API_KEY=`.
4. Keep `.env` local. It is ignored by Git.

```dotenv
DASHSCOPE_API_KEY=your-new-key
VISION_MODEL=qwen3-vl-plus
VISION_BASE_URL=https://dashscope-us.aliyuncs.com/compatible-mode/v1
```

The server calls the official OpenAI-compatible endpoint:

```txt
POST https://dashscope-us.aliyuncs.com/compatible-mode/v1/chat/completions
```

If `DASHSCOPE_API_KEY` is missing or a model request fails, the run continues with
local pixel scoring and reports the fallback in the interface.

## Run locally

Requires Node.js 22 or later.

```bash
npm install
npm run dev
```

- Web interface: `http://localhost:5173`
- API: `http://localhost:4000`

Production-style local run:

```bash
npm run build
npm start
```

The API then serves the built website at `http://localhost:4000`.

Useful checks:

```bash
npm test
npm run typecheck
npm run build
```

## Configuration

`precious-frame.config.json` is reloaded for each run:

```jsonc
{
  "judge": {
    "provider": "qwen",
    "model": "qwen3-vl-plus",
    "baseUrl": "https://dashscope-us.aliyuncs.com/compatible-mode/v1"
  },
  "loop": {
    "bar": 7.5,
    "maxRounds": 8
  }
}
```

Set `VISION_PROVIDER=heuristic` only when an entirely offline run is required.

## How it works

Precious Frame uses one reusable loop:

```txt
act -> observe -> score -> correct -> repeat
```

| Loop | Goal | Output |
| --- | --- | --- |
| Loop 1 | Combine Qwen-VL aesthetic judgment, local image quality, and diversity | Candidate photos |
| Loop 2 | Judge and improve each candidate through bounded edits | Refined photos |

Loop 1 sends small batches of extracted images to Qwen3-VL Plus. The model scores
composition, a clear subject, human emotion or action, and storytelling value.
The pipeline combines that score with local measurements and removes visually
similar frames.

Loop 2 changes one parameter at a time. Qwen-VL evaluates crop and framing,
exposure, contrast, color, white balance, and sharpness, then returns a concrete
direction such as `brighten`, `tighten`, or `warmer`. Sharp applies that change
to the original frame. The loop stops when it clears the score bar or reaches
the round cap.

## Deployment

The included `Dockerfile` serves both the API and built website from one common
Node.js container. Deploy it to a long-running container host such as Railway,
Render, or Fly.io and add `DASHSCOPE_API_KEY` as a secret environment variable.

The application accepts large video uploads and keeps a live SSE stream open
while frames are processed. A static website host can serve the React frontend,
but the processing API still needs a long-running container. Set
`VITE_API_BASE` to that API URL when deploying the frontend separately.

## What's next for Precious Frame

The current prototype focuses on finding and improving strong moments. The
larger direction is a complete AI visual storytelling assistant.

1. **Personalized AI aesthetic model** - learn from saved photos, preferred
   styles, previous edits, and engagement patterns to understand what makes a
   photo feel like each user.
2. **Advanced style transformation** - create CCD camera aesthetics, Y2K
   styles, film photography, cinematic color grading, editorial looks, meme
   templates, and platform-specific formats.
3. **Intelligent content repurposing** - prepare Instagram posts, TikTok and
   YouTube thumbnails, profile photos, highlight covers, and promotional assets.
4. **AI creative assistant for professionals** - support photo culling, batch
   editing suggestions, consistent style matching, client preferences, and
   faster post-production.
5. **Photo intelligence SDK** - let camera apps, creator tools, social
   platforms, sports and event products, and memory or travel apps understand
   which moments matter.

Today, Precious Frame finds the best photos hidden inside videos. Tomorrow, it
becomes the AI that understands every visual moment worth remembering.

## Repository layout

```txt
server/src/core/loop.ts          reusable act/observe/score/correct loop
server/src/loops/                frame selection and edit refinement
server/src/backends/             Qwen-VL judge/scorer and Sharp editor
server/src/media/                FFmpeg extraction and image analysis
server/src/api/                  run orchestration and streamed event types
server/src/server.ts             Express API, uploads, SSE, and static web
web/                             React + Vite interface
```
