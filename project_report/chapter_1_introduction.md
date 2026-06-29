# CHAPTER ONE: INTRODUCTION

## 1.1 Background of the Study

The academic landscape of higher institutions in Nigeria and globally demands that students manage multiple courses simultaneously within a single semester. Each course comes with its own syllabus, credit load, lecture schedules, assignments, and examination dates. Students are expected to independently plan their personal study time to adequately prepare for all courses — a task that is cognitively demanding and frequently mismanaged (Britton & Tesser, 1991).

Time management is consistently identified in educational research as one of the strongest predictors of academic success (Macan et al., 1990; Claessens et al., 2007). Despite this, many students lack effective strategies for allocating study time across courses of varying difficulty and urgency. The result is a cycle of procrastination, last-minute cramming, uneven preparation, and ultimately poor academic performance or unnecessary stress.

Traditional approaches to study planning include handwritten timetables, basic calendar applications (such as Google Calendar), and generic to-do list apps. While these tools provide a basic framework for organising tasks, they are fundamentally **static** — they do not adapt to changing circumstances such as approaching exam deadlines, the student's evolving confidence in a subject, or the cognitive difficulty of remaining topics. Moreover, these tools place the entire burden of scheduling decisions on the student, requiring manual assessment of which course to study, for how long, and in what order.

Recent advances in web technology have made it possible to build intelligent, data-driven applications that can automate complex scheduling decisions. Modern JavaScript frameworks like **React.js**, combined with cloud services like **Firebase**, allow developers to create responsive, real-time web applications accessible from any device with a browser. These technologies provide the foundation for building a study scheduling tool that is not only functional but also intelligent and adaptive.

**StudyPilot** was conceived to bridge the gap between generic planning tools and the specific, dynamic needs of university students. By combining a custom priority-scoring algorithm with real-time data persistence and an intuitive user interface, StudyPilot aims to transform how students approach their daily study routines — moving from manual guesswork to algorithmically optimised, personalised study plans.

## 1.2 Statement of the Problem

University students face several interconnected problems when it comes to managing their study time:

1. **Information Overload:** Students typically register between five to eight courses per semester, each with distinct topics, weightings, and timelines. Manually tracking all of this information and making optimal study allocation decisions becomes overwhelming.

2. **Static Scheduling:** Existing tools (paper timetables, calendar apps) produce fixed schedules that do not respond to changes. If a student misses a study session or discovers a course is more difficult than anticipated, the entire plan must be manually restructured.

3. **Poor Prioritisation:** Without a systematic method for ranking courses, students tend to study what feels most comfortable rather than what is most urgent or important. Courses with lower confidence levels or imminent examinations may be neglected until it is too late.

4. **No Cognitive Load Management:** Students often attempt to study several difficult topics in a single day, leading to mental fatigue and diminished learning effectiveness. Existing tools provide no mechanism for balancing topic difficulty across a study day.

5. **Lack of Accountability and Tracking:** Most planning tools do not provide feedback loops. Students cannot easily track their study streaks, see which courses are falling behind, or receive alerts about at-risk subjects.

6. **Accessibility:** Many existing solutions require downloading native applications or paid subscriptions, creating barriers to adoption for students with limited resources.

These problems collectively result in inefficient study habits, increased academic anxiety, and suboptimal examination performance. There is a clear need for an intelligent, web-based study scheduling system that automatically prioritises courses, generates adaptive daily plans, manages cognitive load, and provides progress tracking — all within a free, accessible interface.

## 1.3 Aim and Objectives

### Aim
The aim of this project is to design and develop **StudyPilot**, a priority-based intelligent study scheduling web application that automatically generates personalised daily study plans for university students based on course urgency, difficulty, credit units, and student confidence levels.

### Objectives
The specific objectives of this project are to:

1. **Design and implement a Priority Engine algorithm** that computes a composite priority score for each course based on four weighted factors: examination urgency (40%), credit units (20%), student confidence level (20%), and remaining workload (20%).

