# CHAPTER THREE: RESEARCH METHODOLOGY

## 3.1 Introduction

This chapter describes the methodology adopted in the design and development of StudyPilot. It presents an analysis of the existing system (manual study scheduling), a detailed analysis of the proposed system, the system design methodology, justification for the design choices, and the complete workflow of the proposed system. The chapter provides the technical foundation upon which the implementation (Chapter 4) is built.

The **Agile Software Development Methodology** was adopted for this project, specifically an incremental approach where the system was built in iterations — starting with core authentication and data models, then adding the priority engine, dashboard, and check-in features progressively. This approach allowed for continuous testing and refinement throughout development.

## 3.2 Analysis of the Existing System

The existing system refers to the **manual study scheduling approach** commonly used by university students. In this system, students typically:

1. Write out a list of their registered courses at the beginning of the semester.
2. Create a paper-based or calendar-based timetable by manually assigning courses to time blocks.
3. Decide what to study each day based on intuition, upcoming deadlines, or personal preference.
4. Track progress mentally or through basic checklists.

### Problems of the Existing System

| Problem | Description |
|---|---|
| **No Prioritisation Logic** | Students decide what to study based on preference rather than urgency or need. Difficult or low-confidence courses are often avoided. |
| **Static Schedules** | Paper timetables cannot adapt when sessions are missed, new topics are added, or exam dates change. |
| **No Workload Balancing** | Students may overload one day with difficult topics while leaving other days underutilised. |
| **No Progress Visibility** | There is no systematic way to see how much of each course has been covered or which courses are falling behind. |
| **No Accountability** | Without check-in mechanisms, there is no record of study consistency or streak tracking. |
| **Time-Consuming** | Manually restructuring a study plan after disruptions is tedious and often abandoned entirely. |

## 3.3 Analysis of the Proposed System

The proposed system, **StudyPilot**, is a web-based application that automates the study scheduling process. It addresses each problem of the existing system through the following solutions:

| Existing Problem | Proposed Solution |
|---|---|
| No Prioritisation Logic | **Priority Engine** computes a weighted score for each course and ranks them automatically. |
| Static Schedules | **Dynamic plan generation** creates fresh plans based on current data each morning. |
| No Workload Balancing | **Cognitive load constraints** (max daily weight, max hard topics) ensure balanced distribution. |
| No Progress Visibility | **Dashboard metrics** show completion percentage, topic counts, and at-risk flags per course. |
| No Accountability | **Morning/evening check-ins** and **streak tracking** provide structured accountability. |
| Time-Consuming | **One-click plan generation** produces a complete daily study plan in seconds. |

### Functional Requirements of the Proposed System

1. User registration and login (email/password and Google OAuth).
2. Password recovery via email.
3. Guided onboarding with course and preference setup.
4. Course management with priority ranking display.
5. Topic management (add topics to courses with difficulty and time estimates).
6. Morning check-in with wake/sleep time and commitment input.
7. Free time window calculation and display.
8. Automatic daily plan generation using the Priority Engine.
9. Topic completion toggle (mark done/pending).
10. Evening check-in with confidence update and streak logging.
11. Study streak calculation and display.
12. At-risk and watch course flagging.
13. Weekly schedule calendar view with week navigation.
14. User logout.

### Non-Functional Requirements

1. **Performance:** Plan generation should complete in under 2 seconds.
2. **Usability:** The interface must be intuitive and require no training.
3. **Responsiveness:** The application must work on screens from 320px (mobile) to 1920px (desktop).
4. **Security:** User data must be protected through Firebase Authentication and Firestore security rules.
5. **Availability:** The application should be accessible 24/7 via the Vercel hosting platform.
6. **Scalability:** The Firestore database should handle growth in users and data without schema changes.

## 3.4 Proposed System Methodology/Design

### 3.4.1 System Architecture

StudyPilot uses a **client-side rendering (CSR) single-page application (SPA)** architecture with a **serverless backend**:

