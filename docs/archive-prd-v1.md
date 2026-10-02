# PRODUCT REQUIREMENTS DOCUMENT
# XINGO — AI Interpreter Training Platform

Version: 1.0  
Author: Initial Planning Draft  
Tech Stack: Next.js / Convex / Clerk / Stripe / Vercel / TypeScript / Tailwind

---

# 1. Product Overview

**XINGO** is a web-based interpreter training platform designed to help interpreters practice real-world interpreting scenarios using AI voice agents.

Users interact with simulated conversations between two AI agents (for example: doctor and patient, judge and defendant) and practice interpreting between them.

The platform functions as a **Learning Management System (LMS)** combined with **AI conversational training simulations**.

Users can:

- Browse learning modules
- Practice interpreting real-world scenarios
- Track their progress and scores
- Earn micro-credentials
- Be discovered by organizations for job opportunities

Organizations such as interpreter training schools can:

- Enroll and manage students
- Track student progress and scores
- Assign interpreting jobs to qualified interpreters

---

# 2. Core Goals

Primary goals of the platform:

1. Provide interpreters with **realistic AI-powered practice environments**
2. Allow interpreters to **improve skills through repeatable scenarios**
3. Enable organizations to **train and evaluate interpreters**
4. Offer **micro-credential accreditation**
5. Create a **pathway from training to employment**

---

# 3. Technology Stack

## Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- ShadCN UI Components

## Backend / Data

- Convex (database + backend functions)

## Authentication

- Clerk

## Billing

- Stripe Subscriptions

## Deployment

- Vercel

## Voice AI / Scenarios

- External voice agent provider (ElevenLabs or equivalent)

---

# 4. High Level System Architecture

```
Public Website
     ↓
Authentication (Clerk)
     ↓
Application Dashboard (Next.js)
     ↓
Convex Database + Functions
     ↓
Voice AI Scenario Engine
     ↓
Stripe Billing
```

---

# 5. User Roles

The system supports four user roles.

## 5.1 Individual Interpreter

An independent interpreter who signs up directly.

Capabilities:

- Create account
- Access free modules
- Subscribe to unlock premium modules
- Practice scenarios
- Track progress
- Earn credentials

---

## 5.2 Student (Organization Member)

A student associated with an interpreter training organization.

Capabilities:

- Same access as individual users
- Progress visible to their organization admin

---

## 5.3 Organization Admin

Admins from interpreter training companies or educational organizations.

Capabilities:

- Manage students
- Upload students via CSV
- Track student performance
- Search interpreters by skills/scores
- Assign interpreting jobs

---

## 5.4 Platform Admin

Internal administrators managing the platform.

Capabilities:

- Manage modules
- Manage accreditation flags
- Manage organizations
- View analytics

---

# 6. Public Marketing Website

A public-facing website will exist outside the application dashboard.

Purpose:

- Explain the platform
- Attract interpreters and organizations
- Convert users into signups

Core pages:

- Home
- Product Overview
- How It Works
- For Interpreters
- For Organizations
- Pricing
- Demo Video (added later)
- Login
- Sign Up

Calls to action:

- Create account
- Try free modules
- View pricing

---

# 7. Authentication

Authentication will be implemented using **Clerk**.

Supported flows:

- Email/password signup
- Social login (optional)
- Organization memberships
- Role management

Clerk will manage:

- Sessions
- User profiles
- Organizations
- Access control

---

# 8. Application Layout

The application will include a **dashboard layout**.

Main UI structure:

```
Top Navigation
Sidebar Navigation
Main Content Area
```

---

## Sidebar Navigation

- Dashboard
- Learning Modules
- Practice
- Progress
- Credentials
- Jobs
- Billing
- Account
- Help & Support

---

# 9. Learning Management System (LMS)

The LMS is the core educational component of the platform.

Users browse learning modules and practice scenarios within them.

---

# 10. Learning Modules

Each module represents a training subject.

Examples:

- Legal interpreting
- Medical interpreting
- Immigration interviews
- Courtroom hearings
- Hospital consultations

---

## Module Properties

Modules will store the following information:

```
id
title
description
industry_category
duration_minutes
difficulty_level
scenarios[]
learning_objectives[]
is_free
is_accredited
accreditation_provider
badge_icon
created_at
```

---

## Accreditation Badges

Some modules will include **micro-credentials**.

These modules will display an accreditation badge.

Examples:

- University Certified
- Professional Interpreter Credential
- Accredited Training Module

---

# 11. Free vs Paid Modules

Modules will be classified into:

**Free Modules**

- Intended for onboarding
- Available without subscription

**Paid Modules**

- Require active subscription
- Unlock advanced training scenarios

---

# 12. Practice Scenario System

Each module contains multiple **practice scenarios**.

Example (Medical):

Scenario: Emergency Room Intake

Agents:

- Doctor
- Patient

The interpreter must translate between both parties.

---

# 13. AI Voice Agents

Each scenario runs a conversation between two AI agents.

