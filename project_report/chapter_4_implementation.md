# CHAPTER FOUR: SYSTEM IMPLEMENTATION AND EVALUATION

## 4.1 Introduction

This chapter presents the implementation details of the StudyPilot application, including the tools and technologies used, system requirements, detailed implementation of each module, system testing procedures and results, and an overall evaluation of the system. The implementation follows the design and architecture described in Chapter 3.

## 4.2 Choice of Tools

The following tools and technologies were selected for the development of StudyPilot:

| Tool/Technology | Version | Purpose |
|---|---|---|
| **React.js** | 19.2.4 | Frontend JavaScript library for building the user interface using a component-based architecture. |
| **Vite** | 8.0.1 | Build tool and development server providing fast HMR (Hot Module Replacement) and optimised production builds. |
| **React Router DOM** | 7.13.1 | Client-side routing library enabling SPA navigation between pages without full-page reloads. |
| **Firebase** | 12.11.0 | Backend-as-a-Service (BaaS) platform providing Authentication and Cloud Firestore database. |
| **Tailwind CSS** | 4.2.2 | Utility-first CSS framework for rapid, responsive UI styling. |
| **Flowbite React** | 0.12.17 | React component library built on Tailwind CSS, used for select UI components (horizontal rules, navigation). |
| **ESLint** | 9.39.4 | JavaScript linter for identifying and fixing code quality issues during development. |
| **Visual Studio Code** | Latest | Primary code editor/IDE. |
| **Git** | Latest | Version control system for tracking code changes. |
| **Vercel** | — | Cloud hosting platform for deploying the production build of the application. |
| **Google Chrome DevTools** | Latest | Browser debugging, responsive design testing, and performance profiling. |
| **Node.js / npm** | Latest LTS | JavaScript runtime and package manager for dependency management and build scripts. |

## 4.3 System Requirements

### 4.3.1 Hardware Requirements

**Table 4.1: Hardware Requirements**

| Component | Minimum Requirement | Recommended |
|---|---|---|
| **Processor** | 1 GHz single-core | 2 GHz dual-core or higher |
| **RAM** | 2 GB | 4 GB or higher |
| **Storage** | 100 MB free space (for browser cache) | 500 MB free space |
| **Display** | 320px width (mobile) | 1024px width or higher |
| **Network** | Stable internet connection (256 Kbps) | Broadband (1 Mbps+) |
| **Input Device** | Touchscreen or mouse/keyboard | Mouse/keyboard and touchscreen |

> **Note:** These are end-user requirements for accessing the web application. Development requires higher specifications (8 GB RAM, 10 GB storage for node_modules and build tools).

### 4.3.2 Software Requirements

**Table 4.2: Software Requirements**

| Software | Requirement | Purpose |
|---|---|---|
| **Operating System** | Any (Windows, macOS, Linux, iOS, Android) | Platform for running the web browser |
| **Web Browser** | Google Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ | Accessing the StudyPilot application |
| **JavaScript** | Enabled in browser | Required for React SPA to function |
| **Internet Connection** | Required | Firebase Authentication and Firestore require network access |

> **For Development:**
> - Node.js v18+ with npm v9+
> - Git for version control
> - Visual Studio Code (recommended) or any code editor

## 4.4 System Implementation

This section describes the implementation of each major module of the StudyPilot application, referencing the actual source code.

### 4.4.1 Firebase Configuration Module (`src/FireBase.js`)

The Firebase configuration module initialises the Firebase application and exports the authentication and database instances used throughout the application.

**Implementation Details:**
- `initializeApp()` initialises the Firebase app with the project's configuration object (API key, auth domain, project ID, etc.).
- `getAuth()` returns the Firebase Authentication instance for managing user sessions.
- `getFirestore()` returns the Firestore database instance for data operations.
- `GoogleAuthProvider` is instantiated for Google OAuth sign-in functionality.

All other modules import `auth`, `db`, and `googleProvider` from this centralised configuration file, following the **single source of truth** principle.

### 4.4.2 Authentication Module (`src/utils/auth.js`, `LoginPage.jsx`, `SignupPage.jsx`)

**Google OAuth Sign-In (`auth.js`):**
- Uses Firebase's `signInWithPopup()` method with the Google provider.
- Handles specific error codes: `auth/popup-closed-by-user` and `auth/network-request-failed`.
- Returns the authenticated user object on success.

**Email/Password Login (`LoginPage.jsx`):**
- Uses Firebase's `signInWithEmailAndPassword()` method.
- Handles error codes: `auth/user-not-found`, `auth/wrong-password`, `auth/invalid-credential`.
- Redirects to the dashboard on successful authentication.
- Displays redirect messages (e.g., when a user is sent from signup with an existing account).