```
┌─────────────────────────────────────────────────┐
│                    CLIENT                        │
│  ┌───────────────────────────────────────────┐   │
│  │           React.js Application            │   │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────┐  │   │
│  │  │  Pages   │ │Components│ │    UI      │  │   │
│  │  │(7 pages) │ │(6 comps) │ │(4 comps)  │  │   │
│  │  └─────────┘ └──────────┘ └───────────┘  │   │
│  │  ┌─────────────────────────────────────┐  │   │
│  │  │         Utils / Logic Layer          │  │   │
│  │  │  priorityEngine.js  |  auth.js       │  │   │
│  │  └─────────────────────────────────────┘  │   │
│  └───────────────────────────────────────────┘   │
│            │                    │                  │
│       React Router         Firebase SDK           │
│     (Client Routing)    (Auth + Firestore)        │
└─────────────────────────────────────────────────┘
              │                    │
              ▼                    ▼
     ┌──────────────┐    ┌──────────────────┐
     │    Vercel     │    │  Firebase Cloud   │
     │  (Hosting)    │    │  ┌────────────┐   │
     │               │    │  │   Auth     │   │
     │  Static SPA   │    │  │(Email/Google)│  │
     │  Deployment   │    │  ├────────────┤   │
     │               │    │  │ Firestore  │   │
     │               │    │  │ (Database) │   │
     └──────────────┘    │  └────────────┘   │
                          └──────────────────┘
```

### 3.4.2 Database Design (Firestore Collections)

**Table 3.1: Firestore Collections and Fields**

| Collection | Document ID | Fields | Description |
|---|---|---|---|
| **users** | `{userId}` | `name` (string), `email` (string), `maxTopics` (number), `maxHardTopics` (number), `createdAt` (string), `role` (string) | Stores user profile and study preferences |
| **courses** | Auto-generated | `userId` (string), `name` (string), `creditUnits` (number), `examDate` (string), `confidence` (number, 1–5), `totalTopics` (number), `remainingTopics` (number), `createdAt` (string) | Stores course information per user |
| **topics** | Auto-generated | `userId` (string), `courseId` (string), `courseName` (string), `name` (string), `estimatedTime` (string: "30min"/"1hr"/"2hr"), `difficulty` (number, 1–5), `status` (string: "pending"/"done"), `createdAt` (string) | Stores individual study topics under courses |
| **dailyPlans** | Auto-generated | `userId` (string), `date` (string, YYYY-MM-DD), `topics` (array of topic IDs), `createdAt` (string) | Stores generated daily plans |
| **checkIns** | Auto-generated | `userId` (string), `date` (string), `doneTopics` (array of topic IDs), `missedTopics` (array of topic IDs), `createdAt` (string) | Stores evening check-in records for streak calculation |

### 3.4.3 Priority Engine Algorithm Design

The Priority Engine is the core algorithmic component of StudyPilot. It consists of several interconnected functions:

#### a) Priority Score Calculation

Each course receives a priority score calculated as:

```
PriorityScore = (Urgency × 0.4) + (CreditUnits × 0.2) + (LowConfidence × 0.2) + (RemainingLoad × 0.2)
```

**Table 3.2: Priority Score Weighting Factors**

| Factor | Weight | Calculation | Rationale |
|---|---|---|---|
| **Urgency** | 40% | `1 / daysUntilExam` (capped at 999 if exam has passed) | Courses with imminent exams require immediate attention |
| **Credit Units** | 20% | Raw credit unit value (e.g., 2, 3, 4) | Higher-credit courses carry more academic weight |
| **Low Confidence** | 20% | `5 - confidenceLevel` (confidence is 1–5) | Lower student confidence indicates greater need for study |
| **Remaining Load** | 20% | `remainingTopics / totalTopics` (0 to 1) | Higher remaining workload relative to total indicates more work needed |

#### b) Course Ranking

