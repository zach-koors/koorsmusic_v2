# Choir Feature Implementation Checklist

This repository now contains two focused checklists:

- `checklist-angular.md` — frontend tasks to keep in this Angular repo (routing, services, UI, tests)
- `checklist-cdk.md` — infrastructure tasks to move to the CDK repo (S3 seed, Lambda, API Gateway, IAM)

I split the original checklist into those two files so infra work can live in the CDK repo and frontend work can remain here. Review and approve either checklist independently; I will proceed on whichever phase you authorize.

---

## Phase 0 — Project Setup & Types
[x] 0.1 Define `Performance` Type
    - Add TypeScript interface and shared type definitions
    - Acceptance: Unit tests for type validation and example objects
    - Implementation: Added `src/app/models/performance.ts` and `src/app/models/performance.spec.ts` (unit tests pass)

---

## Phase 1 — Infrastructure (Delta-only)
[ ] 1.1 Seed `performance/current.json` into the existing site bucket
    - Provide initial object with IDLE state (see data model)
    - Can be manual upload or CDK asset (no bucket creation)
[ ] 1.2 Add Lambda + API Gateway (additive to existing stack)
    - Routes: GET /performance, POST /performance/claim, /join, /start, /reset
    - No auth; keep public
[ ] 1.3 IAM permissions
    - Lambda scoped to s3:GetObject and s3:PutObject only for `<site-bucket>/performance/current.json`
[ ] 1.4 CloudFront / caching adjustments
    - Ensure API responses are not cached
    - If `current.json` is served from S3 directly, set `Cache-Control: no-store` (recommended: serve via Lambda)
    - Acceptance: `current.json` can be updated and clients see changes quickly

---

## Phase 2 — Lambda Helpers & Read/Write
[ ] 2.1 Implement read/write helpers for `performance/current.json`
    - Safe, versioned writes where applicable
    - Acceptance: Integration tests that read/write a test `current.json`

---

## Phase 3 — API Endpoints
[ ] 3.1 GET /performance
    - Returns synthesized `IDLE` if expired
[ ] 3.2 POST /performance/claim
    - Race-safe claim; sets READY and `leaderId`
[ ] 3.3 POST /performance/join
    - Increments participantCount (approximate)
[ ] 3.4 POST /performance/start
    - Validates `leaderId`, sets PLAYING and `startTime`
[ ] 3.5 POST /performance/reset
    - Resets to clean IDLE state
    - Acceptance: End-to-end tests for each endpoint, including expiry behavior

---

## Phase 4 — Frontend: Core Services
[ ] 4.1 `PerformanceService` (polling + expiry handling)
[ ] 4.2 `RoleService` (clientId, leader state detection)
[ ] 4.3 `ParticipationService` (POST /performance/join once on READY)
[ ] 4.4 `AudioService` (preload, schedule, analyser)
[ ] 4.5 `VisualizationService` (canvas loop, renderer)
    - Routing: Add `/choir` route (no guards, no params)
    - Acceptance: Unit tests + integration harness demonstrating service behaviors

---

## Phase 5 — Frontend: UI States & Controls
[ ] 5.1 Implement IDLE → READY → PLAYING → FINISHED state mapping
[ ] 5.2 READY: participant counter, START/RESET visible to leader
[ ] 5.3 PLAYING: hide counter, show visualization only
[ ] 5.4 FINISHED: show THANK YOU; leader may RESET
    - Acceptance: Manual test flow across multiple devices
    - Leader controls: Visible when `isLeader && status === 'READY'`; disable buttons immediately on click
    - Participant counter: Visible to everyone in READY; hidden during PLAYING

---

## Phase 6 — Audio + Visualization
[ ] 6.1 Preload per-voice audio buffers from S3
[ ] 6.2 Schedule playback using `startTime` (start = now + 2000ms)
[ ] 6.3 Implement vertical-line waveform visualization (MDN-inspired)
    - Acceptance: Synchronized playback and animation across multiple clients

---

## Phase 7 — Polling, Timing & Failure Handling
[ ] 7.1 Poll every 500–1000ms with backoff when tab is hidden
[ ] 7.2 Ensure expired `expiresAt` results in synthesized IDLE on clients
[ ] 7.3 Handle leader disconnects, late joins, network dropouts gracefully
    - Acceptance: Fault-injection tests and documentation of behavior

---

## Phase 8 — Tests, Load, and QA
[ ] 8.1 Unit tests for services and Lambda logic
[ ] 8.2 Integration tests for endpoints and S3 interaction
[ ] 8.3 Field test with 10–20 devices (sync tolerance checks)
[ ] 8.4 Performance tuning (polling interval & start delay)
        - Local / Staging checklist:
            - Two browsers simultanous: verify leader claim race
            - Verify participant counter increments and reset behavior
        - Real devices:
            - 5–10 phones (iOS + Android), include lock/unlock and refresh tests
        - Failure tests:
            - Leader closes tab (performance continues), WiFi drop, late join during PLAYING

---

## Phase 9 — Deployment & Handoff
[ ] 9.1 CDK deployment scripts and environment configuration
[ ] 9.2 Smoke tests post-deploy
[ ] 9.3 Documentation: decision records, runbook, and testing notes
    - Build & deploy flow: unchanged — `ng build` → CDK picks up `dist/` → CDK deploys assets; Lambda deployed as additive change to stack

---

Notes:
- `checklist-angular.md` should remain in this repository.
- `checklist-cdk.md` should be moved to the CDK repository and used as the authoritative infra checklist.

Tell me which checklist/phase you want me to execute first and I will proceed when you give the word.