**Email/Password Registration (`SignupPage.jsx`):**
- Two-step registration flow: (1) enter email, (2) enter full details (name, password, confirm password).
- Implements client-side password validation requiring: minimum 8 characters, one uppercase letter, one lowercase letter, and one number.
- Uses Firebase's `createUserWithEmailAndPassword()` to create the account.
- Stores the user profile (name, email, role, creation date) in Firestore's `users` collection using `setDoc()`.
- Checks for existing accounts (`auth/email-already-in-use`) and redirects to login with an informative message.
- For Google sign-in during signup, checks if a Firestore user document exists: new users go to onboarding, returning users go to the dashboard.

**Password Recovery (`ForgotPasswordPage.jsx`):**
- Collects the user's email address with basic validation.
- Displays a success confirmation screen with instructions to check email.

### 4.4.3 Onboarding Module (`OnboardingPage.jsx`)

The onboarding module provides a **4-step guided setup** for new users:

| Step | Purpose | Data Collected |
|---|---|---|
| 1 — Welcome | Introduction to StudyPilot | None |
| 2 — Preferences | Study capacity settings | `maxTopics` per day, `maxHardTopics` per day |
| 3 — Add Courses | Course information entry | Course name, credit units, exam date, confidence (1–5) per course |
| 4 — Confirmation | Save data and proceed | None (triggers save) |

**Implementation Details:**
- Step navigation is managed by a `step` state variable (1–4).
- A visual progress bar shows completion status across all 4 steps.
- The `AddCourseForm` sub-component provides the course entry interface with input validation (all fields required before adding).
- On completion (`handleFinish`), the system saves:
  - User preferences to the `users` collection (using `setDoc` with the user's UID as document ID).
  - Each course to the `courses` collection (using `addDoc` for auto-generated IDs).

### 4.4.4 Priority Engine Module (`src/utils/priorityEngine.js`)

The Priority Engine is the core algorithmic module containing 9 exported functions:

**1. `calculatePriorityScore(course)`**
- Computes the composite priority score using the four-factor weighted formula.
- Returns a number rounded to 3 decimal places.

**2. `rankCourses(courses)`**
- Maps each course to include its priority score.
- Sorts courses in descending order (highest priority first).

**3. `calculateTopicWeight(topic)`**
- Computes a weight value combining estimated time and difficulty.
- Used to determine how much daily study capacity a topic consumes.

**4. `calculateDynamicDailyWeight(topics, preferences)`**
- Calculates the maximum daily weight dynamically based on total topics and hard topic count.
- Provides a fallback when the user has not set an explicit `maxDailyWeight` preference.

**5. `generateDailyPlan(courses, topics, preferences, freeMinutes)`**
- The main plan generation function implementing the algorithm described in Section 3.4.3(d).
- Returns an object mapping date strings (YYYY-MM-DD) to arrays of topic objects.

**6. `getTodaysPlan(plan)`**
- Extracts today's date from the full plan object.

**7. `rollover(missedTopics, courses, topics, preferences)`**
- Resets missed topics to "pending" status and regenerates the plan.

**8. `checkAtRisk(course, remainingTopics, preferences)`**
- Determines if a course's remaining workload exceeds what can be covered in the remaining days.

**9. `calculateStreak(checkIns)`**
- Sorts check-in records by date (newest first).
- Counts consecutive days with check-ins, allowing for the current day.

**10. `flagUrgent(courseId, courses, topics, preferences)`**
- Sets a course's exam date to tomorrow, forcing it to the top of the priority ranking.

### 4.4.5 Dashboard Module (`DashboardPage.jsx`)

The dashboard is the main application interface (772 lines) containing multiple sections:

**a) Data Loading and Authentication Guard:**
- Uses `onAuthStateChanged` listener to verify the user is authenticated.
- Redirects unauthenticated users to the login page.
- Fetches courses, topics, user data, and check-ins from Firestore on mount.
- Applies `rankCourses()` to the fetched courses.

**b) Greeting and Metric Cards:**
- Displays a time-based greeting ("Good morning/afternoon/evening") with the user's name.
- Shows 4 metric cards: Courses count, Topics count, Study Streak (🔥), and At-Risk courses count.

**c) Today's Reading List:**
- Displays the generated daily plan as a checklist.
- Each topic shows: course name, topic name, estimated time, and difficulty badge (Easy/Medium/Hard).
- Clicking a topic toggles its status (done/pending) with immediate visual feedback and Firestore update.

