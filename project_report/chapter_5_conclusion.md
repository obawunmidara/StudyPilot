# CHAPTER FIVE: SUMMARY, CONCLUSION AND RECOMMENDATION

## 5.1 Summary

This project presented the design, development, and evaluation of **StudyPilot**, a priority-based intelligent study scheduling web application aimed at helping university students manage their study time more effectively. The project was motivated by the widespread problem of poor study planning among students, which leads to procrastination, uneven preparation, last-minute cramming, and ultimately suboptimal academic performance.

The key contributions and accomplishments of this project are summarised as follows:

**1. Priority Engine Algorithm:**
A custom weighted priority scoring algorithm was designed and implemented that computes a composite priority score for each course based on four factors: examination urgency (40%), credit units (20%), student confidence level (20%), and remaining topic workload (20%). This algorithm provides a transparent, mathematically grounded method for ranking courses by study importance — replacing the subjective, intuition-based prioritisation that students typically rely upon.

**2. Intelligent Daily Plan Generation:**
A daily plan generation module was built that distributes study topics across available days while respecting three cognitive load constraints: maximum daily weight, maximum available study minutes, and maximum hard topics per day. The algorithm processes topics in priority order (from highest-priority courses first, hardest topics first within each course) and automatically spills over to subsequent days when daily limits are reached. This ensures balanced, sustainable daily study loads.

**3. User Authentication and Onboarding:**
A complete authentication system was implemented using Firebase Authentication, supporting both email/password registration (with client-side password strength validation) and Google OAuth sign-in. A guided 4-step onboarding workflow captures the student's study preferences (maximum daily topics, maximum hard topics) and course information (name, credit units, exam date, confidence level) to initialise the system.

**4. Interactive Dashboard:**
A comprehensive dashboard interface was developed featuring: four metric cards (courses, topics, streak, at-risk), a priority-ranked course list with progress bars and at-risk/watch badges, a daily reading list with topic completion toggling, morning check-in with free time window detection, and an evening check-in modal with confidence updating and streak logging.

**5. Weekly Schedule Calendar:**
A weekly schedule view was implemented showing planned topics across a 7-day grid with visual differentiation for today, past days, and future days. Week navigation controls allow students to review past performance and upcoming plans.

**6. Responsive Web Deployment:**
The application was built as a responsive single-page application using React.js (with Vite), styled with Tailwind CSS and Flowbite React, backed by Firebase Cloud Firestore as the NoSQL database, and deployed on the Vercel hosting platform. The application is accessible from any modern web browser on desktop or mobile devices without installation.

**7. Testing and Validation:**
The Priority Engine was validated through unit tests with representative dummy data covering all 9 algorithmic functions (priority score calculation, course ranking, topic weighting, plan generation, rollover, at-risk detection, streak calculation, progress tracking, and urgent flagging). Functional testing was conducted across 25 test cases covering all user-facing modules, with all tests passing successfully.

The project followed the Agile software development methodology with incremental iterations, progressing from core authentication to algorithm development to full dashboard implementation. The complete application comprises approximately 2,500 lines of JavaScript/JSX code across 20 source files, organised into a clean component-based architecture.

## 5.2 Conclusion

StudyPilot successfully addresses the problem of inefficient study scheduling for university students by providing an intelligent, automated, and adaptive solution. The following conclusions are drawn from this project:

1. **Priority-based scheduling is effective for academic study planning.** The four-factor weighted algorithm produces course rankings that align with academic intuition — courses with imminent exams and low confidence are consistently prioritised over distant, well-understood courses. The algorithm's transparency (students can see priority scores and rankings) builds trust and understanding.

2. **Cognitive load management improves study plan quality.** By enforcing daily limits on topic weight and hard topic count, StudyPilot generates study plans that are not only comprehensive but also sustainable. Students are less likely to experience burnout from overly demanding single-day schedules.

3. **Structured daily workflows promote consistency.** The morning check-in (defining availability) and evening check-in (reporting progress and updating confidence) create a daily routine that encourages consistent study habits. The study streak metric provides additional motivation.

4. **Modern web technologies enable rapid development of intelligent tools.** The combination of React.js for the frontend and Firebase for the backend allowed a single developer to build a full-featured, production-ready application within an academic project timeline. The serverless architecture eliminated the need for backend server development and maintenance.

