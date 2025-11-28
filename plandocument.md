# BandhuBol – Phase Plan & Tasks

Stack assumptions: Turborepo monorepo (`apps/web`, `apps/mobile`, `packages/*`), React Native (Expo) mobile app, optional Next.js web app, Supabase (Auth/Postgres/Storage/Edge Functions with pgvector), OpenAI (LLM + Whisper STT), ElevenLabs (TTS), deployed on Vercel (web) + Supabase.

This document breaks the MVP into phases and actionable tasks. It is written so it can be used as a backlog and sprint planning guide.

---

## Phase 0 – Scope & Foundations

- [ ] Define primary user personas (e.g., lonely professional, recently broken up, student under stress).
- [ ] List top 5–7 use cases (e.g., breakups, work stress venting, late-night loneliness).
- [ ] Finalize MVP feature set:
  - [ ] 4 default avatars (2 male, 2 female).
  - [ ] Custom avatar creation v1.
  - [ ] Freemium model (5 free interactions).
  - [ ] Multilingual + Hinglish.
  - [ ] Voice + text.
  - [ ] Basic safety guardrails.
- [ ] Define monorepo + deployment strategy:
  - [ ] Turborepo with `apps/web`, `apps/mobile`, `packages/core`, `packages/ui`.
  - [ ] Web apps deployed on Vercel.
  - [ ] Supabase as backend (Auth, Postgres + pgvector, Storage, Edge Functions).
- [ ] Confirm client platforms:
  - [ ] Mobile: React Native (Expo).
  - [ ] Web: Next.js app for marketing / web client (optional for MVP).
- [ ] Choose AI and voice stack:
  - [ ] LLM provider (e.g., OpenAI GPT-4.x).
  - [ ] Embedding/vector strategy using Supabase `pgvector`.
  - [ ] STT via Whisper or equivalent.
  - [ ] TTS via ElevenLabs with avatar-specific voices.
- [ ] Define non-functional requirements (latency, scalability, privacy, data retention).
- [ ] Decide environment setup (dev/staging/prod projects on Supabase and Vercel).

---

## Phase 1 – System & Conversation Architecture

- [ ] Draw high-level architecture diagram:
  - [ ] Client apps (Expo mobile, optional Next.js web).
  - [ ] Supabase (Auth, Postgres + pgvector, Storage).
  - [ ] Supabase Edge Functions for conversation, safety checks, payments.
  - [ ] External AI providers (OpenAI for LLM/STT, ElevenLabs for TTS).
  - [ ] Vercel for web deployment.
- [ ] Define core domain models and data schemas (in Supabase Postgres):
  - [ ] `user_profiles`, `user_settings`.
  - [ ] `avatars`, `custom_avatars`.
  - [ ] `sessions`, `messages`.
  - [ ] `interaction_counters`, `subscriptions`, `payments`.
  - [ ] `safety_flags`, `mood_snapshots`.
  - [ ] `relationship_summaries` (for long-term memory).
- [ ] Design conversation and memory strategy:
  - [ ] Session-based memory (short-term chat history in `messages`).
  - [ ] Long-term memory via summaries + embeddings per user-avatar relationship (stored in Postgres with `pgvector`).
  - [ ] Context window strategy (sliding window + summarized history).
- [ ] Define prompt architecture:
  - [ ] Global system prompt (safety, ethics, tone).
  - [ ] Avatar persona prompt (traits, language style).
  - [ ] User context prompt (mood, relationship summary).
  - [ ] Language preference and code-switching instructions.
- [ ] Document safety rules to be enforced via prompts and filters.

---

## Phase 2 – Monorepo, Core Backend & Auth

- [ ] Initialize Turborepo monorepo:
  - [ ] Create root `package.json` with workspaces.
  - [ ] Add `turbo.json` with basic pipeline (`lint`, `build`, `test`).
  - [ ] Create `apps/web` (Next.js) skeleton (even if used only for marketing initially).
  - [ ] Create `apps/mobile` (Expo) skeleton.
  - [ ] Create `packages/core` for shared types, API clients, and prompt helpers.
  - [ ] Create `packages/ui` for shared UI components (web/admin).
- [ ] Set up Supabase:
  - [ ] Create Supabase project(s) (dev, later staging/prod).
  - [ ] Enable `pgvector` extension.
  - [ ] Configure local development tooling (`supabase` CLI).
