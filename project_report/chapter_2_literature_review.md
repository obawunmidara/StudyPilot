# CHAPTER TWO: LITERATURE REVIEW

## 2.1 Study Scheduling and Time Management Systems

Study scheduling is a branch of time management concerned with the systematic allocation of study periods to academic tasks and subjects over a defined timeframe. In the context of higher education, study scheduling involves determining **what** to study, **when** to study it, **for how long**, and **in what order** — decisions that directly impact learning outcomes and examination performance.

### 2.1.1 The Concept of Time Management in Education

Time management in education refers to the behaviours and strategies that students employ to effectively use their available time for academic purposes. Aeon and Aguinis (2017) provided a comprehensive review of time management literature and defined time management as "a form of decision making used by individuals to structure, protect, and adapt their time to changing conditions." They identified that effective time management requires setting goals and priorities, using structured planning tools, and maintaining a preference for organisation.

Adams and Blair (2019) studied the impact of time management behaviours on undergraduate engineering students' performance and found that perceived control of time was the specific factor that correlated significantly with cumulative GPA. Their findings underscore the importance of giving students tools that help them feel in control of their study schedules — a core design principle behind StudyPilot.

Wolters and Brady (2021) further argued that time management should be understood as a self-regulated learning (SRL) process. Their review demonstrated that students who used structured scheduling methods exhibited stronger academic engagement and achievement compared to those who studied without a formal plan.

### 2.1.2 Automated Scheduling Systems

Automated scheduling systems use computational algorithms to assign tasks or events to time slots while satisfying a set of constraints. Tan et al. (2021) provided a comprehensive survey of optimisation methodologies in school timetabling problems, noting that constraint satisfaction and priority-based heuristics are among the most effective approaches. While their review focused on institutional timetabling, the same algorithmic principles can be applied to personal study planning.

The key advantage of automated study scheduling over manual planning is the ability to process multiple variables simultaneously (course urgency, difficulty, time availability, cognitive load) and produce optimised plans that would be impractical for a student to compute manually.

### 2.1.3 Priority-Based Scheduling

Priority-based scheduling is a scheduling paradigm in which tasks are ordered according to a computed priority value, and higher-priority tasks are scheduled first (Silberschatz et al., 2018). This concept is well-established in operating systems for CPU process scheduling and has been adapted in this project for the study scheduling domain.

In StudyPilot's context, priority-based scheduling means that each course receives a composite priority score computed from four weighted factors, and the system generates daily plans by selecting topics from the highest-priority courses first, subject to daily capacity constraints.

### 2.1.4 Cognitive Load Theory and Study Planning

Sweller et al. (2019) revisited cognitive load theory twenty years after their seminal work and reaffirmed that working memory has limited capacity and duration. They argued that instructional design — and by extension, study planning — should account for these limitations to avoid cognitive overload. StudyPilot incorporates this principle by limiting the number of difficult topics assigned per day and capping total daily study weight.

## 2.2 Types and Methods of Study Scheduling Systems

Study scheduling systems can be categorised based on their approach to generating and managing study plans:

### 2.2.1 Manual Scheduling Systems

Manual scheduling involves students creating their own timetables using paper, whiteboards, or basic digital tools such as spreadsheets. The student is entirely responsible for assessing priorities, estimating time requirements, and structuring the schedule.

**Advantages:** Complete control, no technology dependency, simple for few courses.

**Disadvantages:** Does not scale, susceptible to bias (students avoid difficult subjects), cannot adapt dynamically, no tracking or accountability.

### 2.2.2 Calendar-Based Scheduling Systems

Calendar-based systems (e.g., Google Calendar, Apple Calendar) allow students to create time-blocked events for study sessions with reminders and cross-device synchronisation.

**Advantages:** Visual time-block representation, reminders, synchronisation, widely available.

**Disadvantages:** No intelligence or prioritisation, static entries, no understanding of academic concepts (courses, difficulty, exams), no progress tracking.

### 2.2.3 To-Do List and Task Management Systems

Task management applications (e.g., Todoist, Microsoft To Do, Notion) allow students to create, organise, and check off study tasks with due dates and priority tags.