Courses are sorted in **descending order** of priority score. The highest-scoring course is ranked first and receives study priority.

#### c) Topic Weight Calculation

Each topic receives a weight value:

```
TopicWeight = estimatedTimeValue + (difficulty × 0.5)
```

Where `estimatedTimeValue` maps: "30min" → 0.5, "1hr" → 1.0, "2hr" → 2.0.

#### d) Daily Plan Generation Algorithm

```
INPUT: ranked courses, all topics, user preferences, available free minutes
OUTPUT: plan object mapping dates to topic arrays

1. Sort courses by priority score (descending)
2. For each course, collect pending topics sorted by difficulty (hardest first)
3. Build a queue of all pending topics in priority order
4. Initialize: dayOffset = 0, dailyWeight = 0, dailyTimeUsed = 0, hardTopicsToday = 0
5. For each topic in queue:
   a. Calculate topic weight and time in minutes
   b. Check three constraints:
      - dailyWeight + topicWeight > maxDailyWeight?
      - dailyTimeUsed + topicMinutes > maxDailyMinutes?
      - isHardTopic AND hardTopicsToday >= maxHardTopics?
   c. If ANY constraint is violated:
      - Increment dayOffset (move to next day)
      - Reset dailyWeight, dailyTimeUsed, hardTopicsToday to 0
   d. Assign topic to current day
   e. Update dailyWeight, dailyTimeUsed, hardTopicsToday
6. Return plan
```

### 3.4.4 Application Routing Design

| Route Path | Component | Purpose |
|---|---|---|
| `/` | LandingPage | Public marketing/information page |
| `/signup` | SignupPage | User registration (email or Google) |
| `/login` | LoginPage | User authentication |
| `/forgot-password` | ForgotPasswordPage | Password recovery |
| `/onboarding` | OnboardingPage | New user course and preference setup |
| `/dashboard` | DashboardPage | Main application interface |
| `/course/:id` | CourseDetail (SchedulePage) | Weekly schedule calendar view |

### 3.4.5 Component Architecture

```
App.jsx
├── LandingPage
│   ├── AppNavbar (with ThemeToggle, NewButton)
│   ├── HeroSection
│   ├── FeatureGrid
│   ├── StepsSection
│   └── FooterSection
├── SignupPage
├── LoginPage
├── ForgotPasswordPage
├── OnboardingPage
│   └── AddCourseForm
├── DashboardPage
│   ├── Navbar
│   ├── Greeting Section
│   ├── Metric Cards (Courses, Topics, Streak, At-risk)
│   ├── Today's Reading List
│   ├── Course Priority List
│   ├── Morning Check-in Section
│   ├── Add Topic Modal
│   └── Evening Check-in Modal
└── CourseDetail (SchedulePage)
    ├── Navbar
    ├── Week Navigation
    └── DayCard (×7)
```

## 3.5 Justification of the Proposed Methodology/Design

### 3.5.1 Why Agile Methodology?

The Agile methodology was chosen over Waterfall for the following reasons:

1. **Iterative Refinement:** The priority engine algorithm required multiple iterations of testing and adjustment. Agile allowed each iteration to be tested independently.
2. **Flexibility:** Requirements evolved during development (e.g., adding the morning/evening check-in workflow). Agile accommodated these changes without disrupting the project.
3. **Solo Developer Suitability:** As a single-developer project, the lightweight Agile approach (without the overhead of full Scrum ceremonies) was practical and efficient.
4. **Early Deliverables:** Each iteration produced a working feature, enabling progressive demonstration and testing.

### 3.5.2 Why React.js with Vite?

- **Component-Based Architecture:** React's component model allowed the application to be broken into reusable, maintainable pieces (pages, components, UI elements).
- **Virtual DOM:** React's efficient rendering ensures smooth user interactions even with complex dashboard updates.
- **Vite Build Tool:** Vite provides significantly faster development server startup and hot module replacement compared to Create React App, accelerating development.
- **Large Ecosystem:** React has extensive community support, documentation, and compatible libraries (React Router, Flowbite React).

