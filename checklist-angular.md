# Choir Feature — Angular Checklist (keep in this repo)

This file contains the tasks and acceptance criteria that belong in the Angular application repository. Keep this file here and use it as the authoritative checklist for all frontend work.

Overview
- Add a `/choir` feature area and Angular services that poll and consume the `performance` object.
- No infra changes here — the Angular app talks to the API Gateway endpoints described in the CDK checklist.

Phases

Phase 0 — Project Setup & Types (Completed)
- 0.1 Define `Performance` Type
  - Implemented: `src/app/models/performance.ts` & tests.

Phase 4 — Frontend: Core Services (in progress — implemented basics)
- [x] 4.1 `PerformanceService`
  - Polls `GET /performance` (700ms default) with simple backoff when tab hidden
  - Emits `performance$` observable and applies expiration TTL (treat expired as IDLE)
- [x] 4.2 `RoleService`
  - Generates ephemeral `clientId` and persists to `localStorage`
- [x] 4.3 `ParticipationService`
  - Subscribes to `performance$` and POSTs `/performance/join` once per READY version
- [x] 4.4 `AudioService` (skeleton)
  - Placeholder: ensure AudioContext creation and preload/schedule stubs
- [x] 4.5 `VisualizationService` (skeleton)
  - Placeholder: API surface for start/stop of canvas renderer

Implementation notes:
- New files added:
  - `src/app/services/performance.service.ts` (+ spec)
  - `src/app/services/role.service.ts` (+ spec)
  - `src/app/services/participation.service.ts` (+ spec)
  - `src/app/services/audio.service.ts`
  - `src/app/services/visualization.service.ts`
  - `src/app/pages/kokozami/choir/*` (component + template + spec)
- Tests: unit tests added for `PerformanceService`, `RoleService`, and `ParticipationService` (all pass)

Next UI wiring will happen in Phase 5.

Phase 5 — Frontend: UI States & Controls (Completed)
- [x] 5.1 Implement state mapping from `performance.status` to UI states (IDLE, READY, PLAYING, FINISHED)
- [x] 5.2 READY: show participant counter; leader sees START/RESET
- [x] 5.3 PLAYING: hide counter; show visualization only
- [x] 5.4 FINISHED: show THANK YOU; leader may RESET
  - Leader controls visible when `isLeader && status === 'READY'`; disable buttons immediately on click
  - Participant counter visible to everyone during READY; hidden during PLAYING

Phase 6 — Audio + Visualization (in progress)
- [ ] 6.1 Preload per-voice audio buffers from S3
- [ ] 6.2 Schedule playback with `startTime` (target: start = now + 2000ms)
- [ ] 6.3 Implement vertical-line waveform visualization
 
Integration with dev API
- PERF API base today: `https://j1d6emqagj.execute-api.us-east-1.amazonaws.com/dev` (you provided)
- Implemented runtime config token `PERFORMANCE_API_BASE` that reads `window.__PERFORMANCE_API_BASE` when set
- Added local dev proxy `proxy.conf.json` to forward `/performance` to your dev API; run `ng serve --proxy-config proxy.conf.json` to use it
- Next: CDK should inject a small script into `index.html` setting `window.__PERFORMANCE_API_BASE` to the deployed API base so the SPA calls the correct origin without rebuilds

Phase 7 — Polling, Timing & Failure Handling
- 7.1 Poll interval: 500–1000ms; back off on hidden tabs
- 7.2 Treat expired `expiresAt` as IDLE on client
- 7.3 Graceful handling: leader drops, network drop, late-join behavior

Phase 8 — Tests, Load, and QA (Frontend)
- 8.1 Unit tests for services and components
- 8.2 Integration tests for UI flows and audio scheduling (local harness)
- 8.3 Field tests: 5–10 phones (iOS + Android)
- 8.4 Performance tuning: polling intervals & start delay

Deployment Note
- Build flow is unchanged: `ng build` → CDK picks up `dist/` → CDK deploys assets.

Acceptance
- All frontend unit tests pass.
- Manual verification with multiple browsers demonstrates correct leader/choir behavior and synchronized playback.