**d) Course Priority Section:**
- Lists all courses ranked by priority score.
- Each course shows: rank number, name, at-risk/watch badge, days until exam, progress bar, topic count, confidence level, and an "Add topic" button.

**e) Morning Check-in Section:**
- Time inputs for wake-up time and sleep time.
- Dynamic commitment list with add/remove functionality.
- Free windows display showing available study periods and total free hours.
- "Generate today's plan" button that triggers the Priority Engine.

**f) Add Topic Modal:**
- Modal dialog for adding topics to a specific course.
- Fields: topic name, estimated time (30min/1hr/2hr selection buttons), difficulty (1–5 slider).
- Saves to Firestore and refreshes the topics list.

**g) Evening Check-in Modal:**
- Reviews the day's topics with toggle functionality.
- Confidence sliders for each studied course.
- Saves check-in record to Firestore, updates course confidence, increments streak, and resets the daily plan.

### 4.4.6 Schedule/Calendar Module (`CourseDetail.jsx`)

- Displays a **7-day weekly calendar** showing planned topics per day.
- Week navigation buttons (previous/next week, "This week" reset).
- Today's card is highlighted with blue border and "TODAY" badge.
- Past days are displayed with reduced opacity.
- Each topic card shows: course name, topic name, difficulty badge, estimated time, and completion status.
- Data is fetched by cross-referencing `dailyPlans` (topic IDs) with `topics` collection.

### 4.4.7 Landing Page Module

The landing page comprises 5 sub-components:

- **AppNavbar:** Navigation bar with StudyPilot branding, "Get Started" button, and dark/light theme toggle.
- **HeroSection:** Hero text ("Study smarter. Stress less.") with a description and CTA button.
- **FeatureGrid:** 2×2 grid displaying four key features (Smart scheduling, Priority engine, Adaptive rebalance, Progress tracking).
- **StepsSection:** Three-step guide (Enter courses → Get schedule → Track and adjust).
- **FooterSection:** Simple footer component.

## 4.5 System Testing

System testing was conducted at two levels: **unit testing** of the Priority Engine algorithm and **functional testing** of all user-facing modules.

### 4.5.1 Unit Testing (Priority Engine)

The `testEngine.js` file contains unit tests with dummy data representing 3 courses and 7 topics:

| Test | Input | Expected Output | Result |
|---|---|---|---|
| Priority Score Calculation | 3 courses with varying exam dates, units, confidence | CSC 425 (nearest exam, low confidence) has highest score | ✅ Pass |
| Course Ranking | 3 unranked courses | Ranked: CSC 425 > MAT 201 > ENG 301 | ✅ Pass |
| Topic Weight Calculation | 7 topics with varying time and difficulty | Weights correctly computed (e.g., 2hr + difficulty 5 = 4.5) | ✅ Pass |
| Daily Plan Generation | 6 pending topics, maxDailyWeight=6, maxHardTopics=2 | Topics distributed across days respecting constraints | ✅ Pass |
| At-Risk Detection | CSC 425 with 3 pending topics, close exam | Returns `true` (workload exceeds capacity) | ✅ Pass |
| Course Progress | Courses with mixed done/pending topics | ENG 301: 50%, others: 0% | ✅ Pass |
| Streak Calculation | 4 check-ins (3 consecutive + gap) | Streak = 3 | ✅ Pass |
| Urgent Flag | Flag MAT 201 as urgent | MAT 201 topics appear first in regenerated plan | ✅ Pass |

### 4.5.2 Functional Testing

**Table 4.3: Functional Test Cases and Results**

