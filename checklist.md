# Choir Feature Implementation Checklist

This checklist translates the provided implementation plan into an ordered, actionable set of phases and tasks. I will not start any phase until you review and give the explicit go-ahead for that phase.

## Overview
- Single active performance at `kokozami.net/choir`
- Backend: Lambda + API Gateway + S3 (single `performance/current.json`)
- Frontend: Angular services, audio scheduling, visualization

---

## Phase 0 — Project Setup & Types
[x] 0.1 Define `Performance` Type
    - Add TypeScript interface and shared type definitions
    - Acceptance: Unit tests for type validation and example objects
    - Implementation: Added `src/app/models/performance.ts` and `src/app/models/performance.spec.ts` (unit tests pass)

---

## Phase 1 — Infrastructure (CDK / S3 / CloudFront)
[ ] 1.1 Create S3 bucket for SPA, audio assets, and `performance/current.json`
[ ] 1.2 Create CloudFront distribution and bucket policies
    - Acceptance: SPA and audio are publicly served; `current.json` readable

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
[ ] 4.3 `AudioService` (preload, schedule, analyser)
[ ] 4.4 `VisualizationService` (canvas loop, renderer)
    - Acceptance: Unit tests + integration harness demonstrating service behaviors

---

## Phase 5 — Frontend: UI States & Controls
[ ] 5.1 Implement IDLE → READY → PLAYING → FINISHED state mapping
[ ] 5.2 READY: participant counter, START/RESET visible to leader
[ ] 5.3 PLAYING: hide counter, show visualization only
[ ] 5.4 FINISHED: show THANK YOU; leader may RESET
    - Acceptance: Manual test flow across multiple devices

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

---

## Phase 9 — Deployment & Handoff
[ ] 9.1 CDK deployment scripts and environment configuration
[ ] 9.2 Smoke tests post-deploy
[ ] 9.3 Documentation: decision records, runbook, and testing notes

---

Notes:
- Tasks are strictly ordered as listed in the implementation plan.
- Each phase contains explicit acceptance criteria and tests.
- I will execute phases only after you review this checklist and give explicit go-ahead per phase.

If this checklist looks good, say which phase you want me to execute first and I will proceed when you give the word.
