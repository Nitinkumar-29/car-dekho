# Assignment Car Dekho

## Purpose
Car buyers often face too many options and unclear trade-offs.  
This project helps users move from confusion to confidence by collecting preferences and returning a shortlist of matching cars with explainable reasoning.

## Problem Statement
The brief asks for a full-stack, working web app that:
- helps a confused buyer choose cars
- has real backend logic (not static UI)
- runs quickly and can be evaluated end-to-end

## What We Built
### Frontend (React + Vite + TypeScript)
- Landing page
- Multi-step questionnaire (`/find-car`)
- Results page (`/results`) with:
  - top recommendations
  - match score
  - pros/cons
  - AI explanation
  - comparison matrix
  - local market insights (on-road estimate, monthly running cost, waiting period)
- Theme toggle (light/dark)

### Backend (NestJS + TypeScript + Mongo-ready architecture)
- `POST /api/recommendations`:
  - validates user preferences
  - computes recommendation scores
  - ranks top cars
  - enriches response with location-aware cost signals
  - generates AI explanation
- `GET /api/cars`, `GET /api/cars/:id`
- modular architecture:
  - `cars` module
  - `recommendations` module
  - `ai` module

## Buyer Problems We Solve
When searching for a car, buyers usually face:
- Too many choices with no clear shortlist.
- Hard-to-compare trade-offs (price vs mileage vs safety vs comfort).
- Uncertainty about whether a car fits their real life usage.
- Generic recommendations that ignore location-specific costs.
- Low confidence in final decision.

## Our Solution for Buyers
This app directly addresses those pain points by:
- Converting buyer preferences into a ranked top-3 shortlist.
- Explaining each recommendation in plain language (why it fits, key pros, key trade-offs).
- Providing comparison support to evaluate cars side-by-side.
- Including location-aware context (on-road estimate, monthly running cost, waiting period).
- Turning a vague search into an explainable, confidence-building decision flow.

## Current Status
### Working
- End-to-end recommendation flow
- API integration and scoring
- AI explanation integration
- Location-aware cost estimation fields
- Comparison view
- Theme toggle (light + dark)
- Client and server build successfully

### Known Limitations
- Market data uses deterministic heuristics, not live dealer/fuel APIs yet.
- Some specification fields are derived heuristically when source dataset is minimal.
- No formal test suite included in this time-box.

## Run Instructions (Local)
Open two terminals from repo root:

### 1) Start backend
```bash
cd server
npm install
npm run start:dev
```
Backend runs on: `http://localhost:3000`  
Swagger docs: `http://localhost:3000/api/docs`

### 2) Start frontend
```bash
cd client
npm install
npm run dev
```
Frontend runs on Vite default URL (typically `http://localhost:5173`)

Set backend URL via `client/.env`:
```bash
VITE_API_URL=http://localhost:3000/api
```

## API Contract (Core)
### POST `/api/recommendations`
Request:
```json
{
  "budget": "10-15L",
  "usage": "City",
  "familySize": 4,
  "fuel": "Petrol",
  "priority": "Safety",
  "location": "Bengaluru"
}
```

Response includes:
- ranked recommendations
- score
- explanation
- pros/cons/specs
- local on-road estimate
- monthly running cost estimate
- waiting period estimate
- pricing last-updated date

## Stack and Why
- **React + Vite + TypeScript**: fast iteration, typed UI contracts
- **NestJS + TypeScript**: structured modular backend, DTO validation
- **Class Validator + Swagger**: request safety and clear API docs
- **AI API integration**: human-readable recommendation explanations

## Scope Decisions
### Built first (high value)
- Questionnaire -> ranked shortlist -> explainability
- End-to-end API integration
- Clear buyer decision support UI

### Deliberately cut (time-box)
- Live market/dealer integration
- Advanced analytics dashboard
- Comprehensive automated tests

## AI Tool Usage Summary
### Delegated to AI
- code scaffolding/refactors
- contract alignment fixes
- repetitive mapping and DTO updates
- UI bug triage and patch generation

### Done manually / reviewed carefully
- architecture decisions
- trade-off prioritization
- validation of runtime behavior
- final bug verification and acceptance

### Where AI helped most
- speed of iteration across frontend/backend
- quick detection of contract mismatches
- patching repetitive integration points

### Where AI got in the way
- occasional placeholder-style outputs unsuitable for production
- required strict human review for user-facing text and edge cases

## If We Had 4 More Hours
1. Integrate real-time pricing and fuel cost feeds per city.
2. Add scoring-breakdown explainability (`budgetScore`, `fuelScore`, etc.).
3. Add integration tests for recommendation contract stability.
4. Add feedback loop (`useful / not useful`) to improve ranking over time.

---
This repo is aligned to the assignment objective: ship a practical full-stack MVP that helps users confidently shortlist cars within a strict time box.
