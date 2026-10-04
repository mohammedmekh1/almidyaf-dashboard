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

## Architecture: Split Workflow (2026-10-04 refactor)

n8n has a 5-minute execution timeout. `kling/ai-avatar-pro` takes ~8 minutes.
Solution: split into two workflows.

### Workflow 1 — Main (`zQRGyGXZsYH1MGKp`)
```
Schedule (9PM) → Trigger Normalizer → Get Config → Get Ideas
→ Smart Classifier → Lock Idea → OpenAI Content
→ Parse Gemini Output → Quality Gate
→ ElevenLabs TTS → Google Drive Audio Upload → Share Audio → Extract URL
→ KIE Create Video → Save Pending Task (logs sheet, action=pending_kie)
→ END (no polling loop — avoids 5-min timeout)
```

Saves to `logs` sheet: `job_id=KIE_task_id`, `action=pending_kie`, `notes=JSON context blob`

### Workflow 2 — KIE Checker (`3vutRqQotisSlwZM`)
```
Schedule (every 10 min)
→ Get Pending Videos (read logs where action=pending_kie)
→ Filter Pending → Split In Batches (size 1)
→ Parse Context (restore data from notes JSON)
→ Smart Classifier shim + Parse Gemini Output shim (provide node interface)
→ KIE Poll Wan Status → Check Status + Timeout (40 min max)
→ Video Ready? (IF: is_success OR is_failed)
     TRUE → Success or Failed?
              SUCCESS → Extract URL → Download → Drive Upload → Share
                        → Pre-Publish Builder → YouTube Upload
                        → Mark Completed → Log Success
                        → Update Pending Done (action=kie_done)
                        → Get Ideas → Build Rolling Brief → Auto Ideas
                        → Parse New Ideas → Append to Sheet
              FAILED  → Log Video Failure → Update Pending Failed (action=kie_failed)
     FALSE (still generating) → do nothing, next cycle will check
```