- [ ] Configure Supabase Auth:
  - [ ] Decide login method(s): email OTP + optional Google/Apple OAuth.
  - [ ] Configure providers in Supabase dashboard.
  - [ ] Model `user_profiles` table linked to `auth.users`.
- [ ] Define and apply Supabase migrations for:
  - [ ] `user_profiles` and `user_settings`.
  - [ ] `avatars` and `custom_avatars`.
  - [ ] `sessions` and `messages`.
  - [ ] `interaction_counters`.
  - [ ] `subscriptions` and `payments`.
  - [ ] `safety_flags`, `mood_snapshots`, `relationship_summaries`.
- [ ] Configure Row Level Security (RLS) policies:
  - [ ] Ensure users can only access their own messages, sessions, and custom avatars.
  - [ ] Lock down safety and payment tables appropriately.
- [ ] Integrate Supabase client in apps:
  - [ ] `apps/mobile`: set up Supabase client with public anon key.
  - [ ] `apps/web`: same, using environment variables via Vercel.

---

## Phase 3 – AI Conversation Engine (Supabase Edge Functions)

- [ ] Create an abstraction layer in `packages/core` for LLM providers (OpenAI wrapper).
- [ ] Implement Supabase Edge Function for chat (e.g., `conversation-chat`):
  - [ ] Accept authenticated user, avatar ID, and message payload.
  - [ ] Fetch user profile, avatar config, and settings from Supabase.
  - [ ] Pull recent messages and relationship summary for context.
  - [ ] Construct full prompt (system + persona + context + language hints + safety rules).
  - [ ] Call LLM (OpenAI) and handle streaming or non-streaming responses.
  - [ ] Store user and assistant messages in `messages` table.
- [ ] Implement memory and context management:
  - [ ] Sliding window for recent messages within token limits.
  - [ ] Scheduled or trigger-based conversation summarization (Edge Function or scheduled job).
  - [ ] Store embeddings in `relationship_summaries` using `pgvector`.
- [ ] Implement basic mood and emotion tagging:
  - [ ] Choose a sentiment/emotion detection approach (prompted LLM or simple classifier).
  - [ ] Attach mood labels to each user message.
  - [ ] Store mood trend per session in `mood_snapshots`.
- [ ] Implement “avatar growth” logic:
  - [ ] Use long-term summaries and recurring topics to adjust persona prompt on each request.
  - [ ] Surface simple growth indicators in UI (e.g., avatar “remembers” recurring themes).
- [ ] Wire typing indicators into apps:
  - [ ] Use local client-side heuristics or simple status events while waiting for Edge Function responses.

---

## Phase 4 – Multilingual & Code-Switching

- [ ] Decide strategy for multilingual support:
  - [ ] Single multilingual model (OpenAI) with language hints.
  - [ ] Rely on prompts + user preferences for language control.
- [ ] Implement language detection:
  - [ ] Detect English/Hindi/Hinglish per message (lightweight library or LLM).
  - [ ] Fall back to user’s preferred language if detection is uncertain.
- [ ] Integrate language preferences:
  - [ ] Store preferred language/mix in `user_settings`.
  - [ ] Allow avatar-level language bias in `avatars`/`custom_avatars` (e.g., “mostly Hindi with some English”).
- [ ] Tune prompts for natural code-switching:
  - [ ] Provide few-shot examples of Hinglish and code-mixed dialogue.
  - [ ] Ensure respectful, culturally-aware phrasing in examples.
- [ ] Add test prompts and manual QA scenarios to verify language behavior in common situations.

---

## Phase 5 – Voice & Text (Whisper + ElevenLabs)

- [ ] Choose STT solution:
  - [ ] Use OpenAI Whisper (or similar) with English + Hindi support.
  - [ ] Decide whether audio is sent directly from mobile/web to STT provider or via Supabase Edge Function.
- [ ] ElevenLabs TTS integration:
  - [ ] Create or select voices (2 male, 2 female) for default avatars.
  - [ ] Map each avatar to an ElevenLabs voice ID and model.
  - [ ] Implement Edge Function to convert assistant text to speech via ElevenLabs.
- [ ] Design audio flow:
  - [ ] User voice input → STT → text → `conversation-chat` Edge Function.
  - [ ] Assistant text → ElevenLabs → TTS audio URL/bytes → client playback.
- [ ] Implement backend endpoints:
  - [ ] Edge Function for STT (if not calling provider directly).
  - [ ] Edge Function for TTS (text to ElevenLabs audio).
  - [ ] Optionally cache frequent phrases or responses in Supabase Storage.