**Advantages:** Task completion tracking, priority tagging, sub-task hierarchies, cross-platform.

**Disadvantages:** No automated scheduling, simple priority tags rather than computed scores, no awareness of time availability or cognitive load, no academic-specific features.

### 2.2.4 AI-Powered Adaptive Scheduling Systems

A newer category of study tools uses artificial intelligence or algorithmic techniques to generate and adapt study schedules automatically. Zawacki-Richter et al. (2019) conducted a systematic review of AI applications in higher education and found growing interest in personalised learning tools, though they noted that most existing AI applications focus on assessment and tutoring rather than study scheduling.

**Advantages:** Automated plan generation, multi-variable consideration, adaptive to changes, can incorporate evidence-based learning principles.

**Disadvantages:** May be opaque ("black box"), requires accurate input, often proprietary with subscription costs, may over-optimise at the expense of student autonomy.

**StudyPilot falls into this fourth category**, implementing a custom priority-based algorithm that is transparent (students can see priority scores), adaptive (rollover for missed sessions), and free to use.

## 2.3 Comparison of Existing Study Scheduling Systems

**Table 2.1: Comparison of Existing Study Scheduling Systems**

| Feature | Google Calendar | Todoist | My Study Life | Chipper | StudyPilot (This Project) |
|---|---|---|---|---|---|
| **Platform** | Web, iOS, Android | Web, iOS, Android | Web, iOS, Android | iOS, Android | Web (Responsive) |
| **Cost** | Free | Freemium | Free | Freemium | Free |
| **Course-Aware** | No | No | Yes | Yes | Yes |
| **Exam Date Tracking** | Manual events | Manual due dates | Yes | Yes | Yes |
| **Automatic Prioritisation** | No | Simple tags | No | Partial | Yes (Weighted algorithm) |
| **Daily Plan Generation** | No | No | No | Yes | Yes |
| **Priority Engine/Algorithm** | No | No | No | Proprietary | Custom weighted score |
| **Cognitive Load Management** | No | No | No | No | Yes (Hard topic limits) |
| **Confidence Tracking** | No | No | No | No | Yes (1–5 per course) |
| **Credit Unit Weighting** | No | No | No | No | Yes |
| **Rollover/Rescheduling** | No | No | No | Yes | Yes |
| **Study Streak Tracking** | No | Partial | No | Yes | Yes |
| **At-Risk Course Alerts** | No | No | No | Partial | Yes |
| **Morning/Evening Check-in** | No | No | No | Partial | Yes |
| **Free Time Window Detection** | No | No | No | No | Yes |

The comparison reveals that while existing tools offer partial solutions, **no single existing system combines** automatic priority-based course ranking, credit unit weighting, confidence tracking, cognitive load management, free time window detection, and adaptive rollover — all of which are implemented in StudyPilot.

## 2.4 Review of Related Project Work

**Table 2.2: Review of Related Project Work**

| S/N | Author(s) & Year | Project Title | Methodology/Approach | Key Features | Limitations | Relevance to This Project |
|---|---|---|---|---|---|---|
| 1 | Tan, J. S. et al. (2021) | A Survey of Optimisation Methodologies in School Timetabling Problems | Literature survey; constraint satisfaction and metaheuristic analysis | Comprehensive review of scheduling algorithms including priority-based heuristics and constraint satisfaction | Focuses on institutional class timetabling, not personal study scheduling; no student-facing application | Validated priority-based and constraint satisfaction approaches as effective scheduling methods; informed the design of StudyPilot's daily plan generation algorithm |
| 2 | Okonkwo, C. & Ade-Ibijola, A. (2021) | Chatbot Applications in Education: A Systematic Review | Systematic literature review; NLP analysis | Surveyed 53 chatbot studies in education; categorised use cases including student support and academic planning | Text-based interface limits usability for scheduling; no visual plan output; no priority engine | Demonstrated strong demand for intelligent student-facing academic tools; validated the importance of exam countdown features adopted in StudyPilot |
| 3 | Zawacki-Richter, O. et al. (2019) | Systematic Review of AI Applications in Higher Education | Systematic review of 146 studies | Categorised AI applications: profiling, assessment, adaptive systems, intelligent tutoring | Found few applications targeting personal study scheduling; most AI focused on assessment and tutoring | Identified the gap in AI-powered personal study scheduling tools that StudyPilot addresses; validated the need for adaptive learning support systems |
| 4 | Wolters, C. A. & Brady, A. C. (2021) | College Students' Time Management: A Self-Regulated Learning Perspective | Theoretical review; SRL framework analysis | Linked time management to self-regulated learning phases (forethought, performance, self-reflection) | Theoretical review only — no software tool developed; no empirical intervention tested | Provided the theoretical foundation for StudyPilot's morning check-in (forethought), study execution (performance), and evening check-in (self-reflection) workflow |
| 5 | Adams, R. V. & Blair, E. (2019) | Impact of Time Management Behaviors on Undergraduate Engineering Students' Performance | Quantitative survey; Time Management Behavior Scale | Found perceived control of time correlates with GPA; time management accounts for 12.16% of GPA variance | Descriptive study only — no tool or intervention developed; focused on engineering students | Validated that giving students a sense of control over their study schedule (as StudyPilot does) correlates with better academic performance |