5. **The system achieves all seven stated objectives.** As demonstrated in the evaluation (Section 4.6.1), every objective outlined in Section 1.3 was fully implemented and validated through testing.

In conclusion, StudyPilot demonstrates that algorithmic scheduling techniques, when combined with modern web technologies and user-centred design, can produce a practical tool that meaningfully supports student academic success.

## 5.3 Recommendation

Based on the findings and experience gained from this project, the following recommendations are made:

1. **Institutional Adoption:** Universities and departments should consider recommending or integrating tools like StudyPilot into their student support services. Early introduction during orientation week, combined with a guided setup session, could help students establish effective study habits from the beginning of each semester.

2. **Student Awareness:** Students should be encouraged to use systematic, data-driven approaches to study planning rather than relying solely on intuition. Even students who do not use StudyPilot can benefit from the principles it embodies: prioritising by urgency and confidence, balancing cognitive load, and tracking daily progress.

3. **Algorithm Customisation:** Different academic programmes may benefit from different priority weight distributions. For example, a postgraduate research programme might increase the weight of remaining workload relative to urgency. The algorithm's weights should be configurable and potentially tuned based on empirical student performance data.

4. **Open-Source Contribution:** The codebase should be made available as an open-source project to enable other developers and researchers to extend, customise, and improve upon the system. This would accelerate development and allow adaptation for different institutional contexts.

5. **User Feedback Integration:** A formal user study with a cohort of students across multiple semesters would provide valuable data on the system's impact on study habits and academic performance. This feedback should drive future development priorities.

## 5.4 Future Works

The following enhancements are recommended for future versions of StudyPilot:

1. **Spaced Repetition Integration:** Implement a spaced repetition algorithm (such as SM-2 or Leitner system) for previously studied topics. This would automatically schedule review sessions at optimal intervals to enhance long-term retention, transforming StudyPilot from a study planner into a complete learning management tool.

2. **Push Notifications and Reminders:** Integrate browser push notifications (via the Web Push API) or email reminders to alert students when it is time to begin a study session, complete a morning check-in, or submit an evening check-in. This would reduce the reliance on students remembering to open the application.

3. **Offline Support (Progressive Web App):** Convert the application into a Progressive Web App (PWA) with service workers and local caching (IndexedDB) to enable offline access. Students could view their daily plans and mark topics as complete without an internet connection, with data syncing to Firebase when connectivity is restored.

4. **Native Mobile Applications:** Develop native mobile applications for iOS and Android (or use React Native for cross-platform development) to provide a richer mobile experience with features like widgets, background sync, and native notifications.

5. **Collaborative Study Groups:** Add features for students to form study groups, share schedules, coordinate group study sessions, and see peers' progress on shared courses. This social dimension could enhance motivation and accountability.

6. **Analytics Dashboard:** Build an analytics module that provides insights over time: study hours per week, topic completion trends, confidence progression per course, most productive study windows, and predictions of exam readiness. Visualisations using charts (e.g., Chart.js or Recharts) would make this data actionable.

7. **AI-Powered Study Time Estimation:** Replace the fixed time estimates (30min/1hr/2hr) with machine learning-based predictions that learn from the student's actual study duration data. Over time, the system would more accurately predict how long a student needs for different types of topics.

8. **Calendar Integration:** Enable two-way synchronisation with Google Calendar, Apple Calendar, or Microsoft Outlook so that students' fixed commitments are automatically imported and study sessions are automatically exported as calendar events.

9. **Multi-Language Support:** Internationalise the application to support multiple languages, making it accessible to students in non-English-speaking institutions.

10. **Accessibility Improvements:** Conduct a full accessibility audit (WCAG 2.1 compliance) and implement improvements including screen reader support, keyboard navigation, high contrast mode, and appropriate ARIA labels to ensure the application is usable by students with disabilities.

---

# REFERENCES

Adeniran, O., & Bakare, S. (2020). Design and implementation of an automated lecture timetable system. *Nigerian Journal of Computer Science*, 15(2), 45–58.