- [ ] Implement client-side voice features:
  - [ ] In `apps/mobile`: microphone permissions, record-and-send UI, playback UI.
  - [ ] Optional voice-only mode with simple controls.
  - [ ] In `apps/web` (if needed): Web Audio-based recording and playback.
- [ ] Optimize for low bandwidth:
  - [ ] Use compressed audio formats (e.g., mp3/ogg).
  - [ ] Provide fallback to text-only when audio fails or is slow.

---

## Phase 6 – Avatar & Personalization

- [ ] Define default avatar profiles:
  - [ ] Names, genders, light backstories, and personality traits.
  - [ ] Tone and communication style (empathetic, playful, logical, romantic-but-bounded).
  - [ ] Default language preferences and code-switching style.
  - [ ] Map each avatar to an ElevenLabs voice ID.
- [ ] Convert each default avatar into a structured persona prompt template in `packages/core`.
- [ ] Design custom avatar creation flow:
  - [ ] In `apps/mobile`: wizard (name → identity → personality sliders → tone → language).
  - [ ] Optional text input for “based on a memory/old friend/ex” description.
  - [ ] Show preview of sample messages from this avatar (generated via LLM in a safe sandbox).
- [ ] Implement backend logic:
  - [ ] Store custom avatar config in `custom_avatars` (Supabase).
  - [ ] Generate persona prompts dynamically from user inputs.
  - [ ] Ensure RLS allows users to access only their own custom avatars.
- [ ] Add simple “relationship history” view:
  - [ ] Short summary of what the avatar “knows” (from `relationship_summaries`).
  - [ ] Basic mood trend or tags per avatar relationship.

---

## Phase 7 – Freemium & Payments (Razorpay/Stripe + Supabase)

- [ ] Define monetization rules:
  - [ ] Number of free interactions (e.g., 5).
  - [ ] What counts as an interaction (e.g., each LLM call tied to one user message).
  - [ ] Limits for fair usage under “unlimited” plans.
- [ ] Implement interaction tracking:
  - [ ] Increment `interaction_counters` per user per interaction in Edge Functions.
  - [ ] Reset/rollover counters based on plan or time period.
  - [ ] Store logs for analyzing usage patterns.
- [ ] Design subscription and pay-per-use options:
  - [ ] Define SKUs/plans and pricing.
  - [ ] Map each plan to entitlements (e.g., unlimited messages, voice access).
- [ ] Integrate Razorpay/Stripe:
  - [ ] Implement checkout flows in `apps/mobile` and `apps/web`.
  - [ ] Create Supabase Edge Function for handling payment webhooks.
  - [ ] Update `subscriptions` and `payments` tables on webhook events.
- [ ] Build paywall UX:
  - [ ] Show soft paywall after free interactions are used.
  - [ ] Explain benefits of upgrading and available plans.
  - [ ] Allow basic plan management (view current plan, renew/cancel links).

---

## Phase 8 – Safety, Guardrails & Ethics

- [ ] Draft a clear safety policy:
  - [ ] Prohibited content (explicit sexual content, hate, harassment, self-harm encouragement, etc.).
  - [ ] Boundaries for relationship and emotional advice.
  - [ ] Crisis-handling philosophy (non-therapeutic, supportive, non-diagnostic).
- [ ] Implement safety stack:
  - [ ] Pre-LLM checks in Edge Functions (keywords, regex, simple heuristics).
  - [ ] LLM-based moderation or dedicated moderation API for user input and model output.
  - [ ] Post-processing filters to block or rewrite unsafe responses before returning to client.
- [ ] Implement crisis detection:
  - [ ] Recognize phrases/patterns indicating self-harm or severe distress.
  - [ ] Trigger safe, empathetic responses + encourage contacting real-world help.
- [ ] Build `safety_flags` logging:
  - [ ] Store type, severity, timestamp, and minimal context for internal review.
  - [ ] Add tools (SQL queries or minimal admin UI) for reviewing safety incidents.
- [ ] Adjust prompts and persona definitions:
  - [ ] Reinforce non-sexual, non-explicit, non-manipulative boundaries in system prompts.
  - [ ] Clarify that BandhuBol is not a therapist, doctor, or legal advisor.
- [ ] Add user controls:
  - [ ] Report conversation or message.
  - [ ] Block or reset avatar.
  - [ ] Clear chat history (with clear privacy explanation).