### Summary of Gaps Identified

From the review of related works, the following gaps were identified that this project addresses:

1. **No existing system combines all four priority factors** (urgency, credit units, confidence, workload) into a single weighted algorithm for course-level prioritisation. While Tan et al. (2021) reviewed scheduling algorithms, none were applied to personal study planning with these specific academic factors.

2. **Cognitive load management** (limiting hard topics per day) is absent from all reviewed systems. While Sweller et al. (2019) firmly established the importance of managing cognitive load in learning, no reviewed application implements this as an automated scheduling constraint.

3. **Free time window detection** (calculating available study time from wake/sleep times and commitments) is not implemented in any reviewed system.

4. **Morning and evening check-in workflows** as a structured daily interaction pattern is unique to StudyPilot. Wolters and Brady (2021) provided the theoretical basis for this design through the SRL forethought–performance–reflection cycle, but no reviewed tool implements it.

5. **AI-powered study scheduling** remains an underexplored area. Zawacki-Richter et al. (2019) found that most AI in higher education targets assessment and tutoring — not personal study planning. StudyPilot fills this gap with a transparent, algorithmic approach.

---

### References

Adams, R. V., & Blair, E. (2019). Impact of time management behaviors on undergraduate engineering students' performance. *SAGE Open*, 9(1), 1–11. https://doi.org/10.1177/2158244018824506

Aeon, B., & Aguinis, H. (2017). It's about time: New perspectives and insights on time management. *Academy of Management Perspectives*, 31(4), 309–330. https://doi.org/10.5465/amp.2016.0166

Okonkwo, C. W., & Ade-Ibijola, A. (2021). Chatbot applications in education: A systematic review. *Computers and Education: Artificial Intelligence*, 2, 100033. https://doi.org/10.1016/j.caeai.2021.100033

Silberschatz, A., Galvin, P. B., & Gagne, G. (2018). *Operating System Concepts* (10th ed.). John Wiley & Sons.

Sweller, J., van Merriënboer, J. J. G., & Paas, F. (2019). Cognitive architecture and instructional design: 20 years later. *Educational Psychology Review*, 31(2), 261–292. https://doi.org/10.1007/s10648-019-09465-5

Tan, J. S., Goh, S. L., Kendall, G., & Sabar, N. R. (2021). A survey of the state-of-the-art of optimisation methodologies in school timetabling problems. *Expert Systems with Applications*, 165, 113943. https://doi.org/10.1016/j.eswa.2020.113943

Wolters, C. A., & Brady, A. C. (2021). College students' time management: A self-regulated learning perspective. *Educational Psychology Review*, 33, 1319–1351. https://doi.org/10.1007/s10648-020-09519-z

Zawacki-Richter, O., Marín, V. I., Bond, M., & Gouverneur, F. (2019). Systematic review of research on artificial intelligence applications in higher education — where are the educators? *International Journal of Educational Technology in Higher Education*, 16(1), 1–27. https://doi.org/10.1186/s41239-019-0171-0