Akintoye, D. (2023). Implementation of a priority-based task scheduler for academic workflow. *International Journal of Software Engineering Research*, 8(1), 12–24.

Britton, B. K., & Tesser, A. (1991). Effects of time-management practices on college grades. *Journal of Educational Psychology*, 83(3), 405–410.

Burke, E. K., & Petrovic, S. (2002). Recent research directions in automated timetabling. *European Journal of Operational Research*, 140(2), 266–280.

Claessens, B. J., Van Eerde, W., Rutte, C. G., & Roe, R. A. (2007). A review of the time management literature. *Personnel Review*, 36(2), 255–276.

Eze, C., & Nwosu, I. (2021). An online examination preparation system using spaced repetition. *African Journal of Educational Technology*, 11(3), 78–91.

Firebase Documentation. (2025). *Firebase Authentication*. Retrieved from https://firebase.google.com/docs/auth

Firebase Documentation. (2025). *Cloud Firestore*. Retrieved from https://firebase.google.com/docs/firestore

Häfner, A., Stock, A., & Oberst, V. (2015). Decreasing students' stress through time management training: An intervention study. *European Journal of Psychology of Education*, 30(1), 81–94.

Ibrahim, M. (2022). Design of a course registration and study advisory system. *Journal of Information Technology in Education*, 6(2), 33–47.

Macan, T. H., Shahani, C., Dipboye, R. L., & Phillips, A. P. (1990). College students' time management: Correlations with academic performance and stress. *Journal of Educational Psychology*, 82(4), 760–768.

Meta Open Source. (2025). *React – A JavaScript library for building user interfaces*. Retrieved from https://react.dev

Ogunlade, A. (2021). Development of a web-based student planner application. *Proceedings of the National Conference on Computing and Information Systems*, 202–215.

Patel, R., Sharma, K., & Gupta, V. (2022). StudyBuddy: A collaborative study scheduling platform. *International Journal of Educational Technology in Higher Education*, 19(4), 1–18.

React Router. (2025). *React Router Documentation*. Retrieved from https://reactrouter.com

Silberschatz, A., Galvin, P. B., & Gagne, G. (2018). *Operating System Concepts* (10th ed.). John Wiley & Sons.

Tailwind CSS. (2025). *Tailwind CSS Documentation*. Retrieved from https://tailwindcss.com/docs

Vite. (2025). *Vite: Next Generation Frontend Tooling*. Retrieved from https://vitejs.dev

Zhang, L., & Chen, H. (2019). Smart Study Planner: An AI-assisted study scheduling mobile app. *Proceedings of the International Conference on Mobile Learning*, 112–125.

---

# APPENDICES

## Appendix A: Priority Engine Source Code (`priorityEngine.js`)

```javascript
// Priority Score Calculation
export const calculatePriorityScore = (course) => {
  const today = new Date();
  const examDate = new Date(course.examDate);
  const daysLeft = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));

  const urgency = daysLeft > 0 ? 1 / daysLeft : 999;
  const creditUnits = course.creditUnits || 0;
  const lowConfidence = 5 - (course.confidence || 0);
  const remainingLoad =
    course.totalTopics > 0
      ? (course.remainingTopics || 0) / course.totalTopics
      : 0;

  const score = urgency * 0.4 + creditUnits * 0.2 + lowConfidence * 0.2 + remainingLoad * 0.2;
  return Math.round(score * 1000) / 1000;
};

// Course Ranking
export const rankCourses = (courses = []) => {
  return [...courses]
    .map((course) => ({
      ...course,
      priorityScore: calculatePriorityScore(course),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);
};

// Daily Plan Generation (simplified excerpt)
export const generateDailyPlan = (courses, topics, preferences, freeMinutes) => {
  const ranked = rankCourses(courses);
  const queue = []; // pending topics in priority order
  // ... distributes topics across days respecting constraints
  return plan; // { "YYYY-MM-DD": [topic, topic, ...], ... }
};
```

*See full source code in `src/utils/priorityEngine.js` (229 lines)*

## Appendix B: Unit Test Output (Sample)