### 3.5.3 Why Firebase?

- **Serverless:** Eliminates the need to build, deploy, and maintain a backend server — reducing development time and hosting costs.
- **Real-Time Database:** Firestore provides real-time data synchronisation, ensuring the dashboard always reflects the latest data.
- **Built-In Authentication:** Firebase Auth provides secure, production-grade authentication with email/password and Google OAuth out of the box.
- **Free Tier:** Firebase's free tier (Spark plan) is sufficient for this project's scale, making it cost-effective for a student project.
- **Scalability:** If the user base grows, Firebase scales automatically without infrastructure changes.

### 3.5.4 Why a Weighted Priority Formula?

The four-factor weighted formula was designed based on educational research and practical reasoning:

- **Urgency receives the highest weight (40%)** because time is the scarcest resource — a course with an exam tomorrow must take precedence regardless of other factors.
- **Credit units, confidence, and workload each receive 20%** to provide a balanced consideration of academic importance, student readiness, and remaining effort.
- The weights are configurable and could be adjusted based on student feedback or institutional requirements.

## 3.6 Proposed System Methodology Workflow

### 3.6.1 User Registration and Onboarding Flow

```
User visits Landing Page
        │
        ▼
Clicks "Get Started" / "Build my schedule"
        │
        ▼
Sign Up Page ──── Enter email ──── Full registration form
        │                                    │
        ▼                                    ▼
Google OAuth Sign-In              Email/Password Registration
        │                                    │
        ▼                                    ▼
Check if user exists ◄───────────────────────┘
   │          │
   ▼          ▼
Exists    New User
   │          │
   ▼          ▼
Dashboard  Onboarding (4 steps)
              │
              ├── Step 1: Welcome
              ├── Step 2: Set preferences (max topics/day, max hard topics)
              ├── Step 3: Add courses (name, units, exam date, confidence)
              └── Step 4: Confirmation → Save to Firestore → Dashboard
```

### 3.6.2 Daily Study Workflow

```
Student opens Dashboard
        │
        ▼
MORNING CHECK-IN
├── Enter wake time and sleep time
├── Add fixed commitments (lectures, appointments)
├── System calculates free windows and total free hours
└── Click "Generate today's plan"
        │
        ▼
PRIORITY ENGINE RUNS
├── Calculate priority score for each course
├── Rank courses by score (descending)
├── Collect pending topics in priority order
├── Distribute topics across days respecting constraints
├── Extract today's topics
└── Save plan to Firestore
        │
        ▼
TODAY'S READING LIST DISPLAYED
├── Topics shown with course name, difficulty, estimated time
├── Student studies topics throughout the day
└── Taps topic to toggle done/pending status
        │
        ▼
EVENING CHECK-IN
├── Review completed vs. missed topics
├── Update confidence slider for each studied course
├── Submit check-in → saved to Firestore
├── Streak incremented
└── Plan reset for next morning
```

### 3.6.3 Data Flow Diagram

```
┌──────────┐     courses, topics,     ┌──────────────┐
│  Student  │ ──── preferences ────▶  │  Firestore   │
│  (User)   │                         │  Database    │
│           │ ◀── ranked courses, ──  │              │
│           │     daily plan,         │  Collections:│
│           │     streak, progress    │  - users     │
└──────────┘                         │  - courses   │
      │                               │  - topics    │
      │  inputs wake/sleep time,      │  - dailyPlans│
      │  commitments                  │  - checkIns  │
      ▼                               └──────────────┘
┌──────────────┐                           ▲
│  Priority    │   reads courses,          │
│  Engine      │ ◀─ topics, preferences ───┘
│              │
│  Outputs:    │
│  - Ranked    │
│    courses   │
│  - Daily     │
│    plan      │
│  - At-risk   │
│    flags     │
└──────────────┘
```