Example conversation flow:

Doctor → asks patient symptoms  
Patient → responds  
Interpreter → interprets

The interpreter interacts live.

The conversation continues dynamically.

---

# 14. Scenario Flow

```
User selects module
     ↓
User reads module description
     ↓
User clicks "Start Practice"
     ↓
Scenario engine loads
     ↓
AI agents begin conversation
     ↓
User interprets between them
     ↓
System evaluates performance
```

---

# 15. Performance Tracking

Each practice session records:

```
session_id
user_id
module_id
scenario_id
duration
score
completion_status
timestamp
```

---

# 16. Module Completion

A module is marked **completed** when:

```
score >= 75%
```

Completion badge is awarded.

---

# 17. Progress Dashboard

Users can view their learning progress.

Metrics displayed:

- Completed modules
- Current module progress
- Average score
- Industry specialization
- Time spent practicing

---

# 18. Organization Management

Organizations can onboard interpreters.

Features:

- Create organization
- Invite students
- Upload students via CSV
- Assign user roles

---

# 19. Bulk Student Import

Organization admins can upload a CSV file.

Example CSV format:

```
name,email,role
Jane Smith,jane@email.com,student
Travis Weerts,travis@email.com,student
```

Students automatically receive invite emails.

---

# 20. Organization Dashboard

Admins can view all students.

Data visible:

- Student name
- Modules completed
- Average score
- Specializations
- Accreditations earned

Admins can filter by:

- Industry specialization
- Score
- Completion status

---

# 21. Interpreter Job Marketplace

Organizations can assign interpreting jobs.

Example workflow:

```
Admin searches interpreters by specialization
     ↓
Finds interpreters with strong scores
     ↓
Creates job assignment
     ↓
Interpreter receives notification
```

---

## Job Object

```
id
title
description
industry
date
location
pay_rate
assigned_interpreter_id
status
```

---

# 22. Subscription System

Billing handled using **Stripe Subscriptions**.

Plans:

### Free Plan

- Access to onboarding modules only

### Professional Plan

- Full module access
- Practice scenarios unlocked

### Organization Plan

- Bulk student management
- Organization dashboard
- Performance tracking

---

# 23. Stripe Integration

Stripe features required:

- Subscription checkout
- Customer portal
- Payment methods
- Billing history
- Upgrade / downgrade plans

---

# 24. User Account Management

Users can manage their accounts.

Features:

- Profile settings
- Password change
- Billing management
- Subscription plan
- Email preferences

---

# 25. Help & Support Section

Users will have access to a help center.

Initial seeded content:

- Getting Started
- How Practice Works
- Understanding Scores
- Billing Questions
- Contact Support

---

# 26. Future Expansion Opportunities

Potential future features:

- AI feedback on interpreting accuracy
- Interpreter certification pathways
- Marketplace for live interpreting jobs
- Mobile application
- Employer hiring platform
- Performance analytics dashboard

---

# 27. Success Metrics

Key platform metrics:

- Monthly active interpreters
- Modules completed per user
- Average session length
- Subscription conversion rate
- Organization adoption
- Job assignments created


# XINGO — Technical Architecture Specification

Version: 1.0  
Platform: Web Application  
Framework: Next.js  
Language: TypeScript  

---

# 1. System Architecture

XINGO is built as a modern serverless web platform.

Architecture stack:

Frontend
Next.js (App Router)

Authentication
Clerk

Database + Backend
Convex

Billing
Stripe

Voice AI
External Voice Agent System

Hosting
Vercel

---

# 2. System Architecture Diagram

```
User Browser
      │
      ▼
Next.js Frontend (Vercel)
      │
      ▼
Clerk Authentication
      │
      ▼
Application Dashboard
      │
      ▼
Convex Backend + Database
      │
      ├── Stripe Billing
      │
      └── Voice AI Scenario Engine
```

---

# 3. Repository Structure

Recommended project layout.

```
/xingo-app

/app
  /(marketing)
    page.tsx
    pricing/page.tsx
    how-it-works/page.tsx

  /(dashboard)
    dashboard/page.tsx
    modules/page.tsx
    modules/[moduleId]/page.tsx
    practice/[scenarioId]/page.tsx
    progress/page.tsx
    jobs/page.tsx
    billing/page.tsx
    account/page.tsx
    help/page.tsx

/components
  ui/
  dashboard/
  modules/
  practice/

/lib
  auth.ts
  stripe.ts
  convex.ts
  ai.ts

/convex
  schema.ts
  users.ts
  modules.ts
  scenarios.ts
  sessions.ts
  jobs.ts
  organizations.ts

/types
  module.ts
  scenario.ts
  session.ts
  user.ts

/utils
  scoring.ts
  permissions.ts

/public

/styles
```

---

# 4. Convex Database Schema

## Users

```
users
  _id
  clerkId
  email
  name
  role
  organizationId
  subscriptionStatus
  createdAt
```

Roles:

```
interpreter
student
organization_admin
platform_admin
```