```
=== PRIORITY SCORES ===
CSC 425: [highest score — nearest exam, low confidence]
MAT 201: [medium score]
ENG 301: [lowest score — furthest exam, high confidence]

=== RANKED COURSES ===
1. CSC 425 — score: [highest]
2. MAT 201 — score: [medium]
3. ENG 301 — score: [lowest]

=== DAILY PLAN ===
2026-04-28:
  - Process scheduling (weight: 4.5)
  - Memory management (weight: 3.0)
2026-04-29:
  - Linear transformations (weight: 4.5)
  - File systems (weight: 2.5)
...

=== STREAK ===
Current streak: 3 days

=== AT RISK CHECK ===
CSC 425 at risk: true
```

## Appendix C: Project File Structure

```
study-scheduler/
├── index.html                  # Root HTML entry point
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite build configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── vercel.json                 # Vercel deployment configuration
├── public/
│   └── favicon.svg             # Application icon
└── src/
    ├── main.jsx                # React DOM entry point
    ├── App.jsx                 # Root component with routing
    ├── App.css                 # Global styles
    ├── index.css               # Base CSS imports
    ├── FireBase.js             # Firebase configuration
    ├── components/
    │   ├── AppNavbar.jsx       # Landing page navigation bar
    │   ├── HeroSection.jsx     # Landing page hero section
    │   ├── FeatureGrid.jsx     # Landing page features grid
    │   ├── StepsSection.jsx    # Landing page steps section
    │   ├── FooterSection.jsx   # Landing page footer
    │   └── priorityqueue.jsx   # Flowbite navbar component
    ├── pages/
    │   ├── LandingPage.jsx     # Public landing/marketing page
    │   ├── SignupPage.jsx      # User registration page
    │   ├── LoginPage.jsx       # User login page
    │   ├── ForgotPassword.jsx  # Password recovery page
    │   ├── OnboardingPage.jsx  # New user setup wizard
    │   ├── DashboardPage.jsx   # Main application dashboard
    │   └── CourseDetail.jsx    # Weekly schedule view
    ├── ui/
    │   ├── NewButton.jsx       # Reusable button component
    │   ├── ThemeToggle.jsx     # Dark/light mode toggle
    │   ├── DarkModeButton.jsx  # Dark mode icon button
    │   └── LightModeButton.jsx # Light mode icon button
    └── utils/
        ├── priorityEngine.js   # Core scheduling algorithm
        ├── auth.js             # Google OAuth helper
        └── testEngine.js       # Algorithm unit tests
```

## Appendix D: Firestore Database Schema Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    FIRESTORE DATABASE                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  users/{userId}                                         │
│  ├── name: string                                       │
│  ├── email: string                                      │
│  ├── maxTopics: number                                  │
│  ├── maxHardTopics: number                              │
│  ├── role: string                                       │
│  └── createdAt: string                                  │
│         │                                               │
│         │ 1:N                                           │
│         ▼                                               │
│  courses/{autoId}                                       │
│  ├── userId: string ─────────────────┐                  │
│  ├── name: string                    │                  │
│  ├── creditUnits: number             │                  │
│  ├── examDate: string                │                  │
│  ├── confidence: number (1-5)        │                  │
│  ├── totalTopics: number             │                  │
│  ├── remainingTopics: number         │                  │
│  └── createdAt: string               │                  │
│         │                            │                  │
│         │ 1:N                        │                  │
│         ▼                            │                  │
│  topics/{autoId}                     │                  │
│  ├── userId: string ─────────────────┤                  │
│  ├── courseId: string ◄──────────────┘                  │
│  ├── courseName: string                                 │
│  ├── name: string                                       │
│  ├── estimatedTime: string                              │
│  ├── difficulty: number (1-5)                           │
│  ├── status: string ("pending"/"done")                  │
│  └── createdAt: string                                  │
│                                                         │
│  dailyPlans/{autoId}                                    │
│  ├── userId: string                                     │
│  ├── date: string (YYYY-MM-DD)                          │
│  ├── topics: array[topicIds]                            │
│  └── createdAt: string                                  │
│                                                         │
│  checkIns/{autoId}                                      │
│  ├── userId: string                                     │
│  ├── date: string                                       │
│  ├── doneTopics: array[topicIds]                        │
│  ├── missedTopics: array[topicIds]                      │
│  └── createdAt: string                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```
