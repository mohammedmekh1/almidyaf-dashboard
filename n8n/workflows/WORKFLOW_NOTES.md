# Islamic Shorts Workflow — n8n

**Workflow ID:** `zQRGyGXZsYH1MGKp`
**n8n URL:** `https://n8n.srv1332143.hstgr.cloud/`

## Current Stack

| Step | Service | Model/Config |
|------|---------|-------------|
| Content generation | OpenAI | GPT-4o |
| Text-to-Speech | ElevenLabs | `eleven_multilingual_v2`, Voice: `rFDdsCQRZCUL8cPOWtnP` |
| Audio storage | Google Drive | Auto-upload + public share |
| Speech-to-Video | KIE.ai | `kling/ai-avatar-pro` — 1080P @ $0.08/s |
| Logging | Google Sheets | Sheet: "Islamic Shorts", Tab: "logs" |

## KIE Model: kling/ai-avatar-pro

- **Why chosen:** Best quality/price for lip-sync speech-to-video
- **Pricing:** $0.04/s (720P Standard) / $0.08/s (1080P Pro)
- **Previous model:** `wan/2-2-a14b-speech-to-video-turbo` ($0.12/s) — was failing with Internal Error
- **Savings:** ~33% cheaper even at 1080P vs old model at 720P
- **API params:** `image_url`, `audio_url`, `prompt`, `aspect_ratio: "9:16"`, `mode: "pro"`

## Fixes Applied (2026-10-04)

1. `Log Video Failure` — changed sheet from `ideas` to `logs`, changed op from `update` to `append`
2. ElevenLabs TTS — replaced KIE audio with direct ElevenLabs API
3. `Increment Poll Count` — now carries idea context (`$('Extract Audio URL').first().json`)
4. `voiceover_ok` range — expanded from 27–32 to 20–50 words
5. KIE model — switched to `kling/ai-avatar-pro`

## Flow

```
Schedule (9PM) → Trigger Normalizer → Get Config → Get Ideas
→ Smart Classifier → Lock Idea → OpenAI Content
→ Parse Gemini Output → Quality Gate
→ ElevenLabs TTS → Google Drive Upload → Share Audio → Extract URL
→ KIE Create Video → [Wait 30s → Poll → Increment] loop
→ Success? → Log Success / Log Video Failure
```