---

## Organizations

```
organizations
  _id
  name
  ownerId
  createdAt
```

---

## Organization Members

```
organizationMembers
  _id
  organizationId
  userId
  role
```

---

## Learning Modules

```
modules
  _id
  title
  description
  industryCategory
  difficultyLevel
  durationMinutes
  learningObjectives
  isFree
  isAccredited
  accreditationProvider
  badgeIcon
  createdAt
```

---

## Scenarios

```
scenarios
  _id
  moduleId
  title
  description
  aiAgentA
  aiAgentB
  expectedSkills
  difficultyLevel
```

---

## Practice Sessions

```
sessions
  _id
  userId
  moduleId
  scenarioId
  startTime
  endTime
  score
  completionStatus
  transcript
```

---

## Job Assignments

```
jobs
  _id
  title
  description
  industry
  date
  location
  payRate
  organizationId
  assignedInterpreterId
  status
```

Status values:

```
open
assigned
completed
cancelled
```

---

# 5. Authentication (Clerk)

Clerk handles:

User signup  
Login  
Session management  
Organizations  

Next.js integration:

```
@clerk/nextjs
```

Middleware protects routes.

```
/dashboard/*
```

Clerk user metadata stores:

```
role
organizationId
subscriptionStatus
```

---

# 6. Authorization Logic

Role-based access control.

Example rules:

Interpreter

- view modules
- run scenarios
- track progress

Organization Admin

- manage students
- view student performance
- assign jobs

Platform Admin

- create modules
- manage accreditation
- manage organizations

---

# 7. Stripe Billing Integration

Stripe handles subscription plans.

Plans:

```
FREE
PROFESSIONAL
ORGANIZATION
```

Stripe features used:

- Checkout Sessions
- Customer Portal
- Webhooks

Webhook events:

```
checkout.session.completed
invoice.payment_succeeded
customer.subscription.updated
customer.subscription.deleted
```

Webhook updates user subscription in Convex.

---

# 8. Learning Module System

Modules are stored in Convex.

Frontend flow:

```
GET /modules
```

Display module cards.

Each module shows:

- title
- duration
- accreditation badge
- difficulty
- locked/unlocked state

---

# 9. Scenario Engine

Each module contains scenarios.

Example scenario:

```
Medical ER Intake
Doctor ↔ Patient
Interpreter translates
```

Scenario components:

AI Agent A (doctor)

AI Agent B (patient)

Interpreter input

Conversation loop.

---

# 10. Voice AI Integration

Voice AI runs two conversational agents.

System responsibilities:

- stream agent audio
- capture interpreter response
- maintain conversation context
- generate next AI response

Conversation pipeline:

```
AI Agent A speaks
      ↓
Interpreter translates
      ↓
AI Agent B responds
      ↓
Interpreter translates
      ↓
Loop
```

Session transcripts stored.

---

# 11. Scoring Engine

Scoring system evaluates:

accuracy  
response latency  
terminology correctness  
completion  

Example scoring:

```
accuracy_weight = 0.5
latency_weight = 0.2
terminology_weight = 0.3
```

Final score:

```
0 - 100
```

Completion threshold:

```
>= 75
```

---

# 12. Progress Tracking

User progress derived from session history.

Progress metrics:

- modules completed
- average score
- industry specialization

Convex query example:

```
getUserProgress(userId)
```

---

# 13. Organization Management

Organization admins can:

- invite students
- upload CSV
- monitor progress

CSV upload flow:

```
upload CSV
→ parse
→ create Clerk users
→ assign organization membership
```

---

# 14. Job Assignment System

Organizations can create jobs.

Flow:

```
admin creates job
→ selects interpreter
→ sends assignment
→ interpreter accepts
```

Notification system optional.

---

# 15. Marketing Website

Routes under:

```
/(marketing)
```

Pages:

```
/
pricing
how-it-works
for-interpreters
for-organizations
```

CTA buttons:

```
Sign Up
Try Free Modules
```

---

# 16. Deployment

Hosted on Vercel.

Services:

Next.js frontend  
Convex backend  

Environment variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CONVEX_DEPLOYMENT
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
VOICE_AI_API_KEY
```

---

# 17. Logging and Observability

Tools recommended:

Sentry  
PostHog  
Vercel Analytics  

Track:

errors  
session duration  
module completion  

---

# 18. Security

Key security practices:

- Clerk session validation
- role-based authorization
- Stripe webhook signature validation
- API key protection

---

# 19. Development Workflow

Recommended process:

1. Build schema in Convex
2. Implement authentication
3. Create module system
4. Build practice scenario UI
5. Integrate voice AI
6. Implement scoring engine
7. Add organization management
8. Integrate Stripe billing
9. Deploy on Vercel

---

# 20. Future Extensions

Possible upgrades:

AI feedback coaching  
Real-time pronunciation analysis  
Live interpreter marketplace  
Mobile app  
AI translation scoring models  
Video-based interpreting scenarios

---

# End of Document