---

## Phase 9 – Client App UX & UI

- [ ] Create UX flow diagrams for:
  - [ ] Onboarding and language selection.
  - [ ] Avatar selection and custom avatar creation.
  - [ ] Chat (text + voice), paywall, and subscription management.
- [ ] Design UI screens:
  - [ ] Onboarding + auth screens (Supabase Auth flows).
  - [ ] Avatar gallery (4 defaults + “Create Your Own”).
  - [ ] Chat screen with message bubbles, avatar header, typing indicator, and voice controls.
  - [ ] Paywall and plan selection screens.
  - [ ] Settings (language, notifications, privacy, account deletion).
- [ ] Implement localization:
  - [ ] Integrate i18n library in `apps/mobile` (and `apps/web` if used).
  - [ ] Provide English/Hindi translations for key UI copy.
  - [ ] Use Hinglish where appropriate in marketing copy and certain prompts.
- [ ] Implement push notifications:
  - [ ] For mobile: configure Expo Notifications / native push with tokens tied to `user_profiles`.
  - [ ] Define notification templates (friendly reminders, streaks).
  - [ ] Add user controls for opting in/out.
- [ ] Add optional mood tracking UI:
  - [ ] Simple before/after mood rating around sessions.
  - [ ] Store mood data in `mood_snapshots` for analytics and personalization.

---

## Phase 10 – Observability, Analytics & Scaling

- [ ] Implement logging:
  - [ ] Use Supabase Edge Function logs and structured application logging for all major actions.
  - [ ] Configure error logging with correlation IDs (e.g., in `packages/core`).
- [ ] Set up monitoring:
  - [ ] Track metrics: latency, error rates, STT/TTS failures, LLM usage, Edge Function duration.
  - [ ] Use Supabase and Vercel dashboards; add external monitoring if needed.
- [ ] Design analytics schema:
  - [ ] Daily/weekly/monthly active users.
  - [ ] Conversation counts and average session length.
  - [ ] Conversion funnel: free → trial → paid.
  - [ ] Retention cohorts and churn reasons (qualitative + quantitative).
- [ ] Implement analytics events:
  - [ ] In `apps/mobile` and `apps/web` for user actions.
  - [ ] In Edge Functions for backend events (safety triggers, payments).
- [ ] Apply rate limiting and abuse protection:
  - [ ] Per-user and per-IP limits enforced in Edge Functions.
  - [ ] Soft blocks and cooldowns for suspicious behavior.
- [ ] Prepare for scaling:
  - [ ] Use connection pooling where applicable.
  - [ ] Cache persona prompts and configuration in memory or Supabase caching layer.
  - [ ] Use background jobs (cron or scheduled Edge Functions) for summarization and analytics aggregation.

---

## Phase 11 – QA, Beta & Launch

- [ ] Create a test plan covering:
  - [ ] All core flows (onboarding, chat, paywall, voice, custom avatars).
  - [ ] Multilingual and code-mix scenarios.
  - [ ] Edge cases (poor network, failed audio, long sessions).
- [ ] Run internal QA:
  - [ ] Manual testing across devices and platforms (Android/iOS/web).
  - [ ] Basic automated tests for critical Edge Functions and shared logic in `packages/core`.
- [ ] Safety red-teaming:
  - [ ] Deliberately probe for unsafe behavior (sexual, harmful, manipulative).
  - [ ] Iterate prompts, filters, and safety policies based on findings.
- [ ] Conduct a closed beta:
  - [ ] Recruit a small, diverse user group (language, age, relationship context).
  - [ ] Collect feedback (surveys, interviews, in-app prompts).
  - [ ] Analyze feedback and prioritize improvements.
- [ ] Prepare launch assets:
  - [ ] App Store / Play Store listing for the mobile app.
  - [ ] Landing page on the web app (Next.js on Vercel).
  - [ ] Basic FAQ, privacy policy, and terms of use.
- [ ] Launch v1:
  - [ ] Deploy production web app to Vercel and finalize Supabase prod setup.
  - [ ] Publish mobile app to stores.
  - [ ] Monitor metrics closely during initial days; triage user issues.
- [ ] Define post-launch roadmap:
  - [ ] Additional avatars and deeper personalization.
  - [ ] More categories of AI advisors beyond relationships.
  - [ ] Integrating verified human experts for deeper support.