| Test Case ID | Module | Test Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC-01 | Landing Page | Load landing page and verify all sections render | All 5 sections (Navbar, Hero, Features, Steps, Footer) visible | As expected | ✅ Pass |
| TC-02 | Landing Page | Click "Get Started" button | Navigate to /signup | Navigated successfully | ✅ Pass |
| TC-03 | Landing Page | Toggle dark/light mode | Colours switch between dark and light themes | As expected | ✅ Pass |
| TC-04 | Sign Up | Submit with empty fields | Error: "All fields are required" | As expected | ✅ Pass |
| TC-05 | Sign Up | Submit with mismatched passwords | Error: "Passwords do not match" | As expected | ✅ Pass |
| TC-06 | Sign Up | Submit with weak password (no uppercase) | Error listing password requirements | As expected | ✅ Pass |
| TC-07 | Sign Up | Submit valid registration | Account created, redirect to /onboarding | As expected | ✅ Pass |
| TC-08 | Sign Up | Register with existing email | Redirect to /login with message | As expected | ✅ Pass |
| TC-09 | Sign Up | Google sign-in (new user) | Account created, redirect to /onboarding | As expected | ✅ Pass |
| TC-10 | Sign Up | Google sign-in (returning user) | Redirect to /dashboard | As expected | ✅ Pass |
| TC-11 | Login | Submit valid credentials | Redirect to /dashboard | As expected | ✅ Pass |
| TC-12 | Login | Submit wrong password | Error: "Incorrect email or password" | As expected | ✅ Pass |
| TC-13 | Login | Google sign-in | Redirect to /dashboard | As expected | ✅ Pass |
| TC-14 | Forgot Password | Submit valid email | Success screen with "Check your email" message | As expected | ✅ Pass |
| TC-15 | Onboarding | Complete all 4 steps | Courses and preferences saved, redirect to /dashboard | As expected | ✅ Pass |
| TC-16 | Onboarding | Try to proceed from Step 3 with no courses | "Next" button disabled | As expected | ✅ Pass |
| TC-17 | Dashboard | View metric cards | Shows correct counts for courses, topics, streak, at-risk | As expected | ✅ Pass |
| TC-18 | Dashboard | Add a topic to a course | Topic saved, appears in topics list | As expected | ✅ Pass |
| TC-19 | Dashboard | Generate daily plan | Plan generated, topics displayed in reading list | As expected | ✅ Pass |
| TC-20 | Dashboard | Toggle topic completion | Status changes visually and in Firestore | As expected | ✅ Pass |
| TC-21 | Dashboard | Submit evening check-in | Check-in saved, streak incremented, plan reset | As expected | ✅ Pass |
| TC-22 | Dashboard | Logout | Redirect to /login, session ended | As expected | ✅ Pass |
| TC-23 | Schedule | View weekly schedule | 7 day cards displayed with correct dates | As expected | ✅ Pass |
| TC-24 | Schedule | Navigate to next/previous week | Week changes, correct dates displayed | As expected | ✅ Pass |
| TC-25 | Responsive | View dashboard on 375px width | Layout adapts to single column, all elements accessible | As expected | ✅ Pass |

## 4.6 System Evaluation

### 4.6.1 Evaluation Against Objectives

| Objective | Implementation Status | Evidence |
|---|---|---|
| 1. Priority Engine algorithm | ✅ Fully Implemented | `priorityEngine.js` — 229 lines, 9 exported functions, four-factor weighted formula |
| 2. Daily plan generation | ✅ Fully Implemented | `generateDailyPlan()` with weight, time, and hard topic constraints |
| 3. Authentication and onboarding | ✅ Fully Implemented | Email/password + Google OAuth sign-in; 4-step onboarding |
| 4. Interactive dashboard | ✅ Fully Implemented | 772-line `DashboardPage.jsx` with metrics, lists, progress bars |
| 5. Morning/evening check-ins | ✅ Fully Implemented | Morning: time/commitment input + plan generation; Evening: review + confidence update + streak |
| 6. Weekly schedule view | ✅ Fully Implemented | `CourseDetail.jsx` with 7-day grid and week navigation |
| 7. Responsive web deployment | ✅ Fully Implemented | Responsive design + Vercel deployment |

### 4.6.2 Performance Evaluation

- **Plan Generation Speed:** The Priority Engine generates a daily plan from up to 20 courses and 100 topics in under 50 milliseconds (measured via Chrome DevTools), well within the 2-second target.
- **Page Load Time:** The dashboard page loads in approximately 1.5 seconds (including Firestore data fetching) on a standard broadband connection.
- **Bundle Size:** The Vite production build produces an optimised JavaScript bundle suitable for fast delivery via Vercel's CDN.

### 4.6.3 Strengths

1. **Intelligent Prioritisation:** The weighted algorithm produces intuitive and academically sound course rankings.
2. **User-Friendly Interface:** Clean, modern UI design with clear visual hierarchy and minimal learning curve.
3. **Complete Daily Workflow:** The morning-to-evening workflow provides a structured daily study routine.
4. **Real-Time Data:** Firebase Firestore ensures data is always current across sessions and devices.
5. **Free and Accessible:** No cost, no installation — works in any modern browser.

### 4.6.4 Weaknesses

1. **No offline mode** — requires internet for all operations.
2. **No push notifications** — students must remember to open the app.
3. **Limited to browser** — no native mobile app experience.
4. **Single-user only** — no collaborative features.