2. **Develop a daily plan generation module** that distributes study topics across available days while respecting cognitive load constraints (maximum daily weight, maximum hard topics per day, and available free time).

3. **Implement a user authentication and onboarding system** supporting both email/password registration and Google OAuth sign-in, allowing students to securely create accounts and set up their course profiles.

4. **Build an interactive dashboard** that displays course priority rankings, today's reading list, study streak metrics, at-risk course alerts, and progress tracking for each course.

5. **Create morning and evening check-in workflows** that allow students to define their daily availability (wake time, sleep time, fixed commitments) and report on their study progress, enabling the system to adapt and calculate streaks.

6. **Implement a weekly schedule calendar view** that provides a visual overview of planned topics across the current week, with navigation to past and future weeks.

7. **Deploy the application** as a responsive, mobile-friendly web application accessible from any modern web browser without installation requirements.

## 1.4 Methodology

This project follows the **Agile Software Development Methodology** with an incremental and iterative approach. The Agile methodology was chosen because of its flexibility, its emphasis on delivering working software in short iterations, and its suitability for single-developer academic projects where requirements may evolve during development.

The development process comprised the following phases:

1. **Requirements Gathering:** Analysis of the study scheduling problem through literature review and identification of functional and non-functional requirements.

2. **System Design:** Creation of use case diagrams, system architecture diagrams, entity-relationship diagrams, and algorithm flowcharts for the priority engine and daily plan generator.

3. **Frontend Development:** Building the user interface using React.js (bootstrapped with Vite), Tailwind CSS for styling, and Flowbite React for select UI components. The application follows a component-based architecture with separate pages for landing, authentication, onboarding, dashboard, course detail/schedule, and password recovery.

4. **Backend/Database Integration:** Using Firebase Authentication for user management and Firebase Cloud Firestore as the NoSQL database for storing user profiles, courses, topics, daily plans, and check-in records.

5. **Algorithm Development:** Implementing the Priority Engine (priorityEngine.js) with functions for priority score calculation, course ranking, topic weight calculation, daily plan generation, rollover handling, at-risk detection, streak calculation, and urgent flagging.

6. **Testing:** Conducting unit testing on the priority engine algorithms (testEngine.js) with dummy data, and functional testing on all user interface modules.

7. **Deployment:** Deploying the application to **Vercel** for hosting, with Firebase providing the backend services.

## 1.5 Significance of the Study

The significance of this project lies in the following contributions:

1. **Practical Solution for Students:** StudyPilot provides a free, accessible, and intelligent tool that directly addresses the study planning challenges faced by university students. By automating the scheduling process, students can focus on learning rather than planning.

2. **Novel Priority Algorithm:** The project introduces a custom weighted priority scoring formula that combines four key academic factors (urgency, credit units, confidence, workload) into a single actionable score. This algorithm can be adapted and extended for other educational scheduling contexts.

3. **Cognitive Load Management:** Unlike generic scheduling tools, StudyPilot incorporates topic difficulty ratings and enforces daily limits on hard topics, promoting healthier and more effective study habits.

4. **Adaptive Scheduling:** The rollover mechanism ensures that missed study sessions are automatically rescheduled, preventing topics from being permanently lost from the plan. This adaptive capability distinguishes StudyPilot from static scheduling tools.

5. **Academic Contribution:** This project contributes to the body of knowledge in educational technology and software engineering by demonstrating how modern web technologies (React, Firebase) can be combined with algorithmic scheduling to create a practical student support tool.

6. **Technology Demonstration:** The project serves as a reference implementation for integrating React.js with Firebase services, implementing client-side scheduling algorithms, and building responsive single-page applications (SPAs).

## 1.6 Scope and Limitations

### Scope
The scope of this project encompasses:

- Development of a web-based study scheduling application for individual university students.
- Implementation of user registration, login (email/password and Google OAuth), and password recovery functionality.
- A guided onboarding process for adding courses with credit units, exam dates, and confidence levels.
- A priority engine that ranks courses and generates daily study plans based on available free time and topic attributes.
- A dashboard displaying course priorities, daily reading lists, study metrics (streak, course count, topic count, at-risk courses), and progress bars.
- Morning check-in (defining daily schedule and generating plans) and evening check-in (marking completed topics and updating confidence) workflows.
- A weekly calendar schedule view showing planned topics per day.
- Responsive design supporting both desktop and mobile browsers.
- Deployment on the Vercel hosting platform with Firebase backend.

### Limitations
The following limitations are acknowledged:

1. **Single-User Planning:** The system is designed for individual use. It does not support collaborative study groups or shared schedules between students.

2. **No Offline Support:** The application requires an active internet connection to authenticate users and synchronise data with Firebase Firestore. Offline functionality is not currently implemented.

3. **No Push Notifications:** The system does not send push notifications or reminders to prompt students to begin study sessions or complete check-ins.

4. **Simplified Difficulty Model:** Topic difficulty is captured as a single 1–5 rating. A more sophisticated model could incorporate prerequisite dependencies between topics, learning style preferences, or historical performance data.

5. **No Spaced Repetition:** The current algorithm does not implement spaced repetition scheduling for previously studied topics, which is a proven method for long-term retention.

6. **Static Time Estimation:** Estimated time per topic (30min, 1hr, 2hr) is set by the student and does not adapt based on actual time spent during study sessions.

7. **Browser-Only:** The application is a web application and does not have native mobile applications for iOS or Android, though the responsive design ensures usability on mobile browsers.

## 1.7 Definition of Terms

| Term | Definition |
|---|---|
| **Priority Engine** | A custom algorithm module within StudyPilot that computes a numerical priority score for each course based on weighted factors (urgency, credit units, confidence, workload) and uses this score to rank courses and allocate study topics. |
| **Priority Score** | A composite numerical value calculated for each course that represents how urgently and heavily it should be studied. Higher scores indicate higher priority. |
| **Topic Weight** | A numerical value assigned to each study topic based on its estimated time and difficulty level, used to determine how much of the daily study capacity it consumes. |
| **Daily Plan** | An algorithmically generated list of study topics assigned to a specific date, respecting the student's available free time and cognitive load constraints. |
| **Morning Check-in** | A daily workflow where the student enters their wake time, sleep time, and fixed commitments. The system calculates free windows and generates a study plan for the day. |
| **Evening Check-in** | A daily workflow where the student marks completed topics, updates their confidence level for each studied course, and logs the session to maintain their study streak. |
| **Study Streak** | A count of consecutive days on which the student has completed an evening check-in, used as a motivational metric. |
| **At-Risk Course** | A course whose examination is within 7 days, indicating that the student may not have sufficient time to cover all remaining topics. |
| **Watch Course** | A course whose examination is within 14 days, serving as an early warning indicator. |
| **Rollover** | The process of automatically rescheduling missed (incomplete) study topics to subsequent days. |
| **Onboarding** | A guided multi-step setup process that new users complete after registration to add their courses and set their study preferences. |
| **Firestore** | Firebase Cloud Firestore — a flexible, scalable NoSQL cloud database provided by Google Firebase, used in this project to store all user, course, topic, plan, and check-in data. |
| **SPA (Single-Page Application)** | A web application architecture in which the page does not reload during use; navigation between views is handled entirely by JavaScript (React Router in this project). |
| **Vite** | A modern frontend build tool that provides fast development server startup and optimised production builds. Used as the build tool for this React project. |
| **OAuth** | An open standard for access delegation, used in this project to enable Google Sign-In without the user sharing their Google password with StudyPilot. |
| **Cognitive Load** | The total amount of mental effort being used in the working memory. In this project, cognitive load management refers to limiting the number and difficulty of study topics assigned in a single day. |
